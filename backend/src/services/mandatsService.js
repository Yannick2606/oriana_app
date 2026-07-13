import { resourceMatchesScope } from '../middlewares/scopeByRole.js';
import { peutEcrire, peutLire, validerTransitionExclusivite } from './exclusiviteService.js';

const fields = [
  'numero', 'numero_registre', 'offre_id', 'societe_mandante', 'type', 'nature', 'avancement',
  'date_debut', 'date_fin', 'honoraires_mode', 'honoraires_montant', 'honoraires_charge', 'donnee_exclusive',
];
const types = new Set(['exclusif', 'simple', 'co-mandat']);
const natures = new Set(['vente', 'location']);

export class MandatsError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'MandatsError';
    this.status = status;
    this.code = code;
  }
}

function filtersForGrist(scope) {
  return Object.fromEntries(Object.entries(scope).map(([field, value]) => [field, [value]]));
}

function positiveId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new MandatsError('Identifiant invalide', 400, 'INVALID_ID');
  }
  return id;
}

function normalizeDate(value) {
  if (value === undefined || value === null || value === '') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new MandatsError('Date invalide', 400, 'INVALID_DATE');
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) {
    throw new MandatsError('Date invalide', 400, 'INVALID_DATE');
  }
  return timestamp / 1000;
}

function sanitize(input, update = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new MandatsError('Corps invalide', 400, 'INVALID_REQUEST');
  }
  if ('agence_id' in input || 'gestionnaire' in input || (!update && 'donnee_exclusive' in input)) {
    throw new MandatsError('Champ géré par le serveur', 400, 'SERVER_MANAGED_FIELD');
  }
  if (Object.keys(input).some((field) => !fields.includes(field))) {
    throw new MandatsError('Champ inconnu', 400, 'UNKNOWN_FIELD');
  }
  const data = Object.fromEntries(fields.filter((field) => field in input).map((field) => [field, input[field]]));
  for (const field of ['date_debut', 'date_fin']) {
    if (field in data) data[field] = normalizeDate(data[field]);
  }
  if ('honoraires_montant' in data
    && (typeof data.honoraires_montant !== 'number'
      || !Number.isFinite(data.honoraires_montant)
      || Math.abs(data.honoraires_montant) > Number.MAX_SAFE_INTEGER)) {
    throw new MandatsError('Honoraires invalides', 400, 'INVALID_NUMBER');
  }
  return data;
}

function compatible(offerNature, mandateNature) {
  return offerNature === 'vente_et_location' || offerNature === mandateNature;
}

export function createMandatsService(client) {
  async function scopedMandate(id, user, write = false) {
    const mandate = await client.getById('Mandats', positiveId(id));
    if (!mandate) throw new MandatsError('Mandat introuvable', 404, 'NOT_FOUND');
    if (!(write ? peutEcrire(mandate, user) : peutLire(mandate, user))) {
      throw new MandatsError('Mandat hors périmètre', 403, 'FORBIDDEN');
    }
    return mandate;
  }

  async function validate(data, accessScope, current) {
    const merged = { ...current?.fields, ...data };
    if (!types.has(merged.type) || !natures.has(merged.nature)) {
      throw new MandatsError('Type ou nature invalide', 400, 'INVALID_MANDATE');
    }
    const offer = await client.getById('Offres', positiveId(merged.offre_id));
    if (!offer || !resourceMatchesScope(offer, accessScope)) {
      throw new MandatsError('Offre hors périmètre', 403, 'RELATION_FORBIDDEN');
    }
    if (!compatible(offer.fields.nature, merged.nature)) {
      throw new MandatsError('Nature incompatible avec l’offre', 400, 'INVALID_NATURE');
    }
    const company = await client.getById('Societes', positiveId(merged.societe_mandante));
    if (!company || String(company.fields.agence_id) !== String(accessScope.agence_id)) {
      throw new MandatsError('Société hors agence', 403, 'RELATION_FORBIDDEN');
    }
    if (merged.date_debut && merged.date_fin && merged.date_fin < merged.date_debut) {
      throw new MandatsError('Période invalide', 400, 'INVALID_PERIOD');
    }
    data.offre_id = offer.id;
    data.societe_mandante = company.id;
  }

  return {
    async list(user) {
      const records = await client.list('Mandats', filtersForGrist({ agence_id: user.agence_id }));
      return records.filter((record) => peutLire(record, user));
    },
    get: scopedMandate,
    async create(input, user, accessScope) {
      const data = sanitize(input);
      if (!('offre_id' in data) || !('societe_mandante' in data)) {
        throw new MandatsError('Offre et société requises', 400, 'RELATION_REQUIRED');
      }
      await validate(data, accessScope);
      return client.create('Mandats', {
        ...data, gestionnaire: user.id, donnee_exclusive: true, agence_id: user.agence_id,
      });
    },
    async update(id, input, user, accessScope) {
      const current = await scopedMandate(id, user, true);
      const data = sanitize(input, true);
      validerTransitionExclusivite(current, data.donnee_exclusive, user, MandatsError);
      await validate(data, accessScope, current);
      return client.update('Mandats', current.id, data);
    },
    async delete(id, user) {
      const mandate = await scopedMandate(id, user, true);
      await client.delete('Mandats', mandate.id);
    },
  };
}

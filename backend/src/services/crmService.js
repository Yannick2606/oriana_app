import {
  estManager, peutEcrire, peutLire, validerTransitionExclusivite,
} from './exclusiviteService.js';

const configs = {
  societes: {
    table: 'Societes',
    fields: ['raison_sociale', 'enseigne', 'siren', 'siret', 'code_ape', 'libelle_ape', 'forme_juridique',
      'capital', 'effectif_salarie', 'adresse_siege', 'contact_principal', 'type_relation'],
    required: ['raison_sociale'],
    choices: { type_relation: new Set(['proprietaire', 'prospect', 'preneur', 'partenaire']) },
  },
  contacts: {
    table: 'Contacts',
    fields: ['nom', 'prenom', 'fonction', 'email', 'tel', 'mobile', 'societe_id'],
    required: ['nom', 'societe_id'], choices: {},
  },
  demandes: {
    table: 'Demandes',
    fields: ['societe_id', 'contact_id', 'nature_transaction', 'familles', 'surface_min', 'surface_max',
      'budget_min', 'budget_max', 'secteur_geo', 'criteres_specifiques'],
    required: ['societe_id', 'contact_id', 'nature_transaction'],
    choices: { nature_transaction: new Set(['vente', 'location', 'les_deux']) },
  },
};

export class CrmError extends Error {
  constructor(message, status, code) { super(message); this.name = 'CrmError'; this.status = status; this.code = code; }
}

function id(value) {
  const result = Number.parseInt(value, 10);
  if (!Number.isInteger(result) || result <= 0) throw new CrmError('Identifiant invalide', 400, 'INVALID_ID');
  return result;
}

function sanitize(config, input, update = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CrmError('Corps invalide', 400, 'INVALID_REQUEST');
  if ('agence_id' in input || 'gestionnaire' in input || (!update && 'donnee_exclusive' in input)) {
    throw new CrmError('Champ géré par le serveur', 400, 'SERVER_MANAGED_FIELD');
  }
  const allowed = update ? [...config.fields, 'donnee_exclusive'] : config.fields;
  if (Object.keys(input).some((field) => !allowed.includes(field))) throw new CrmError('Champ inconnu', 400, 'UNKNOWN_FIELD');
  const data = Object.fromEntries(allowed.filter((field) => field in input).map((field) => [field, input[field]]));
  for (const [field, values] of Object.entries(config.choices)) {
    if (field in data && !values.has(data[field])) throw new CrmError('Valeur invalide', 400, 'INVALID_CHOICE');
  }
  for (const field of ['capital', 'effectif_salarie', 'surface_min', 'surface_max', 'budget_min', 'budget_max']) {
    if (field in data && data[field] !== null
      && (typeof data[field] !== 'number' || !Number.isFinite(data[field]) || Math.abs(data[field]) > Number.MAX_SAFE_INTEGER)) {
      throw new CrmError('Nombre invalide', 400, 'INVALID_NUMBER');
    }
  }
  return data;
}

export function createCrmService(client) {
  async function load(resource, recordId) {
    const config = configs[resource];
    if (!config) throw new CrmError('Ressource invalide', 404, 'NOT_FOUND');
    const record = await client.getById(config.table, id(recordId));
    if (!record) throw new CrmError('Fiche introuvable', 404, 'NOT_FOUND');
    return { config, record };
  }

  async function readable(resource, recordId, user) {
    const result = await load(resource, recordId);
    if (!peutLire(result.record, user)) throw new CrmError('Fiche hors périmètre', 403, 'FORBIDDEN');
    return result;
  }

  async function relation(resource, recordId, user) {
    return (await readable(resource, recordId, user)).record;
  }

  async function validate(resource, data, user, current) {
    const merged = { ...current?.fields, ...data };
    if (resource === 'societes') {
      if (merged.adresse_siege) {
        const address = await client.getById('Adresses', id(merged.adresse_siege));
        if (!address || String(address.fields.agence_id) !== String(user.agence_id)) throw new CrmError('Adresse hors agence', 403, 'RELATION_FORBIDDEN');
        data.adresse_siege = address.id;
      }
      if (merged.contact_principal) {
        if (!current) throw new CrmError('Le contact principal se rattache après création', 400, 'INVALID_RELATION');
        const contact = await relation('contacts', merged.contact_principal, user);
        if (String(contact.fields.societe_id) !== String(current.id)) throw new CrmError('Contact incohérent', 400, 'INVALID_RELATION');
        data.contact_principal = contact.id;
      }
    }
    if (resource === 'contacts') {
      const company = await relation('societes', merged.societe_id, user);
      data.societe_id = company.id;
    }
    if (resource === 'demandes') {
      const [company, contact] = await Promise.all([
        relation('societes', merged.societe_id, user), relation('contacts', merged.contact_id, user),
      ]);
      if (String(contact.fields.societe_id) !== String(company.id)) throw new CrmError('Contact incohérent', 400, 'INVALID_RELATION');
      data.societe_id = company.id; data.contact_id = contact.id;
      if (merged.surface_min != null && merged.surface_max != null && merged.surface_min > merged.surface_max) throw new CrmError('Surfaces invalides', 400, 'INVALID_RANGE');
      if (merged.budget_min != null && merged.budget_max != null && merged.budget_min > merged.budget_max) throw new CrmError('Budgets invalides', 400, 'INVALID_RANGE');
    }
  }

  return {
    async list(resource, user) {
      const config = configs[resource];
      if (!config) throw new CrmError('Ressource invalide', 404, 'NOT_FOUND');
      const records = await client.list(config.table, { agence_id: [user.agence_id] });
      return records.filter((record) => peutLire(record, user));
    },
    async get(resource, recordId, user) { return (await readable(resource, recordId, user)).record; },
    async create(resource, input, user) {
      const config = configs[resource]; const data = sanitize(config, input);
      if (config.required.some((field) => data[field] === undefined || data[field] === null || data[field] === '')) throw new CrmError('Champ requis', 400, 'REQUIRED_FIELD');
      await validate(resource, data, user);
      return client.create(config.table, { ...data, gestionnaire: user.id, donnee_exclusive: true, agence_id: user.agence_id });
    },
    async update(resource, recordId, input, user) {
      const { config, record } = await load(resource, recordId);
      if (!peutEcrire(record, user)) throw new CrmError('Écriture interdite', 403, 'FORBIDDEN');
      const data = sanitize(config, input, true);
      validerTransitionExclusivite(record, data.donnee_exclusive, user, CrmError);
      await validate(resource, data, user, record);
      return client.update(config.table, record.id, data);
    },
    async delete(resource, recordId, user) {
      if (!estManager(user)) throw new CrmError('Suppression interdite', 403, 'FORBIDDEN');
      const { config, record } = await load(resource, recordId);
      if (!peutEcrire(record, user)) throw new CrmError('Suppression interdite', 403, 'FORBIDDEN');
      await client.delete(config.table, record.id);
    },
  };
}

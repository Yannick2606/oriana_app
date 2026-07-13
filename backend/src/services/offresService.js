import { resourceMatchesScope } from '../middlewares/scopeByRole.js';

const offerFields = [
  'numero', 'nom', 'lot_id', 'nature', 'type_contrat', 'occupation',
  'stade_commercialisation', 'co_gestionnaires',
];
const conditionFields = [
  'offre_id', 'type', 'prix_vente', 'loyer_ht_m2_an', 'loyer_global_an',
  'charges_ht_m2_an', 'depot_garantie', 'taxe_fonciere', 'teom', 'cfe',
  'taux_net_initial', 'taux_net_potentiel', 'disponibilite',
];
const natures = new Set(['vente', 'location', 'vente_et_location']);
const conditionTypes = new Set(['vente', 'location']);

export class OffresError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'OffresError';
    this.status = status;
    this.code = code;
  }
}

function filtersForGrist(scope) {
  return Object.fromEntries(Object.entries(scope).map(([field, value]) => [field, [value]]));
}

function objectInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new OffresError('Corps invalide', 400, 'INVALID_REQUEST');
  }
}

function sanitize(input, allowed, forbidden = []) {
  objectInput(input);
  if (forbidden.some((field) => field in input)) {
    throw new OffresError('Champ géré par le serveur', 400, 'SERVER_MANAGED_FIELD');
  }
  if (Object.keys(input).some((field) => !allowed.includes(field))) {
    throw new OffresError('Champ inconnu', 400, 'UNKNOWN_FIELD');
  }
  return Object.fromEntries(allowed.filter((field) => field in input).map((field) => [field, input[field]]));
}

function positiveId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new OffresError('Identifiant invalide', 400, 'INVALID_ID');
  }
  return id;
}

function referenceIds(value) {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new OffresError('Liste de références invalide', 400, 'INVALID_REFERENCE');
  }
  const ids = value.filter((item) => item !== 'L').map(positiveId);
  return ['L', ...ids];
}

function typeAllowed(nature, type) {
  return nature === 'vente_et_location' || nature === type;
}

export function createOffresService(client) {
  async function scopedOffer(id, accessScope) {
    const offer = await client.getById('Offres', positiveId(id));
    if (!offer) {
      throw new OffresError('Offre introuvable', 404, 'NOT_FOUND');
    }
    if (!resourceMatchesScope(offer, accessScope)) {
      throw new OffresError('Offre hors périmètre', 403, 'FORBIDDEN');
    }
    return offer;
  }

  async function validateOfferRelations(data, accessScope) {
    if ('lot_id' in data) {
      const lot = await client.getById('Lots', positiveId(data.lot_id));
      if (!lot || !resourceMatchesScope(lot, accessScope)) {
        throw new OffresError('Lot hors périmètre', 403, 'RELATION_FORBIDDEN');
      }
      data.lot_id = lot.id;
    }
    if ('co_gestionnaires' in data) {
      data.co_gestionnaires = referenceIds(data.co_gestionnaires);
      for (const userId of data.co_gestionnaires.slice(1)) {
        const user = await client.getById('Utilisateurs', userId);
        if (!user || String(user.fields.agence_id) !== String(accessScope.agence_id)) {
          throw new OffresError('Co-gestionnaire hors agence', 403, 'RELATION_FORBIDDEN');
        }
      }
    }
  }

  async function scopedCondition(id, accessScope) {
    const condition = await client.getById('Conditions_Financieres', positiveId(id));
    if (!condition) {
      throw new OffresError('Condition introuvable', 404, 'NOT_FOUND');
    }
    await scopedOffer(condition.fields.offre_id, accessScope);
    return condition;
  }

  async function validateCondition(data, accessScope, currentId) {
    const offer = await scopedOffer(data.offre_id, accessScope);
    if (!conditionTypes.has(data.type) || !typeAllowed(offer.fields.nature, data.type)) {
      throw new OffresError('Type incompatible avec la nature', 400, 'INVALID_CONDITION_TYPE');
    }
    const existing = await client.list('Conditions_Financieres', {
      offre_id: [offer.id],
      type: [data.type],
    });
    if (existing.some((record) => record.id !== currentId)) {
      throw new OffresError('Condition déjà présente', 400, 'CONDITION_EXISTS');
    }
    data.offre_id = offer.id;
  }

  return {
    async listOffers(accessScope) {
      return client.list('Offres', filtersForGrist(accessScope));
    },
    getOffer: scopedOffer,
    async createOffer(input, user, accessScope) {
      const data = sanitize(input, offerFields, ['agence_id', 'gestionnaire']);
      if (!natures.has(data.nature)) {
        throw new OffresError('Nature invalide', 400, 'INVALID_NATURE');
      }
      if (!('lot_id' in data)) {
        throw new OffresError('Lot requis', 400, 'LOT_REQUIRED');
      }
      await validateOfferRelations(data, accessScope);
      return client.create('Offres', {
        ...data,
        gestionnaire: user.id,
        agence_id: user.agence_id,
      });
    },
    async updateOffer(id, input, accessScope) {
      const current = await scopedOffer(id, accessScope);
      const data = sanitize(input, offerFields, ['agence_id', 'gestionnaire']);
      const nature = data.nature ?? current.fields.nature;
      if (!natures.has(nature)) {
        throw new OffresError('Nature invalide', 400, 'INVALID_NATURE');
      }
      await validateOfferRelations(data, accessScope);
      if (data.nature && data.nature !== current.fields.nature) {
        const conditions = await client.list('Conditions_Financieres', { offre_id: [current.id] });
        if (conditions.some((condition) => !typeAllowed(data.nature, condition.fields.type))) {
          throw new OffresError('Conditions incompatibles', 400, 'CONDITIONS_INCOMPATIBLE');
        }
      }
      return client.update('Offres', current.id, data);
    },
    async deleteOffer(id, accessScope) {
      const offer = await scopedOffer(id, accessScope);
      const conditions = await client.list('Conditions_Financieres', { offre_id: [offer.id] });
      for (const condition of conditions) {
        await client.delete('Conditions_Financieres', condition.id);
      }
      await client.delete('Offres', offer.id);
    },
    async listConditions(accessScope) {
      const offers = await client.list('Offres', filtersForGrist(accessScope));
      if (offers.length === 0) {
        return [];
      }
      return client.list('Conditions_Financieres', { offre_id: offers.map((offer) => offer.id) });
    },
    getCondition: scopedCondition,
    async createCondition(input, accessScope) {
      const data = sanitize(input, conditionFields);
      data.offre_id = positiveId(data.offre_id);
      await validateCondition(data, accessScope);
      return client.create('Conditions_Financieres', data);
    },
    async updateCondition(id, input, accessScope) {
      const current = await scopedCondition(id, accessScope);
      const patch = sanitize(input, conditionFields);
      const data = {
        ...current.fields,
        ...patch,
        offre_id: positiveId(patch.offre_id ?? current.fields.offre_id),
      };
      await validateCondition(data, accessScope, current.id);
      return client.update('Conditions_Financieres', current.id, patch);
    },
    async deleteCondition(id, accessScope) {
      const condition = await scopedCondition(id, accessScope);
      await client.delete('Conditions_Financieres', condition.id);
    },
  };
}

import { resourceMatchesScope } from './accessPolicy.js';
import { patrimoineConfig } from './patrimoineConfig.js';

export class PatrimoineError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'PatrimoineError';
    this.status = status;
    this.code = code;
  }
}

function configFor(resource) {
  const config = patrimoineConfig[resource];
  if (!config) {
    throw new PatrimoineError('Ressource inconnue', 404, 'NOT_FOUND');
  }
  return config;
}

function persistenceFilters(accessScope) {
  return Object.fromEntries(
    Object.entries(accessScope).map(([field, value]) => [field, Array.isArray(value) ? value : [value]]),
  );
}

function referenceIds(value, list) {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  const values = list ? value : [value];
  if (!Array.isArray(values)) {
    throw new PatrimoineError('Référence invalide', 400, 'INVALID_REFERENCE');
  }

  return values
    .filter((item) => item !== 'L')
    .map((item) => Number.parseInt(item, 10))
    .filter(Number.isInteger);
}

function sanitize(config, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new PatrimoineError('Corps invalide', 400, 'INVALID_REQUEST');
  }

  const forbidden = ['agence_id', 'gestionnaire'].filter((field) => field in data);
  if (forbidden.length > 0) {
    throw new PatrimoineError('Champ géré par le serveur', 400, 'SERVER_MANAGED_FIELD');
  }

  const unknown = Object.keys(data).filter((field) => !config.fields.includes(field));
  if (unknown.length > 0) {
    throw new PatrimoineError('Champ inconnu', 400, 'UNKNOWN_FIELD');
  }

  return Object.fromEntries(config.fields.filter((field) => field in data).map((field) => [field, data[field]]));
}

export function createPatrimoineService(client) {
  async function getScoped(resource, id, accessScope) {
    const record = await client.getById(configFor(resource).table, id);
    return resourceMatchesScope(record, accessScope) ? record : null;
  }

  async function validateRelations(config, data, accessScope) {
    for (const relation of config.relations) {
      if (!(relation.field in data)) {
        continue;
      }

      const ids = referenceIds(data[relation.field], relation.list);
      if (ids.length === 0 && !relation.optional) {
        throw new PatrimoineError('Relation requise', 400, 'RELATION_REQUIRED');
      }

      for (const id of ids) {
        const relationScope = relation.agencyOnly
          ? { agence_id: accessScope.agence_id }
          : accessScope;
        const linked = await getScoped(relation.resource, id, relationScope);
        if (!linked) {
          throw new PatrimoineError('Relation hors périmètre', 403, 'RELATION_FORBIDDEN');
        }
      }

      if (relation.list) {
        data[relation.field] = ['L', ...ids];
      } else if (ids.length > 0) {
        [data[relation.field]] = ids;
      }
    }
  }

  return {
    async list(resource, accessScope) {
      return client.list(configFor(resource).table, persistenceFilters(accessScope));
    },

    getScoped,

    async create(resource, input, user, accessScope) {
      const config = configFor(resource);
      const data = sanitize(config, input);
      await validateRelations(config, data, accessScope);
      return client.create(config.table, {
        ...data,
        agence_id: user.agence_id,
        gestionnaire: user.id,
      });
    },

    async update(resource, id, input, accessScope) {
      const config = configFor(resource);
      const current = await getScoped(resource, id, accessScope);
      if (!current) {
        throw new PatrimoineError('Ressource hors périmètre', 403, 'FORBIDDEN');
      }

      const data = sanitize(config, input);
      await validateRelations(config, data, accessScope);
      return client.update(config.table, id, data);
    },

    async delete(resource, id, accessScope) {
      const current = await getScoped(resource, id, accessScope);
      if (!current) {
        throw new PatrimoineError('Ressource hors périmètre', 403, 'FORBIDDEN');
      }
      await client.delete(configFor(resource).table, id);
    },
  };
}

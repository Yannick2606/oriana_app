import { resourceMatchesScope } from '../middlewares/scopeByRole.js';

const niveaux = {
  batiment: { table: 'Batiments', field: 'batiment_id' },
  cellule: { table: 'Cellules', field: 'cellule_id' },
  lot: { table: 'Lots', field: 'lot_id' },
};

const valueFields = ['valeur_bool', 'valeur_nombre', 'valeur_texte'];

export class QualificationError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'QualificationError';
    this.status = status;
    this.code = code;
  }
}

function listValues(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => item !== 'L').map(String);
}

function levelConfig(niveau) {
  const config = niveaux[niveau];
  if (!config) {
    throw new QualificationError('Niveau invalide', 400, 'INVALID_LEVEL');
  }
  return config;
}

function positiveId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new QualificationError('Identifiant invalide', 400, 'INVALID_ID');
  }
  return id;
}

function serializeValue(input, characteristic) {
  const supplied = valueFields.filter((field) => input[field] !== undefined);
  if (supplied.length !== 1) {
    throw new QualificationError('Une seule valeur est requise', 400, 'INVALID_VALUE');
  }

  const type = characteristic.fields.type_valeur;
  const expected = type === 'bool'
    ? 'valeur_bool'
    : type === 'nombre' ? 'valeur_nombre' : 'valeur_texte';
  if (supplied[0] !== expected) {
    throw new QualificationError('Type de valeur invalide', 400, 'INVALID_VALUE_TYPE');
  }

  const value = input[expected];
  if (expected === 'valeur_bool' && typeof value !== 'boolean') {
    throw new QualificationError('Booléen invalide', 400, 'INVALID_VALUE');
  }
  if (expected === 'valeur_nombre' && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new QualificationError('Nombre invalide', 400, 'INVALID_VALUE');
  }
  if (expected === 'valeur_texte' && typeof value !== 'string') {
    throw new QualificationError('Texte invalide', 400, 'INVALID_VALUE');
  }
  return { [expected]: value };
}

export function createQualificationService(client) {
  async function requireScopedAsset(niveau, id, accessScope) {
    const config = levelConfig(niveau);
    const asset = await client.getById(config.table, positiveId(id));
    if (!asset) {
      throw new QualificationError('Bien introuvable', 404, 'NOT_FOUND');
    }
    if (!resourceMatchesScope(asset, accessScope)) {
      throw new QualificationError('Bien hors périmètre', 403, 'FORBIDDEN');
    }
    return { asset, config };
  }

  async function assetFamilyIds(niveau, asset, accessScope) {
    if (niveau === 'cellule') {
      return asset.fields.type_bien ? [String(asset.fields.type_bien)] : [];
    }
    if (niveau === 'lot') {
      const cells = await Promise.all(listValues(asset.fields.cellules).map((id) => client.getById('Cellules', id)));
      return [...new Set(cells.filter((cell) => cell && resourceMatchesScope(cell, accessScope)).map((cell) => cell.fields.type_bien).filter(Boolean).map(String))];
    }
    const filters = Object.fromEntries(Object.entries(accessScope).map(([field, value]) => [field, [value]]));
    const cells = await client.list('Cellules', { ...filters, batiment_id: [asset.id] });
    return [...new Set(cells.map((cell) => cell.fields.type_bien).filter(Boolean).map(String))];
  }

  return {
    async dictionary(famille, niveau) {
      levelConfig(niveau);
      if (typeof famille !== 'string' || !famille.trim()) {
        throw new QualificationError('Famille requise', 400, 'FAMILY_REQUIRED');
      }

      const familyReference = famille.trim();
      const family = /^\d+$/.test(familyReference)
        ? await client.getById('Ref_Familles', positiveId(familyReference))
        : (await client.list('Ref_Familles', { code: [familyReference] }))[0];
      if (!family) {
        return [];
      }
      const familyId = String(family.id);
      const characteristics = await client.list('Ref_Caracteristiques');
      return characteristics.filter((record) => (
        listValues(record.fields.familles).includes(familyId)
        && listValues(record.fields.niveaux).includes(niveau)
      ));
    },

    async listValues(niveau, id, accessScope) {
      const { config } = await requireScopedAsset(niveau, id, accessScope);
      return client.list('Caracteristiques_Bien', {
        agence_id: [accessScope.agence_id],
        niveau: [niveau],
        [config.field]: [positiveId(id)],
      });
    },

    async createValue(input, user, accessScope) {
      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new QualificationError('Corps invalide', 400, 'INVALID_REQUEST');
      }

      const config = levelConfig(input.niveau);
      const expectedKeys = new Set([
        'caracteristique_id', 'niveau', config.field, ...valueFields,
      ]);
      if (Object.keys(input).some((field) => !expectedKeys.has(field))) {
        throw new QualificationError('Champ inconnu ou incohérent', 400, 'UNKNOWN_FIELD');
      }

      const assetId = positiveId(input[config.field]);
      const { asset } = await requireScopedAsset(input.niveau, assetId, accessScope);
      const characteristic = await client.getById(
        'Ref_Caracteristiques',
        positiveId(input.caracteristique_id),
      );
      if (!characteristic) {
        throw new QualificationError('Caractéristique inconnue', 400, 'INVALID_CHARACTERISTIC');
      }
      if (!listValues(characteristic.fields.niveaux).includes(input.niveau)) {
        throw new QualificationError('Caractéristique incompatible', 400, 'INVALID_CHARACTERISTIC');
      }
      const familyIds = await assetFamilyIds(input.niveau, asset, accessScope);
      if (familyIds.length > 0 && !familyIds.some((id) => listValues(characteristic.fields.familles).includes(id))) {
        throw new QualificationError('Caractéristique incompatible avec la famille', 400, 'INVALID_CHARACTERISTIC');
      }

      const value = serializeValue(input, characteristic);
      const recordData = {
        caracteristique_id: characteristic.id,
        niveau: input.niveau,
        [config.field]: assetId,
        ...value,
        agence_id: user.agence_id,
      };
      const existing = await client.list('Caracteristiques_Bien', {
        agence_id: [user.agence_id],
        niveau: [input.niveau],
        [config.field]: [assetId],
        caracteristique_id: [characteristic.id],
      });
      if (existing.length > 0) {
        return client.update('Caracteristiques_Bien', existing[0].id, value);
      }
      return client.create('Caracteristiques_Bien', recordData);
    },
  };
}

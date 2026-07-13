import { resourceMatchesScope } from '../middlewares/scopeByRole.js';
import { peutLire } from './exclusiviteService.js';

export class MatchingError extends Error {
  constructor(message, status, code) {
    super(message); this.name = 'MatchingError'; this.status = status; this.code = code;
  }
}

function positiveId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0 || String(id) !== String(value)) {
    throw new MatchingError('Demande invalide', 400, 'INVALID_DEMANDE_ID');
  }
  return id;
}

function score(record) {
  const value = record.fields.score_global;
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

export function createMatchingService(client) {
  return {
    async list(demandeId, user, accessScope) {
      const id = positiveId(demandeId);
      const demande = await client.getById('Demandes', id);
      if (!demande) throw new MatchingError('Demande introuvable', 404, 'NOT_FOUND');
      if (!peutLire(demande, user)) throw new MatchingError('Demande hors périmètre', 403, 'FORBIDDEN');

      const [matches, lots] = await Promise.all([
        client.list('Matching_demandes_lots', { demande_id: [id] }),
        client.list('Lots', Object.fromEntries(Object.entries(accessScope).map(([field, value]) => [field, [value]]))),
      ]);
      const allowedLots = new Set(lots.filter((lot) => resourceMatchesScope(lot, accessScope)).map((lot) => String(lot.id)));
      return matches
        .filter((match) => allowedLots.has(String(match.fields.lot_id)))
        .sort((left, right) => score(right) - score(left));
    },
  };
}

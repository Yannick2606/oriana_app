import { MatchingError } from '../services/matchingService.js';

const serialize = (record) => ({ id: record.id, ...record.fields });

export function createMatchingController(service) {
  return async function listMatching(request, response, next) {
    try {
      if (request.query.demande_id === undefined) {
        return response.status(400).json({ error: 'DEMANDE_ID_REQUIRED' });
      }
      const records = await service.list(
        request.query.demande_id, request.session.user, request.accessScope,
      );
      return response.status(200).json({ data: records.map(serialize) });
    } catch (error) {
      if (error instanceof MatchingError) {
        return response.status(error.status).json({ error: error.code });
      }
      return next(error);
    }
  };
}

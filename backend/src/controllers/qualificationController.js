import { QualificationError } from '../services/qualificationService.js';

function serialize(record) {
  return { id: record.id, ...record.fields };
}

function handleError(error, response, next) {
  if (error instanceof QualificationError) {
    return response.status(error.status).json({ error: error.code });
  }
  return next(error);
}

export function createQualificationController(service) {
  return {
    async dictionary(request, response, next) {
      try {
        const records = await service.dictionary(request.query.famille, request.query.niveau);
        return response.status(200).json({ data: records.map(serialize) });
      } catch (error) {
        return handleError(error, response, next);
      }
    },

    async listValues(request, response, next) {
      try {
        const records = await service.listValues(
          request.query.niveau,
          request.query.id,
          request.accessScope,
        );
        return response.status(200).json({ data: records.map(serialize) });
      } catch (error) {
        return handleError(error, response, next);
      }
    },

    async createValue(request, response, next) {
      try {
        const record = await service.createValue(
          request.body,
          request.session.user,
          request.writeScope,
        );
        return response.status(201).json({ data: serialize(record) });
      } catch (error) {
        return handleError(error, response, next);
      }
    },
  };
}

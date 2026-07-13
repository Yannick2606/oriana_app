import { PatrimoineError } from '../services/patrimoineService.js';

function serialize(record) {
  return { id: record.id, ...record.fields };
}

function handleError(error, response, next) {
  if (error instanceof PatrimoineError) {
    return response.status(error.status).json({ error: error.code });
  }
  return next(error);
}

export function createPatrimoineController(resource, service) {
  return {
    async list(request, response, next) {
      try {
        const records = await service.list(resource, request.accessScope);
        return response.status(200).json({ data: records.map(serialize) });
      } catch (error) {
        return handleError(error, response, next);
      }
    },

    get(request, response) {
      return response.status(200).json({ data: serialize(request.resource) });
    },

    async create(request, response, next) {
      try {
        const record = await service.create(
          resource,
          request.body,
          request.session.user,
          request.accessScope,
        );
        return response.status(201).json({ data: serialize(record) });
      } catch (error) {
        return handleError(error, response, next);
      }
    },

    async update(request, response, next) {
      try {
        const record = await service.update(resource, request.params.id, request.body, request.accessScope);
        return response.status(200).json({ data: serialize(record) });
      } catch (error) {
        return handleError(error, response, next);
      }
    },

    async delete(request, response, next) {
      try {
        await service.delete(resource, request.params.id, request.accessScope);
        return response.status(200).json({ status: 'ok' });
      } catch (error) {
        return handleError(error, response, next);
      }
    },
  };
}

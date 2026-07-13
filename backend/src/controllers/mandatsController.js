import { MandatsError } from '../services/mandatsService.js';

function serialize(record) { return { id: record.id, ...record.fields }; }
function handle(error, response, next) {
  return error instanceof MandatsError
    ? response.status(error.status).json({ error: error.code })
    : next(error);
}

export function createMandatsController(service) {
  return {
    async list(request, response, next) {
      try {
        const records = await service.list(request.session.user);
        return response.status(200).json({ data: records.map(serialize) });
      } catch (error) { return handle(error, response, next); }
    },
    async get(request, response, next) {
      try {
        return response.status(200).json({
          data: serialize(await service.get(request.params.id, request.session.user)),
        });
      } catch (error) { return handle(error, response, next); }
    },
    async create(request, response, next) {
      try {
        const record = await service.create(request.body, request.session.user, request.accessScope);
        return response.status(201).json({ data: serialize(record) });
      } catch (error) { return handle(error, response, next); }
    },
    async update(request, response, next) {
      try {
        const record = await service.update(request.params.id, request.body, request.session.user, request.accessScope);
        return response.status(200).json({ data: serialize(record) });
      } catch (error) { return handle(error, response, next); }
    },
    async delete(request, response, next) {
      try {
        await service.delete(request.params.id, request.session.user);
        return response.status(200).json({ status: 'ok' });
      } catch (error) { return handle(error, response, next); }
    },
  };
}

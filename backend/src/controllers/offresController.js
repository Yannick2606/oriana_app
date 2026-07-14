import { OffresError } from '../services/offresService.js';

function serialize(record) {
  return { id: record.id, ...record.fields };
}

function handle(error, response, next) {
  return error instanceof OffresError
    ? response.status(error.status).json({ error: error.code })
    : next(error);
}

export function createOffresController(service) {
  function resource(method, created = false) {
    return async (request, response, next) => {
      try {
        const record = await method(request);
        return response.status(created ? 201 : 200).json({ data: serialize(record) });
      } catch (error) {
        return handle(error, response, next);
      }
    };
  }

  return {
    listOffers: async (request, response, next) => {
      try {
        const records = await service.listOffers(request.accessScope);
        return response.status(200).json({ data: records.map(serialize) });
      } catch (error) { return handle(error, response, next); }
    },
    getOffer: resource((request) => service.getOffer(request.params.id, request.accessScope)),
    createOffer: resource((request) => service.createOffer(
      request.body, request.session.user, request.writeScope,
    ), true),
    updateOffer: resource((request) => service.updateOffer(
      request.params.id, request.body, request.writeScope,
    )),
    deleteOffer: async (request, response, next) => {
      try {
        await service.deleteOffer(request.params.id, request.accessScope);
        return response.status(200).json({ status: 'ok' });
      } catch (error) { return handle(error, response, next); }
    },
    listConditions: async (request, response, next) => {
      try {
        const records = await service.listConditions(request.accessScope);
        return response.status(200).json({ data: records.map(serialize) });
      } catch (error) { return handle(error, response, next); }
    },
    getCondition: resource((request) => service.getCondition(request.params.id, request.accessScope)),
    createCondition: resource((request) => service.createCondition(request.body, request.writeScope), true),
    updateCondition: resource((request) => service.updateCondition(
      request.params.id, request.body, request.writeScope,
    )),
    deleteCondition: async (request, response, next) => {
      try {
        await service.deleteCondition(request.params.id, request.accessScope);
        return response.status(200).json({ status: 'ok' });
      } catch (error) { return handle(error, response, next); }
    },
  };
}

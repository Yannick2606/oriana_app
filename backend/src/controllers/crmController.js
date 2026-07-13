import { CrmError } from '../services/crmService.js';

const serialize = (record) => ({ id: record.id, ...record.fields });
const handle = (error, response, next) => (error instanceof CrmError
  ? response.status(error.status).json({ error: error.code }) : next(error));

export function createCrmController(resource, service) {
  return {
    async list(request, response, next) { try { return response.json({ data: (await service.list(resource, request.session.user)).map(serialize) }); } catch (error) { return handle(error, response, next); } },
    async get(request, response, next) { try { return response.json({ data: serialize(await service.get(resource, request.params.id, request.session.user)) }); } catch (error) { return handle(error, response, next); } },
    async create(request, response, next) { try { return response.status(201).json({ data: serialize(await service.create(resource, request.body, request.session.user)) }); } catch (error) { return handle(error, response, next); } },
    async update(request, response, next) { try { return response.json({ data: serialize(await service.update(resource, request.params.id, request.body, request.session.user)) }); } catch (error) { return handle(error, response, next); } },
    async delete(request, response, next) { try { await service.delete(resource, request.params.id, request.session.user); return response.json({ status: 'ok' }); } catch (error) { return handle(error, response, next); } },
  };
}

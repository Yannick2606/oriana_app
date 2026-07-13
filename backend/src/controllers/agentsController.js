import { AgentsError } from '../services/agentsService.js';

const handle = (error, response, next) => (error instanceof AgentsError
  ? response.status(error.status).json({ error: error.code }) : next(error));
const serialize = (record) => ({ id: record.id, ...record.fields });

export function createAgentsController(service) {
  return {
    async trigger(request, response, next) {
      try { return response.status(202).json(await service.trigger(request.params.agent, request.body, request.session.user)); } catch (error) { return handle(error, response, next); }
    },
    async status(request, response, next) {
      try { return response.status(200).json({ data: serialize(await service.status(request.query, request.session.user)) }); } catch (error) { return handle(error, response, next); }
    },
    async callback(request, response, next) {
      try { await service.callback(request.body); return response.status(202).json({ status: 'accepted' }); } catch (error) { return handle(error, response, next); }
    },
  };
}

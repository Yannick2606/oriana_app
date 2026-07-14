import { FormationError } from '../services/formationService.js';

function handle(error, response, next) { return error instanceof FormationError ? response.status(error.status).json({ error: error.code }) : next(error); }
export function createFormationController(service) {
  return {
    async get(request, response, next) { try { return response.status(200).json({ data: await service.get(request.session.user) }); } catch (error) { return handle(error, response, next); } },
    async update(request, response, next) { try { return response.status(200).json({ data: await service.update(request.session.user, request.body) }); } catch (error) { return handle(error, response, next); } },
  };
}

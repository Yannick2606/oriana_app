import { UtilisateursError } from '../services/utilisateursService.js';

function handle(error, response, next) {
  return error instanceof UtilisateursError
    ? response.status(error.status).json({ error: error.code }) : next(error);
}

export function createUtilisateursController(service) {
  return {
    async list(request, response, next) {
      try { return response.status(200).json({ data: await service.list(request.session.user) }); } catch (error) { return handle(error, response, next); }
    },
    async create(request, response, next) {
      try { return response.status(201).json({ data: await service.create(request.body, request.session.user) }); } catch (error) { return handle(error, response, next); }
    },
    async update(request, response, next) {
      try { return response.status(200).json({ data: await service.update(request.params.id, request.body, request.session.user) }); } catch (error) { return handle(error, response, next); }
    },
    async resetPassword(request, response, next) {
      try {
        return response.status(200).json({
          data: await service.resetPassword(request.params.id, request.body?.mot_de_passe, request.session.user),
        });
      } catch (error) { return handle(error, response, next); }
    },
  };
}

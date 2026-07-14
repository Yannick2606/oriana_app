import { Router } from 'express';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { requireAuth } from '../middlewares/requireAuth.js';

export function createUtilisateursRoutes(controller) {
  const router = Router(); router.use(requireAuth, requireAdmin);
  router.get('/', controller.list); router.post('/', controller.create);
  router.put('/:id/mot-de-passe', controller.resetPassword);
  router.put('/:id', controller.update);
  return router;
}

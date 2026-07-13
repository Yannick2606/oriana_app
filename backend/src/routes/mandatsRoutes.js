import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';
import { requireManager } from '../middlewares/requireManager.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createMandatsRoutes(controller) {
  const router = Router();
  router.use(requireAuth, scopeByRole);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', requireManager, controller.delete);
  return router;
}

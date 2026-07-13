import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';
import { requireManager } from '../middlewares/requireManager.js';
import { requireResourceAccess, scopeByRole } from '../middlewares/scopeByRole.js';
import { patrimoineConfig } from '../services/patrimoineConfig.js';

export function createPatrimoineRoutes(resource, controller, client) {
  const router = Router();
  const table = patrimoineConfig[resource].table;
  const resourceAccess = requireResourceAccess((id) => client.getById(table, id));

  router.use(requireAuth, scopeByRole);
  router.get('/', controller.list);
  router.get('/:id', resourceAccess, controller.get);
  router.post('/', controller.create);
  router.put('/:id', resourceAccess, controller.update);
  router.delete('/:id', requireManager, resourceAccess, controller.delete);

  return router;
}

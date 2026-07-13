import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { createRequireN8nSecret } from '../middlewares/requireN8nSecret.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createAgentsRoutes(controller, callbackSecret) {
  const router = Router();
  router.post('/agents/callback', createRequireN8nSecret(callbackSecret), controller.callback);
  router.post('/agents/:agent/declencher', requireAuth, scopeByRole, controller.trigger);
  router.get('/agents/statut', requireAuth, scopeByRole, controller.status);
  return router;
}

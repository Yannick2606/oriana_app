import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createMatchingRoutes(controller) {
  const router = Router();
  router.get('/matching', requireAuth, scopeByRole, controller);
  return router;
}

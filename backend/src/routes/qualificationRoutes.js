import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createQualificationRoutes(controller) {
  const router = Router();
  router.get('/caracteristiques/dictionnaire', requireAuth, scopeByRole, controller.dictionary);
  router.get('/caracteristiques-bien', requireAuth, scopeByRole, controller.listValues);
  router.post('/caracteristiques-bien', requireAuth, scopeByRole, controller.createValue);
  return router;
}

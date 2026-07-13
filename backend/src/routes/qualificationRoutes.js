import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createQualificationRoutes(controller) {
  const router = Router();
  router.use(requireAuth, scopeByRole);
  router.get('/caracteristiques/dictionnaire', controller.dictionary);
  router.get('/caracteristiques-bien', controller.listValues);
  router.post('/caracteristiques-bien', controller.createValue);
  return router;
}

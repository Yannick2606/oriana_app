import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createSandboxRoutes(controller) {
  const router = Router();
  router.get('/offres', requireAuth, scopeByRole, controller.getOffersDataset);
  return router;
}

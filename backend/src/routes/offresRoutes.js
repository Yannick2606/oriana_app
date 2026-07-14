import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';
import { requireManager } from '../middlewares/requireManager.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createOffresRoutes(controller) {
  const router = Router();
  router.get('/offres', requireAuth, scopeByRole, controller.listOffers);
  router.get('/offres/:id', requireAuth, scopeByRole, controller.getOffer);
  router.post('/offres', requireAuth, scopeByRole, controller.createOffer);
  router.put('/offres/:id', requireAuth, scopeByRole, controller.updateOffer);
  router.delete('/offres/:id', requireAuth, scopeByRole, requireManager, controller.deleteOffer);
  router.get('/conditions-financieres', requireAuth, scopeByRole, controller.listConditions);
  router.get('/conditions-financieres/:id', requireAuth, scopeByRole, controller.getCondition);
  router.post('/conditions-financieres', requireAuth, scopeByRole, controller.createCondition);
  router.put('/conditions-financieres/:id', requireAuth, scopeByRole, controller.updateCondition);
  router.delete('/conditions-financieres/:id', requireAuth, scopeByRole, requireManager, controller.deleteCondition);
  return router;
}

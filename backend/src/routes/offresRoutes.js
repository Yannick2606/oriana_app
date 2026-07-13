import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';
import { requireManager } from '../middlewares/requireManager.js';
import { scopeByRole } from '../middlewares/scopeByRole.js';

export function createOffresRoutes(controller) {
  const router = Router();
  router.use(requireAuth, scopeByRole);
  router.get('/offres', controller.listOffers);
  router.get('/offres/:id', controller.getOffer);
  router.post('/offres', controller.createOffer);
  router.put('/offres/:id', controller.updateOffer);
  router.delete('/offres/:id', requireManager, controller.deleteOffer);
  router.get('/conditions-financieres', controller.listConditions);
  router.get('/conditions-financieres/:id', controller.getCondition);
  router.post('/conditions-financieres', controller.createCondition);
  router.put('/conditions-financieres/:id', controller.updateCondition);
  router.delete('/conditions-financieres/:id', requireManager, controller.deleteCondition);
  return router;
}

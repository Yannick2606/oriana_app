import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';

export function createFormationRoutes(controller) {
  const router = Router();
  router.get('/formation/progression', requireAuth, controller.get);
  router.put('/formation/progression', requireAuth, controller.update);
  return router;
}

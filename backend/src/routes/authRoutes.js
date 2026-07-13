import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';

export function createAuthRoutes(controller) {
  const router = Router();

  router.post('/login', controller.login);
  router.post('/logout', requireAuth, controller.logout);
  router.get('/me', requireAuth, controller.me);

  return router;
}

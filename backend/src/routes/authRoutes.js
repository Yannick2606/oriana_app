import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.js';

export function createAuthRoutes(controller) {
  const router = Router();

  router.post('/login', controller.login);
  router.post('/mot-de-passe/demande', controller.requestPasswordReset);
  router.post('/mot-de-passe/reinitialisation', controller.resetPassword);
  router.post('/logout', requireAuth, controller.logout);
  router.get('/me', requireAuth, controller.me);
  router.post('/role', requireAuth, controller.changeRole);
  router.post('/mot-de-passe/premiere-connexion', requireAuth, controller.changeInitialPassword);

  return router;
}

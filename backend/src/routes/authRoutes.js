import { Router } from 'express';

export function createAuthRoutes(controller) {
  const router = Router();

  router.post('/login', controller.login);
  router.post('/logout', controller.logout);
  router.get('/me', controller.me);

  return router;
}

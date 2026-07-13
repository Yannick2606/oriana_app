import express from 'express';
import session from 'express-session';

import { createAuthController } from './controllers/authController.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { authService as defaultAuthService } from './services/authService.js';

export function createApp({
  authService = defaultAuthService,
  sessionSecret = process.env.SESSION_SECRET,
} = {}) {
  if (!sessionSecret) {
    throw new Error('Configuration de session incomplète : SESSION_SECRET');
  }

  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());
  app.use(session({
    name: 'oriana.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }));
  app.use(healthRoutes);
  app.use('/auth', createAuthRoutes(createAuthController(authService)));

  return app;
}

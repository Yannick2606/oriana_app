import express from 'express';
import session from 'express-session';

import { createAuthController } from './controllers/authController.js';
import { createPatrimoineController } from './controllers/patrimoineController.js';
import { createQualificationController } from './controllers/qualificationController.js';
import { createOffresController } from './controllers/offresController.js';
import { createMandatsController } from './controllers/mandatsController.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { createPatrimoineRoutes } from './routes/patrimoineRoutes.js';
import { createQualificationRoutes } from './routes/qualificationRoutes.js';
import { createOffresRoutes } from './routes/offresRoutes.js';
import { createMandatsRoutes } from './routes/mandatsRoutes.js';
import { authService as defaultAuthService } from './services/authService.js';
import { gristClient } from './services/gristClient.js';
import { patrimoineResources } from './services/patrimoineConfig.js';
import { createPatrimoineService } from './services/patrimoineService.js';
import { createQualificationService } from './services/qualificationService.js';
import { createOffresService } from './services/offresService.js';
import { createMandatsService } from './services/mandatsService.js';

export function createApp({
  authService = defaultAuthService,
  patrimoineClient = gristClient,
  qualificationClient = patrimoineClient,
  offresClient = patrimoineClient,
  mandatsClient = patrimoineClient,
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
  const patrimoineService = createPatrimoineService(patrimoineClient);
  for (const resource of patrimoineResources) {
    const controller = createPatrimoineController(resource, patrimoineService);
    app.use(`/${resource}`, createPatrimoineRoutes(resource, controller, patrimoineClient));
  }
  const qualificationService = createQualificationService(qualificationClient);
  app.use(createQualificationRoutes(createQualificationController(qualificationService)));
  const offresService = createOffresService(offresClient);
  app.use(createOffresRoutes(createOffresController(offresService)));
  const mandatsService = createMandatsService(mandatsClient);
  app.use('/mandats', createMandatsRoutes(createMandatsController(mandatsService)));

  return app;
}

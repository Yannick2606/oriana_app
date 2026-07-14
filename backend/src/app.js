import express from 'express';
import session from 'express-session';

import { createAuthController } from './controllers/authController.js';
import { createPatrimoineController } from './controllers/patrimoineController.js';
import { createQualificationController } from './controllers/qualificationController.js';
import { createOffresController } from './controllers/offresController.js';
import { createMandatsController } from './controllers/mandatsController.js';
import { createCrmController } from './controllers/crmController.js';
import { createMatchingController } from './controllers/matchingController.js';
import { createUtilisateursController } from './controllers/utilisateursController.js';
import { createAgentsController } from './controllers/agentsController.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { createPatrimoineRoutes } from './routes/patrimoineRoutes.js';
import { createQualificationRoutes } from './routes/qualificationRoutes.js';
import { createOffresRoutes } from './routes/offresRoutes.js';
import { createMandatsRoutes } from './routes/mandatsRoutes.js';
import { createCrmRoutes } from './routes/crmRoutes.js';
import { createMatchingRoutes } from './routes/matchingRoutes.js';
import { createUtilisateursRoutes } from './routes/utilisateursRoutes.js';
import { createAgentsRoutes } from './routes/agentsRoutes.js';
import { authService as defaultAuthService } from './services/authService.js';
import { gristClient } from './services/gristClient.js';
import { patrimoineResources } from './services/patrimoineConfig.js';
import { createPatrimoineService } from './services/patrimoineService.js';
import { createQualificationService } from './services/qualificationService.js';
import { createOffresService } from './services/offresService.js';
import { createMandatsService } from './services/mandatsService.js';
import { createCrmService } from './services/crmService.js';
import { createMatchingService } from './services/matchingService.js';
import { createUtilisateursService } from './services/utilisateursService.js';
import { createAgentsService } from './services/agentsService.js';

export function createApp({
  authService = defaultAuthService,
  patrimoineClient = gristClient,
  qualificationClient = patrimoineClient,
  offresClient = patrimoineClient,
  mandatsClient = patrimoineClient,
  crmClient = patrimoineClient,
  matchingClient = patrimoineClient,
  utilisateursClient = patrimoineClient,
  agentsClient = patrimoineClient,
  agentsOptions,
  sessionSecret = process.env.SESSION_SECRET,
} = {}) {
  if (!sessionSecret) {
    throw new Error('Configuration de session incomplète : SESSION_SECRET');
  }

  const app = express();

  app.disable('x-powered-by');
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
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
  const crmService = createCrmService(crmClient);
  for (const resource of ['societes', 'contacts', 'demandes']) {
    app.use(`/${resource}`, createCrmRoutes(createCrmController(resource, crmService)));
  }
  app.use(createMatchingRoutes(createMatchingController(createMatchingService(matchingClient))));
  app.use('/utilisateurs', createUtilisateursRoutes(
    createUtilisateursController(createUtilisateursService(utilisateursClient)),
  ));
  const resolvedAgentsOptions = {
    webhookBaseUrl: agentsOptions?.webhookBaseUrl ?? process.env.N8N_WEBHOOK_BASE_URL,
    sharedSecret: agentsOptions?.sharedSecret ?? process.env.N8N_SHARED_SECRET,
    backendPublicUrl: agentsOptions?.backendPublicUrl ?? process.env.BACKEND_PUBLIC_URL,
    fetchImplementation: agentsOptions?.fetchImplementation ?? fetch,
  };
  app.use(createAgentsRoutes(
    createAgentsController(createAgentsService(agentsClient, resolvedAgentsOptions)),
    resolvedAgentsOptions.sharedSecret,
  ));

  return app;
}

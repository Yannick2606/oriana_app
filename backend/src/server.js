import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

import { createApp } from './app.js';
import { createPostgresPool } from './services/postgres.js';
import { createPostgresSessionStore } from './services/sessionStore.js';
import { createPersistenceClient } from './services/persistence.js';
import { createSandboxAuthService } from './services/sandboxAuthService.js';
import { createSandboxClient } from './services/sandboxClient.js';
import { createSessionInvalidator } from './services/sessionInvalidator.js';
import { createMailService } from './services/mailService.js';
import { createN8nConnector } from './services/n8nConnector.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const sandboxEnabled = process.env.ORIANA_SANDBOX_MODE === '1';
if (sandboxEnabled && process.env.NODE_ENV === 'production') {
  throw new Error('ORIANA_SANDBOX_MODE est interdit en production');
}
const postgresPool = sandboxEnabled ? undefined : createPostgresPool();
const sandboxData = sandboxEnabled
  ? JSON.parse(await readFile(new URL('../fixtures/sandbox/data.json', import.meta.url), 'utf8'))
  : undefined;
const persistenceClient = sandboxEnabled
  ? createSandboxClient(sandboxData, { authEmail: process.env.SANDBOX_USER_EMAIL })
  : createPersistenceClient({
    provider: process.env.PERSISTENCE_PROVIDER ?? 'grist',
    pool: postgresPool,
  });
const sandboxAuthService = sandboxEnabled
  ? createSandboxAuthService({
    email: process.env.SANDBOX_USER_EMAIL,
    passwordHash: process.env.SANDBOX_PASSWORD_HASH,
  })
  : undefined;
const mailer = sandboxEnabled ? undefined : createMailService({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 465),
  user: process.env.SMTP_USER,
  password: process.env.SMTP_APP_PASSWORD,
  from: process.env.MAIL_FROM,
  frontendUrl: process.env.FRONTEND_PUBLIC_URL ?? process.env.FRONTEND_ORIGIN,
});
const agentOrchestrator = createN8nConnector({
  webhookBaseUrl: process.env.N8N_WEBHOOK_BASE_URL,
  sharedSecret: process.env.N8N_SHARED_SECRET,
  backendPublicUrl: process.env.BACKEND_PUBLIC_URL,
});
const app = createApp({
  authService: sandboxAuthService,
  mailer,
  sessionStore: sandboxEnabled ? undefined : createPostgresSessionStore(postgresPool),
  persistenceClient,
  agentOrchestrator,
  agentsCallbackSecret: process.env.N8N_SHARED_SECRET,
  invalidateUserSessions: sandboxEnabled ? undefined : createSessionInvalidator(postgresPool),
  sandboxData,
});

app.listen(port, () => {
  console.log(`orIAna backend listening on port ${port}${sandboxEnabled ? ' (sandbox)' : ''}`);
});

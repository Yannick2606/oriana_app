import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

import { createApp } from './app.js';
import { createPostgresPool } from './services/postgres.js';
import { createPostgresSessionStore } from './services/sessionStore.js';
import { createPersistenceClient } from './services/persistence.js';
import { createSessionInvalidator } from './services/sessionInvalidator.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const sandboxEnabled = process.env.ORIANA_SANDBOX_MODE === '1';
if (sandboxEnabled && process.env.NODE_ENV === 'production') {
  throw new Error('ORIANA_SANDBOX_MODE est interdit en production');
}
const postgresPool = sandboxEnabled ? undefined : createPostgresPool();
const persistenceClient = createPersistenceClient({
  provider: sandboxEnabled ? 'grist' : process.env.PERSISTENCE_PROVIDER,
  pool: postgresPool,
});
const sandboxData = sandboxEnabled
  ? JSON.parse(await readFile(new URL('../fixtures/sandbox/data.json', import.meta.url), 'utf8'))
  : undefined;
const app = createApp({
  sessionStore: sandboxEnabled ? undefined : createPostgresSessionStore(postgresPool),
  patrimoineClient: persistenceClient,
  utilisateursClient: persistenceClient,
  invalidateUserSessions: sandboxEnabled ? undefined : createSessionInvalidator(postgresPool),
  sandboxData,
  agentsOptions: {
    webhookBaseUrl: process.env.N8N_WEBHOOK_BASE_URL,
    sharedSecret: process.env.N8N_SHARED_SECRET,
    backendPublicUrl: process.env.BACKEND_PUBLIC_URL,
  },
});

app.listen(port, () => {
  console.log(`orIAna backend listening on port ${port}${sandboxEnabled ? ' (sandbox)' : ''}`);
});

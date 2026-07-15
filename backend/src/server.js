import 'dotenv/config';

import { createApp } from './app.js';
import { createPostgresPool } from './services/postgres.js';
import { createPostgresSessionStore } from './services/sessionStore.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const postgresPool = createPostgresPool();
const app = createApp({
  sessionStore: createPostgresSessionStore(postgresPool),
  agentsOptions: {
    webhookBaseUrl: process.env.N8N_WEBHOOK_BASE_URL,
    sharedSecret: process.env.N8N_SHARED_SECRET,
    backendPublicUrl: process.env.BACKEND_PUBLIC_URL,
  },
});

app.listen(port, () => {
  console.log(`orIAna backend listening on port ${port}`);
});

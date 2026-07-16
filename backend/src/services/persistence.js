import { gristClient } from './gristClient.js';
import { createPostgresClient } from './postgresClient.js';

export function createPersistenceClient({ provider = process.env.PERSISTENCE_PROVIDER, pool } = {}) {
  if (!provider || provider === 'grist') return gristClient;
  if (provider === 'postgres') {
    if (!pool) throw new Error('Pool PostgreSQL requis pour la persistance métier');
    return createPostgresClient(pool);
  }
  throw new Error(`PERSISTENCE_PROVIDER invalide : ${provider}`);
}

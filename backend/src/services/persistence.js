import { gristClient } from './gristClient.js';
import { createPostgresClient } from './postgresClient.js';

export function createPersistenceClient({ provider, pool } = {}) {
  if (!provider) throw new Error('Fournisseur de persistance requis');
  if (provider === 'grist') return gristClient;
  if (provider === 'postgres') {
    if (!pool) throw new Error('Pool PostgreSQL requis pour la persistance métier');
    return createPostgresClient(pool);
  }
  throw new Error(`PERSISTENCE_PROVIDER invalide : ${provider}`);
}

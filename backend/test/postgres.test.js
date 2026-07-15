import assert from 'node:assert/strict';
import test from 'node:test';

import { testing } from '../src/services/postgres.js';

test('construit une configuration PostgreSQL privée sans URL concaténée', () => {
  const config = testing.readPostgresConfig({
    POSTGRES_HOST: 'postgres', POSTGRES_PORT: '5432', POSTGRES_DB: 'oriana',
    POSTGRES_USER: 'oriana', POSTGRES_PASSWORD: 'valeur-de-test',
  });
  assert.equal(config.host, 'postgres');
  assert.equal(config.port, 5432);
  assert.equal(config.password, 'valeur-de-test');
});

test('refuse une configuration PostgreSQL incomplète', () => {
  assert.throws(() => testing.readPostgresConfig({}), /Configuration PostgreSQL incomplète/);
});

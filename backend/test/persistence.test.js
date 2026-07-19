import assert from 'node:assert/strict';
import test from 'node:test';

import { createPersistenceClient } from '../src/services/persistence.js';
import { testing as postgresClientTesting } from '../src/services/postgresClient.js';
import { createSessionInvalidator } from '../src/services/sessionInvalidator.js';

test('sélectionne explicitement Grist et refuse un fournisseur absent ou inconnu', () => {
  assert.ok(createPersistenceClient({ provider: 'grist' }));
  assert.throws(() => createPersistenceClient(), /Fournisseur de persistance requis/);
  assert.throws(() => createPersistenceClient({ provider: 'inconnu' }), /PERSISTENCE_PROVIDER invalide/);
});

test('invalide les sessions par identifiant sans lire leur contenu', async () => {
  const calls = []; const invalidate = createSessionInvalidator({ query: async (...args) => calls.push(args) });
  await invalidate(42);
  assert.equal(calls[0][0].startsWith('DELETE FROM sessions'), true);
  assert.deepEqual(calls[0][1], ['42']);
});

test('PostgreSQL restitue les dates métier sans heure tout en conservant les horodatages ISO', () => {
  const value = new Date('2023-11-14T00:00:00.000Z');
  assert.equal(postgresClientTesting.readValue(value, 'date_disponibilite'), '2023-11-14');
  assert.equal(postgresClientTesting.readValue(value, 'date_creation'), '2023-11-14T00:00:00.000Z');
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { createPersistenceClient } from '../src/services/persistence.js';
import { createSessionInvalidator } from '../src/services/sessionInvalidator.js';

test('la persistance Grist reste le choix par défaut et un fournisseur inconnu est refusé', () => {
  assert.ok(createPersistenceClient({ provider: 'grist' }));
  assert.throws(() => createPersistenceClient({ provider: 'inconnu' }), /PERSISTENCE_PROVIDER invalide/);
});

test('invalide les sessions par identifiant sans lire leur contenu', async () => {
  const calls = []; const invalidate = createSessionInvalidator({ query: async (...args) => calls.push(args) });
  await invalidate(42);
  assert.equal(calls[0][0].startsWith('DELETE FROM sessions'), true);
  assert.deepEqual(calls[0][1], ['42']);
});

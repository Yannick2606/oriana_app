import assert from 'node:assert/strict';
import test from 'node:test';

import { createN8nConnector, N8nConnectorError } from '../src/services/n8nConnector.js';

test('refuse explicitement une configuration n8n incomplète', () => {
  assert.throws(
    () => createN8nConnector().ensureConfigured(),
    (error) => error instanceof N8nConnectorError && error.code === 'ORCHESTRATION_NOT_CONFIGURED',
  );
});

test('borne et compose le déclenchement asynchrone sans renvoyer le secret', async () => {
  let call;
  const connector = createN8nConnector({
    webhookBaseUrl: 'https://n8n.example.invalid/',
    sharedSecret: 'test-shared-secret',
    backendPublicUrl: 'https://api.example.invalid/',
    fetchImplementation: async (url, options) => { call = { url, options }; return { ok: true }; },
  });

  const result = await connector.trigger({
    agent: 'demonstration', trackingId: 'tracking-id', objectType: 'demande',
    objectId: 20, agencyId: 3, userId: 7,
  });

  assert.equal(result, undefined);
  assert.equal(call.url, 'https://n8n.example.invalid/webhook/oriana-demonstration');
  assert.equal(call.options.signal instanceof globalThis.AbortSignal, true);
  assert.equal(JSON.parse(call.options.body).callback_url, 'https://api.example.invalid/agents/callback');
});

test('distingue un refus n8n d’une indisponibilité réseau', async () => {
  const config = {
    webhookBaseUrl: 'https://n8n.example.invalid', sharedSecret: 'test-shared-secret',
    backendPublicUrl: 'https://api.example.invalid',
  };
  const input = { agent: 'demonstration', trackingId: 'tracking-id', objectType: 'demande', objectId: 20, agencyId: 3, userId: 7 };
  await assert.rejects(
    createN8nConnector({ ...config, fetchImplementation: async () => ({ ok: false }) }).trigger(input),
    (error) => error.code === 'ORCHESTRATION_REJECTED',
  );
  await assert.rejects(
    createN8nConnector({ ...config, fetchImplementation: async () => { throw new Error('network'); } }).trigger(input),
    (error) => error.code === 'ORCHESTRATION_UNAVAILABLE',
  );
});

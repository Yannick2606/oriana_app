import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import { testing } from '../src/services/gristClient.js';

function createResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function setupClient(responseBody) {
  const calls = [];
  const fetchImplementation = async (url, options) => {
    calls.push({ url, options });
    return createResponse(responseBody);
  };
  const client = testing.createClient({
    apiUrl: 'https://grist.invalid',
    apiKey: randomUUID(),
    docId: 'document-test',
  }, fetchImplementation);

  return { calls, client };
}

test('list transmet les filtres et renvoie les enregistrements', async () => {
  const records = [{ id: 1, fields: { nom: 'Test' } }];
  const { calls, client } = setupClient({ records });

  const result = await client.list('Utilisateurs', { actif: [true] });

  assert.deepEqual(result, records);
  assert.match(calls[0].url, /tables\/Utilisateurs\/records\?filter=/);
  assert.equal(calls[0].options.method, undefined);
});

test('getById lit un enregistrement précis', async () => {
  const record = { id: 7, fields: { nom: 'Test' } };
  const { calls, client } = setupClient({
    records: [{ id: 6, fields: { nom: 'Autre' } }, record],
  });

  assert.deepEqual(await client.getById('Utilisateurs', 7), record);
  assert.match(calls[0].url, /tables\/Utilisateurs\/records$/);
});

test('getById renvoie null pour un identifiant absent', async () => {
  const { client } = setupClient({ records: [] });

  assert.equal(await client.getById('Utilisateurs', 999), null);
});

test('create respecte le format records de Grist', async () => {
  const created = { id: 8, fields: { nom: 'Nouveau' } };
  const { calls, client } = setupClient({ records: [created] });

  assert.deepEqual(await client.create('Utilisateurs', created.fields), created);
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body), { records: [{ fields: created.fields }] });
});

test('update respecte le format records de Grist', async () => {
  const updated = { id: 8, fields: { actif: false } };
  const { calls, client } = setupClient({ records: [updated] });

  assert.deepEqual(await client.update('Utilisateurs', 8, updated.fields), updated);
  assert.equal(calls[0].options.method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    records: [{ id: 8, fields: updated.fields }],
  });
});

test('update relit la ligne quand Grist répond sans contenu', async () => {
  const updated = { id: 8, fields: { actif: false } };
  const calls = [];
  const responses = [createResponse(null, 204), createResponse({ records: [updated] })];
  const client = testing.createClient({
    apiUrl: 'https://grist.invalid',
    apiKey: randomUUID(),
    docId: 'document-test',
  }, async (url, options) => {
    calls.push({ url, options });
    return responses.shift();
  });

  assert.deepEqual(await client.update('Utilisateurs', 8, updated.fields), updated);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.method, undefined);
});

test('delete utilise le point de terminaison de suppression Grist', async () => {
  const { calls, client } = setupClient(null);

  assert.equal(await client.delete('Sites', 8), null);
  assert.equal(calls[0].options.method, 'POST');
  assert.match(calls[0].url, /tables\/Sites\/records\/delete$/);
  assert.deepEqual(JSON.parse(calls[0].options.body), [8]);
});

test('une erreur Grist est remontée sans exposer la réponse', async () => {
  const fetchImplementation = async () => createResponse({}, 403);
  const client = testing.createClient({
    apiUrl: 'https://grist.invalid',
    apiKey: randomUUID(),
    docId: 'document-test',
  }, fetchImplementation);

  await assert.rejects(() => client.list('Utilisateurs'), /Erreur Grist \(403\)/);
});

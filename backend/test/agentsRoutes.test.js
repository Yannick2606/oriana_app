import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createRequireN8nSecret } from '../src/middlewares/requireN8nSecret.js';
import { createN8nConnector } from '../src/services/n8nConnector.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
function client() {
  const tables = new Map([
    ['Demandes', [
      { id: 20, fields: { agence_id: 3, gestionnaire: 7, donnee_exclusive: true } },
      { id: 21, fields: { agence_id: 4, gestionnaire: 9, donnee_exclusive: false } },
    ]], ['Traitements_Agents', []],
  ]); let nextId = 100;
  return {
    tables,
    async getById(table, id) { return clone((tables.get(table) ?? []).find((row) => row.id === Number(id)) ?? null); },
    async list(table, filters = {}) { return clone((tables.get(table) ?? []).filter((row) => Object.entries(filters).every(([field, values]) => values.map(String).includes(String(row.fields[field]))))); },
    async create(table, fields) { const row = { id: nextId++, fields: clone(fields) }; tables.get(table).push(row); return clone(row); },
    async update(table, id, fields) { const row = tables.get(table).find((item) => item.id === Number(id)); Object.assign(row.fields, clone(fields)); return clone(row); },
  };
}
const user = { id: 7, roles: ['consultant'], role_actif: 'consultant', agence_id: 3 };
async function agentFor(dataClient, fetchImplementation = async () => ({ ok: true })) {
  const agent = request.agent(createApp({ patrimoineClient: dataClient, agentsClient: dataClient,
    agentOrchestrator: createN8nConnector({ webhookBaseUrl: 'https://n8n.example.invalid',
      sharedSecret: 'test-shared-secret', backendPublicUrl: 'https://api.example.invalid', fetchImplementation }),
    agentsCallbackSecret: 'test-shared-secret',
    sessionSecret: randomBytes(32).toString('hex'), authService: { async login() { return { selectionRequise: false, user }; } } }));
  await agent.post('/auth/login').send({ email: 'test@example.invalid', mot_de_passe: randomBytes(20).toString('hex') }).expect(200);
  return agent;
}

test('déclenche sans attendre le résultat et ne transmet le secret qu’au webhook', async () => {
  const dataClient = client(); let call;
  const agent = await agentFor(dataClient, async (url, options) => { call = { url, options }; return { ok: true }; });
  const response = await agent.post('/agents/demonstration/declencher')
    .send({ objet_type: 'demande', objet_id: 20 }).expect(202);
  assert.equal(response.body.statut_traitement, 'en_attente');
  assert.equal(response.text.includes('test-shared-secret'), false);
  assert.equal(call.url, 'https://n8n.example.invalid/webhook/oriana-demonstration');
  assert.equal(call.options.headers['X-Oriana-Secret'], 'test-shared-secret');
  assert.equal(dataClient.tables.get('Traitements_Agents')[0].fields.statut_traitement, 'en_attente');
});

test('le callback protégé termine le traitement puis le statut restitue le résultat', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient);
  const triggered = await agent.post('/agents/demonstration/declencher').send({ objet_type: 'demande', objet_id: 20 }).expect(202);
  await agent.post('/agents/callback').set('X-Oriana-Secret', 'test-shared-secret')
    .send({ suivi_id: triggered.body.suivi_id, statut: 'termine', resultat: { message: 'ok' } }).expect(202);
  const status = await agent.get('/agents/statut?objet_type=demande&objet_id=20').expect(200);
  assert.equal(status.body.data.statut_traitement, 'termine');
  assert.equal(status.body.data.resultat, JSON.stringify({ message: 'ok' }));
});

test('le callback n8n reste accessible sans session utilisateur', async () => {
  const dataClient = client();
  dataClient.tables.get('Traitements_Agents').push({
    id: 99,
    fields: { suivi_id: 'suivi-sans-session', statut_traitement: 'en_attente' },
  });
  const app = createApp({
    patrimoineClient: dataClient,
    agentsClient: dataClient,
    mailer: { async sendPasswordReset() {} },
    agentOrchestrator: createN8nConnector({ webhookBaseUrl: 'https://n8n.example.invalid',
      sharedSecret: 'test-shared-secret', backendPublicUrl: 'https://api.example.invalid' }),
    agentsCallbackSecret: 'test-shared-secret',
    sessionSecret: randomBytes(32).toString('hex'),
  });

  await request(app).post('/agents/callback').set('X-Oriana-Secret', 'test-shared-secret')
    .send({ suivi_id: 'suivi-sans-session', statut: 'termine', resultat: { message: 'ok' } })
    .expect(202);
  assert.equal(dataClient.tables.get('Traitements_Agents')[0].fields.statut_traitement, 'termine');
});

test('refuse un faux secret, un agent inconnu et une demande hors périmètre', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient);
  await agent.post('/agents/callback').set('X-Oriana-Secret', 'wrong-secret').send({}).expect(401);
  await agent.post('/agents/inconnu/declencher').send({ objet_type: 'demande', objet_id: 20 }).expect(404, { error: 'UNKNOWN_AGENT' });
  await agent.post('/agents/demonstration/declencher').send({ objet_type: 'demande', objet_id: 21 }).expect(403, { error: 'FORBIDDEN' });
});

test('résout le secret du callback au moment de la requête', () => {
  let expected = 'premier-secret';
  const middleware = createRequireN8nSecret(() => expected);
  const response = { status() { throw new Error('Le secret courant devait être accepté'); } };
  expected = 'secret-actualise';
  middleware({ get: () => 'secret-actualise' }, response, () => {});
});

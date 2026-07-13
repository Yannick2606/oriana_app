import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
function client() {
  const tables = new Map([
    ['Demandes', [
      { id: 20, fields: { agence_id: 3, gestionnaire: 7, donnee_exclusive: true } },
      { id: 21, fields: { agence_id: 3, gestionnaire: 8, donnee_exclusive: false } },
      { id: 22, fields: { agence_id: 4, gestionnaire: 9, donnee_exclusive: false } },
    ]],
    ['Lots', [
      { id: 30, fields: { agence_id: 3, gestionnaire: 7 } },
      { id: 31, fields: { agence_id: 3, gestionnaire: 7 } },
      { id: 32, fields: { agence_id: 3, gestionnaire: 8 } },
    ]],
    ['Matching_demandes_lots', [
      { id: 40, fields: { demande_id: 20, lot_id: 30, score_global: 42, scores_detail: 'Grist-42' } },
      { id: 41, fields: { demande_id: 20, lot_id: 31, score_global: 91, scores_detail: 'Grist-91' } },
      { id: 42, fields: { demande_id: 20, lot_id: 32, score_global: 99, scores_detail: 'Grist-99' } },
    ]],
  ]);
  return {
    async getById(table, id) { return clone(tables.get(table)?.find((record) => record.id === Number(id)) ?? null); },
    async list(table, filters = {}) { return clone((tables.get(table) ?? []).filter((record) => Object.entries(filters).every(([field, values]) => values.map(String).includes(String(record.fields[field]))))); },
  };
}

const consultant = { id: 7, roles: ['consultant'], role_actif: 'consultant', agence_id: 3 };
async function agentFor(dataClient, user = consultant) {
  const agent = request.agent(createApp({ patrimoineClient: dataClient, matchingClient: dataClient,
    sessionSecret: randomBytes(32).toString('hex'), authService: { async login() { return { selectionRequise: false, user }; } } }));
  await agent.post('/auth/login').send({ email: `${randomBytes(6).toString('hex')}@example.invalid`, mot_de_passe: randomBytes(20).toString('hex') }).expect(200);
  return agent;
}

test('renvoie les scores Grist triés sans les recalculer', async () => {
  const agent = await agentFor(client());
  const response = await agent.get('/matching?demande_id=20').expect(200);
  assert.deepEqual(response.body.data.map((row) => row.score_global), [91, 42]);
  assert.deepEqual(response.body.data.map((row) => row.scores_detail), ['Grist-91', 'Grist-42']);
});

test('ne révèle pas le lot d’un autre consultant', async () => {
  const agent = await agentFor(client());
  const response = await agent.get('/matching?demande_id=20').expect(200);
  assert.equal(response.body.data.some((row) => row.lot_id === 32), false);
});

test('autorise une demande partagée dans la même agence mais refuse une autre agence', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient);
  await agent.get('/matching?demande_id=21').expect(200);
  await agent.get('/matching?demande_id=22').expect(403, { error: 'FORBIDDEN' });
});

test('valide le paramètre demande_id et exige une session', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient);
  await agent.get('/matching').expect(400, { error: 'DEMANDE_ID_REQUIRED' });
  await agent.get('/matching?demande_id=20x').expect(400, { error: 'INVALID_DEMANDE_ID' });
  await request(createApp({ patrimoineClient: dataClient, matchingClient: dataClient,
    sessionSecret: randomBytes(32).toString('hex') })).get('/matching?demande_id=20').expect(401);
});

import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

function fixture(user) {
  const record = { id: user.id, fields: { progression_formation: '' } };
  const client = {
    async getById(table, id) { return table === 'Utilisateurs' && Number(id) === record.id ? record : null; },
    async update(_table, _id, fields) { Object.assign(record.fields, fields); return record; },
  };
  const app = createApp({ utilisateursClient: client, patrimoineClient: client, sessionSecret: randomBytes(32).toString('hex'),
    authService: { async login() { return { selectionRequise: false, user }; } } });
  return { app, record };
}

async function authenticated(user) {
  const { app, record } = fixture(user); const agent = request.agent(app);
  await agent.post('/auth/login').send({ email: 'formation@example.invalid', mot_de_passe: randomBytes(20).toString('hex') }).expect(200);
  return { agent, record };
}

test('la progression Auto-formation est enregistrée séparément pour le rôle actif', async () => {
  const user = { id: 7, roles: ['consultant', 'master_consultant'], role_actif: 'consultant', agence_id: 3 };
  const { agent, record } = await authenticated(user);
  await agent.get('/formation/progression').expect(200, { data: { role: 'consultant', progression: { etape: 0, statut: 'a_faire' } } });
  await agent.put('/formation/progression').send({ etape: 2, statut: 'en_cours' }).expect(200);
  const stored = JSON.parse(record.fields.progression_formation);
  assert.deepEqual(stored.consultant, { etape: 2, statut: 'en_cours' });
  assert.equal(stored.master_consultant, undefined);
});

test('refuse une progression invalide et une session absente', async () => {
  const user = { id: 7, roles: ['consultant'], role_actif: 'consultant', agence_id: 3 };
  const { app } = fixture(user); const { agent } = await authenticated(user);
  await agent.put('/formation/progression').send({ etape: -1, statut: 'termine' }).expect(400, { error: 'INVALID_PROGRESS' });
  await request(app).get('/formation/progression').expect(401);
});

import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';
import { createSandboxData } from '../src/sandbox/createSandboxData.js';

const consultant = {
  id: 7, nom: 'Consultant', prenom: 'Démo', roles: ['consultant'],
  role_actif: 'consultant', agence_id: 3,
};

function client() {
  return {
    async list() { return []; }, async getById() { return null; },
    async create() { return null; }, async update() { return null; }, async delete() {},
  };
}

function fixture({ sandboxData = createSandboxData(), user = consultant } = {}) {
  const persistence = client();
  const app = createApp({
    patrimoineClient: persistence,
    utilisateursClient: persistence,
    sandboxData,
    sessionSecret: randomBytes(32).toString('hex'),
    authService: { async login() { return { selectionRequise: false, user }; } },
  });
  return request.agent(app);
}

async function login(agent) {
  await agent.post('/auth/login').send({
    email: 'consultant.demo@example.invalid', mot_de_passe: randomBytes(24).toString('hex'),
  }).expect(200);
}

test('expose le jeu Offre fictif uniquement à une session métier autorisée', async () => {
  const agent = fixture();
  await agent.get('/sandbox/offres').expect(401);
  await login(agent);
  const response = await agent.get('/sandbox/offres').expect(200);

  assert.equal(response.body.data.source, 'sandbox');
  assert.equal(response.body.data.Offres.length, 5);
  assert.equal(response.body.data.Medias.length, 5);
  assert.equal('Utilisateurs' in response.body.data, false);
});

test('n’installe aucune route de démonstration sans activation explicite', async () => {
  const agent = fixture({ sandboxData: null });
  await login(agent);
  await agent.get('/sandbox/offres').expect(404);
});

test('refuse le rôle super administrateur sans périmètre métier actif', async () => {
  const agent = fixture({ user: {
    ...consultant, roles: ['super_admin'], role_actif: 'super_admin',
  } });
  await login(agent);
  await agent.get('/sandbox/offres').expect(403);
});

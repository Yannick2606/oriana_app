import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';
import { createSandboxData } from '../src/sandbox/createSandboxData.js';
import { createSandboxClient } from '../src/services/sandboxClient.js';

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
  const persistence = sandboxData
    ? createSandboxClient(sandboxData, { authEmail: 'preview@example.invalid' })
    : client();
  const app = createApp({
    patrimoineClient: persistence,
    crmClient: persistence,
    matchingClient: persistence,
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

test('bloque toute écriture métier dans la prévisualisation', async () => {
  const agent = fixture();
  await login(agent);
  const response = await agent.post('/offres').send({ statut: 'brouillon' }).expect(403);

  assert.equal(response.body.error, 'SANDBOX_READ_ONLY');
});

test('refuse l’administrateur d’agence sans périmètre métier implicite', async () => {
  const agent = fixture({ user: {
    ...consultant, roles: ['admin_agence'], role_actif: 'admin_agence',
  } });
  await login(agent);
  await agent.get('/sandbox/offres').expect(403);
});

test('sert le CRM et les matchings fictifs depuis la persistance isolée', async () => {
  const agent = fixture({ user: {
    id: 1002, nom: 'Mercier', prenom: 'Samir', roles: ['directeur_agence'],
    role_actif: 'directeur_agence', agence_id: 1,
  } });
  await login(agent);

  const [societes, contacts, demandes, matchings] = await Promise.all([
    agent.get('/societes').expect(200),
    agent.get('/contacts').expect(200),
    agent.get('/demandes').expect(200),
    agent.get('/matching?demande_id=1300').expect(200),
  ]);

  assert.equal(societes.body.data.length, 4);
  assert.equal(contacts.body.data.length, 6);
  assert.equal(demandes.body.data.length, 5);
  assert.deepEqual(matchings.body.data.map((entry) => entry.score_global), [94, 82]);
});

test('marque le cookie de session comme sécurisé derrière le proxy de prévisualisation', async () => {
  const persistence = client();
  const app = createApp({
    patrimoineClient: persistence,
    utilisateursClient: persistence,
    sandboxData: createSandboxData(),
    sessionSecret: randomBytes(32).toString('hex'),
    secureCookies: true,
    authService: {
      async login() { return { selectionRequise: false, user: consultant }; },
    },
  });
  const response = await request(app)
    .post('/auth/login')
    .set('X-Forwarded-Proto', 'https')
    .send({
      email: 'consultant.demo@example.invalid',
      mot_de_passe: randomBytes(24).toString('hex'),
    })
    .expect(200);

  assert.match(response.headers['set-cookie'][0], /; Secure;/);
});

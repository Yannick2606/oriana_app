import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';

function testApp() {
  const user = {
    id: 7,
    nom: 'Utilisateur',
    prenom: 'Test',
    roles: ['consultant', 'manager'],
    role_actif: 'consultant',
    agence_id: 3,
  };

  return createApp({
    sessionSecret: randomBytes(32).toString('hex'),
    authService: {
      async login() { return { selectionRequise: false, user }; },
      async changeRole({ roleActif }) { return { ...user, role_actif: roleActif }; },
    },
  });
}

test('la session authentifiée est disponible via /auth/me puis détruite', async () => {
  const agent = request.agent(testApp());
  const credentials = {
    email: `${randomBytes(8).toString('hex')}@example.invalid`,
    mot_de_passe: randomBytes(24).toString('hex'),
  };

  const login = await agent.post('/auth/login').send(credentials).expect(200);
  assert.equal(login.body.user.role_actif, 'consultant');
  assert.equal('agence_id' in login.body.user, false);
  assert.match(login.headers['set-cookie'][0], /HttpOnly/);

  await agent.get('/auth/me').expect(200);
  const changedRole = await agent.post('/auth/role').send({ role_actif: 'manager' }).expect(200);
  assert.equal(changedRole.body.user.role_actif, 'manager');
  assert.equal((await agent.get('/auth/me').expect(200)).body.user.role_actif, 'manager');
  await agent.post('/auth/logout').expect(200);
  await agent.get('/auth/me').expect(401);
});

test('les routes de session refusent un utilisateur non authentifié', async () => {
  const app = testApp();

  await request(app).get('/auth/me').expect(401);
  await request(app).post('/auth/logout').expect(401);
  await request(app).post('/auth/role').send({ role_actif: 'manager' }).expect(401);
});

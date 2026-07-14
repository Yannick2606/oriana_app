import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { createApp } from '../src/app.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
function client() {
  const tables = new Map([
    ['Agences', [{ id: 3, fields: { nom: 'Boréal Nord', actif: true } }]],
    ['Utilisateurs', [{ id: 10, fields: { nom: 'Admin', prenom: 'Existant', email: 'admin@example.invalid',
      role: ['L', 'admin'], agence_id: 3, actif: true, mot_de_passe_hash: 'hash-non-public' } },
    { id: 11, fields: { nom: 'Master', prenom: 'Equipe', email: 'master@example.invalid',
      role: ['L', 'master_consultant'], agence_id: 3, actif: true, mot_de_passe_hash: 'hash-non-public' } }]],
  ]);
  let nextId = 100;
  return {
    tables,
    async list(table, filters = {}) { return clone((tables.get(table) ?? []).filter((record) => Object.entries(filters).every(([field, values]) => values.map(String).includes(String(record.fields[field]))))); },
    async getById(table, id) { return clone((tables.get(table) ?? []).find((record) => record.id === Number(id)) ?? null); },
    async create(table, fields) { const record = { id: nextId++, fields: clone(fields) }; tables.get(table).push(record); return clone(record); },
    async update(table, id, fields) { const record = tables.get(table).find((item) => item.id === Number(id)); Object.assign(record.fields, clone(fields)); return clone(record); },
  };
}

const admin = { id: 10, roles: ['admin'], role_actif: 'admin', agence_id: 3 };
async function agentFor(dataClient, user) {
  const agent = request.agent(createApp({ patrimoineClient: dataClient, utilisateursClient: dataClient,
    sessionSecret: randomBytes(32).toString('hex'), authService: { async login() { return { selectionRequise: false, user }; } } }));
  await agent.post('/auth/login').send({ email: `${randomBytes(6).toString('hex')}@example.invalid`, mot_de_passe: randomBytes(20).toString('hex') }).expect(200);
  return agent;
}

test('un non-admin ne peut ni lister ni créer des utilisateurs', async () => {
  const dataClient = client(); const consultant = { ...admin, role_actif: 'consultant', roles: ['consultant'] };
  const agent = await agentFor(dataClient, consultant);
  await agent.get('/utilisateurs').expect(403, { error: 'FORBIDDEN' });
  await agent.post('/utilisateurs').send({}).expect(403, { error: 'FORBIDDEN' });
});

test('un admin crée un compte multirôle dont le mot de passe est haché et jamais renvoyé', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  const password = randomBytes(18).toString('hex');
  const response = await agent.post('/utilisateurs').send({ nom: 'Martin', prenom: 'Julie',
    email: 'JULIE@EXAMPLE.INVALID', roles: ['consultant', 'manager'], agence_id: 3, mot_de_passe: password }).expect(201);
  assert.equal(response.body.data.email, 'julie@example.invalid');
  assert.deepEqual(response.body.data.roles, ['consultant', 'master_consultant']);
  assert.equal('mot_de_passe_hash' in response.body.data, false);
  assert.equal('mot_de_passe' in response.body.data, false);
  const stored = dataClient.tables.get('Utilisateurs').at(-1).fields;
  assert.deepEqual(stored.role, ['L', 'consultant', 'master_consultant']);
  assert.notEqual(stored.mot_de_passe_hash, password);
  assert.equal(await bcrypt.compare(password, stored.mot_de_passe_hash), true);
  assert.equal(stored.doit_changer_mot_de_passe, true);
});

test('un admin peut désactiver un compte sans exposer son hash', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  const response = await agent.put('/utilisateurs/10').send({ actif: false }).expect(200);
  assert.equal(response.body.data.actif, false);
  assert.equal('mot_de_passe_hash' in response.body.data, false);
});

test('une réinitialisation admin impose un nouveau changement à la connexion', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  const password = randomBytes(18).toString('hex');
  const response = await agent.put('/utilisateurs/10/mot-de-passe').send({ mot_de_passe: password }).expect(200);
  const stored = dataClient.tables.get('Utilisateurs')[0].fields;
  assert.equal(stored.doit_changer_mot_de_passe, true);
  assert.equal(await bcrypt.compare(password, stored.mot_de_passe_hash), true);
  assert.equal('mot_de_passe_hash' in response.body.data, false);
});

test('refuse un email dupliqué, un rôle inconnu et une agence absente', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  const base = { nom: 'Test', prenom: 'Compte', email: 'new@example.invalid', roles: ['consultant'],
    agence_id: 3, mot_de_passe: randomBytes(18).toString('hex') };
  await agent.post('/utilisateurs').send({ ...base, email: 'ADMIN@example.invalid' })
    .expect(409, { error: 'EMAIL_ALREADY_USED' });
  await agent.post('/utilisateurs').send({ ...base, roles: ['super-admin'] })
    .expect(400, { error: 'INVALID_ROLES' });
  await agent.post('/utilisateurs').send({ ...base, agence_id: 999 })
    .expect(400, { error: 'INVALID_AGENCY' });
});

test('refuse l’injection directe d’un hash ou d’un mot de passe en modification', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  await agent.post('/utilisateurs').send({ mot_de_passe_hash: 'interdit' }).expect(400, { error: 'FORBIDDEN_FIELD' });
  await agent.put('/utilisateurs/10').send({ mot_de_passe: randomBytes(18).toString('hex') })
    .expect(400, { error: 'FORBIDDEN_FIELD' });
});

test('rattache un consultant uniquement à un master consultant de son agence', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  const base = { nom: 'Equipe', prenom: 'Consultant', email: 'team@example.invalid', roles: ['consultant'],
    agence_id: 3, master_consultant_id: 11, mot_de_passe: randomBytes(18).toString('hex') };
  const response = await agent.post('/utilisateurs').send(base).expect(201);
  assert.equal(response.body.data.master_consultant_id, 11);
  await agent.post('/utilisateurs').send({ ...base, email: 'invalid-team@example.invalid', roles: ['directeur_agence'] })
    .expect(400, { error: 'INVALID_MASTER_RELATION' });
});

test('relit par email un utilisateur quand Grist répond 204 à la création', async () => {
  const dataClient = client(); const originalCreate = dataClient.create;
  dataClient.create = async (...args) => { await originalCreate(...args); return null; };
  const agent = await agentFor(dataClient, admin);
  const response = await agent.post('/utilisateurs').send({
    nom: 'Relecture', prenom: 'Grist', email: 'readback@example.invalid', roles: ['consultant'],
    agence_id: 3, mot_de_passe: randomBytes(18).toString('hex'),
  }).expect(201);
  assert.equal(response.body.data.email, 'readback@example.invalid');
  assert.equal('mot_de_passe_hash' in response.body.data, false);
});

test('relit par email quand Grist renvoie uniquement l’identifiant créé', async () => {
  const dataClient = client(); const originalCreate = dataClient.create;
  dataClient.create = async (...args) => (await originalCreate(...args)).id;
  const agent = await agentFor(dataClient, admin);
  const response = await agent.post('/utilisateurs').send({
    nom: 'Identifiant', prenom: 'Seul', email: 'id-only@example.invalid', roles: ['manager'],
    agence_id: 3, mot_de_passe: randomBytes(18).toString('hex'),
  }).expect(201);
  assert.equal(response.body.data.email, 'id-only@example.invalid');
  assert.deepEqual(response.body.data.roles, ['master_consultant']);
});

import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { createApp } from '../src/app.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
function client() {
  const tables = new Map([
    ['Agences', [{ id: 3, fields: { nom: 'Boréal Nord', actif: true } }, { id: 4, fields: { nom: 'Boréal Sud', actif: true } }]],
    ['Utilisateurs', [{ id: 10, fields: { nom: 'Admin', prenom: 'Existant', email: 'admin@example.invalid',
      role: ['L', 'admin'], agence_id: 3, actif: true, mot_de_passe_hash: 'hash-non-public' } },
    { id: 11, fields: { nom: 'Master', prenom: 'Equipe', email: 'master@example.invalid',
      role: ['L', 'master_consultant'], agence_id: 3, actif: true, mot_de_passe_hash: 'hash-non-public' } },
    { id: 12, fields: { nom: 'Consultant', prenom: 'Equipe', email: 'consultant@example.invalid',
      role: ['L', 'consultant'], agence_id: 3, actif: true, mot_de_passe_hash: 'hash-non-public' } },
    { id: 13, fields: { nom: 'Directeur', prenom: 'Agence', email: 'directeur@example.invalid',
      role: ['L', 'directeur_agence'], agence_id: 3, actif: true, mot_de_passe_hash: 'hash-non-public' } },
    { id: 14, fields: { nom: 'Consultant', prenom: 'Autre', email: 'autre@example.invalid',
      role: ['L', 'consultant'], agence_id: 4, actif: true, mot_de_passe_hash: 'hash-non-public' } }]],
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
  const response = await agent.put('/utilisateurs/12').send({ actif: false }).expect(200);
  assert.equal(response.body.data.actif, false);
  assert.equal('mot_de_passe_hash' in response.body.data, false);
});

test('une réinitialisation admin impose un nouveau changement à la connexion', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  const password = randomBytes(18).toString('hex');
  const response = await agent.put('/utilisateurs/12/mot-de-passe').send({ mot_de_passe: password }).expect(200);
  const stored = dataClient.tables.get('Utilisateurs')[2].fields;
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
  const forcedAgency = await agent.post('/utilisateurs').send({ ...base, email: 'same-agency@example.invalid', agence_id: 999 }).expect(201);
  assert.equal(forcedAgency.body.data.agence_id, 3);
});

test('refuse l’injection directe d’un hash ou d’un mot de passe en modification', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  await agent.post('/utilisateurs').send({ mot_de_passe_hash: 'interdit' }).expect(400, { error: 'FORBIDDEN_FIELD' });
  await agent.put('/utilisateurs/12').send({ mot_de_passe: randomBytes(18).toString('hex') })
    .expect(400, { error: 'FORBIDDEN_FIELD' });
});

test('un directeur organise et bloque uniquement les consultants et masters de son agence', async () => {
  const dataClient = client();
  const directeur = { id: 13, roles: ['directeur_agence'], role_actif: 'directeur_agence', agence_id: 3 };
  const agent = await agentFor(dataClient, directeur);
  await agent.put('/utilisateurs/12').send({ master_consultant_id: 11, actif: false }).expect(200);
  await agent.put('/utilisateurs/13').send({ actif: false }).expect(403, { error: 'FORBIDDEN' });
  await agent.put('/utilisateurs/12').send({ email: 'interdit@example.invalid' }).expect(403, { error: 'FORBIDDEN' });
  await agent.put('/utilisateurs/12/mot-de-passe').send({ mot_de_passe: randomBytes(18).toString('hex') }).expect(403, { error: 'FORBIDDEN' });
});

test('un admin d’agence ne peut administrer ni son niveau ni un super admin', async () => {
  const dataClient = client(); const agent = await agentFor(dataClient, admin);
  await agent.put('/utilisateurs/10').send({ actif: false }).expect(403, { error: 'FORBIDDEN' });
  await agent.put('/utilisateurs/12').send({ roles: ['super_admin'] }).expect(403, { error: 'FORBIDDEN' });
  await agent.put('/utilisateurs/14').send({ actif: false }).expect(403, { error: 'FORBIDDEN' });
});

test('seul le super admin agit entre agences et attribue super admin', async () => {
  const dataClient = client();
  const superAdmin = { id: 99, roles: ['super_admin'], role_actif: 'super_admin', agence_id: null };
  const agent = await agentFor(dataClient, superAdmin);
  assert.equal((await agent.get('/auth/me')).body.user.role_actif, 'super_admin');
  const listing = await agent.get('/utilisateurs');
  assert.equal(listing.status, 200, JSON.stringify(listing.body));
  const crossAgency = await agent.put('/utilisateurs/14').send({ actif: false });
  assert.equal(crossAgency.status, 200, JSON.stringify(crossAgency.body));
  const promoted = await agent.put('/utilisateurs/13').send({ roles: ['super_admin'] }).expect(200);
  assert.deepEqual(promoted.body.data.roles, ['super_admin']);
});

test('le compte courant multirôle est proposé comme master mais reste protégé', async () => {
  const dataClient = client();
  dataClient.tables.get('Utilisateurs').push({ id: 15, fields: {
    nom: 'Plateforme', prenom: 'Master', email: 'plateforme@example.invalid',
    role: ['L', 'master_consultant', 'super_admin'], agence_id: 3, actif: true,
    mot_de_passe_hash: 'hash-non-public',
  } });
  const actor = { id: 15, roles: ['master_consultant', 'super_admin'], role_actif: 'super_admin', agence_id: 3 };
  const agent = await agentFor(dataClient, actor);

  const listing = await agent.get('/utilisateurs').expect(200);
  const current = listing.body.data.find((item) => item.id === 15);
  assert.equal(current.administrable, false);
  assert.deepEqual(current.roles, ['master_consultant', 'super_admin']);
  await agent.put('/utilisateurs/15').send({ actif: false }).expect(403, { error: 'FORBIDDEN' });
  const consultant = await agent.put('/utilisateurs/12').send({ master_consultant_id: 15 }).expect(200);
  assert.equal(consultant.body.data.master_consultant_id, 15);
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

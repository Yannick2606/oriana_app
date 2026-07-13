import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function memoryClient() {
  const tables = new Map([
    ['Sites', []],
    ['Batiments', []],
    ['Cellules', []],
    ['Lots', []],
    ['Adresses', []],
  ]);
  let nextId = 1;

  return {
    tables,
    async list(table, filters = {}) {
      return (tables.get(table) ?? []).filter((record) => Object.entries(filters).every(
        ([field, values]) => values.map(String).includes(String(record.fields[field])),
      ));
    },
    async getById(table, id) {
      return (tables.get(table) ?? []).find((record) => record.id === Number(id)) ?? null;
    },
    async create(table, fields) {
      const record = { id: nextId, fields: clone(fields) };
      nextId += 1;
      tables.get(table).push(record);
      return clone(record);
    },
    async update(table, id, fields) {
      const record = (tables.get(table) ?? []).find((candidate) => candidate.id === Number(id));
      Object.assign(record.fields, clone(fields));
      return clone(record);
    },
    async delete(table, id) {
      const records = tables.get(table);
      const index = records.findIndex((record) => record.id === Number(id));
      records.splice(index, 1);
    },
  };
}

function appFor(client, user) {
  return createApp({
    patrimoineClient: client,
    sessionSecret: randomBytes(32).toString('hex'),
    authService: {
      async login() {
        return { selectionRequise: false, user };
      },
    },
  });
}

async function authenticatedAgent(client, user) {
  const agent = request.agent(appFor(client, user));
  await agent.post('/auth/login').send({
    email: `${randomBytes(8).toString('hex')}@example.invalid`,
    mot_de_passe: randomBytes(24).toString('hex'),
  }).expect(200);
  return agent;
}

const consultantA = {
  id: 7,
  nom: 'Consultant',
  prenom: 'A',
  roles: ['consultant'],
  role_actif: 'consultant',
  agence_id: 3,
};

test('crée et relit la hiérarchie Site → Bâtiment → Cellule → Lot', async () => {
  const client = memoryClient();
  const agent = await authenticatedAgent(client, consultantA);

  const site = await agent.post('/sites').send({ nom: 'Site test' }).expect(201);
  const batiment = await agent.post('/batiments').send({
    nom: 'Bâtiment test',
    site_id: site.body.data.id,
  }).expect(201);
  const cellule = await agent.post('/cellules').send({
    nom: 'Cellule test',
    batiment_id: batiment.body.data.id,
    surface: 850,
  }).expect(201);
  const lot = await agent.post('/lots').send({
    nom: 'Lot test',
    cellules: [cellule.body.data.id],
    surface: 850,
  }).expect(201);

  assert.equal(site.body.data.agence_id, consultantA.agence_id);
  assert.equal(site.body.data.gestionnaire, consultantA.id);
  assert.deepEqual(lot.body.data.cellules, ['L', cellule.body.data.id]);

  await agent.get(`/sites/${site.body.data.id}`).expect(200);
  await agent.get(`/batiments/${batiment.body.data.id}`).expect(200);
  await agent.get(`/cellules/${cellule.body.data.id}`).expect(200);
  await agent.get(`/lots/${lot.body.data.id}`).expect(200);

  const updatedSite = await agent.put(`/sites/${site.body.data.id}`)
    .send({ nom: 'Site test modifié' })
    .expect(200);
  assert.equal(updatedSite.body.data.nom, 'Site test modifié');
});

test('un consultant ne liste pas le patrimoine d’un autre consultant', async () => {
  const client = memoryClient();
  const otherSite = await client.create('Sites', { nom: 'Autre', agence_id: 3, gestionnaire: 8 });
  await client.create('Sites', { nom: 'À moi', agence_id: 3, gestionnaire: 7 });
  const agent = await authenticatedAgent(client, consultantA);

  const response = await agent.get('/sites').expect(200);
  assert.deepEqual(response.body.data.map((site) => site.nom), ['À moi']);
  await agent.get(`/sites/${otherSite.id}`).expect(403);
  await agent.put(`/sites/${otherSite.id}`).send({ nom: 'Intrus' }).expect(403);
});

test('une relation vers le patrimoine d’un autre consultant est refusée', async () => {
  const client = memoryClient();
  const otherSite = await client.create('Sites', { nom: 'Autre', agence_id: 3, gestionnaire: 8 });
  const agent = await authenticatedAgent(client, consultantA);

  await agent.post('/batiments').send({
    nom: 'Intrus',
    site_id: otherSite.id,
  }).expect(403, { error: 'RELATION_FORBIDDEN' });
});

test('un consultant peut rattacher une adresse de son agence', async () => {
  const client = memoryClient();
  const adresse = await client.create('Adresses', { ville: 'Gonesse', agence_id: 3 });
  const agent = await authenticatedAgent(client, consultantA);

  const response = await agent.post('/sites').send({
    nom: 'Site avec adresse',
    adresse_id: adresse.id,
  }).expect(201);

  assert.equal(response.body.data.adresse_id, adresse.id);
});

test('les champs agence et gestionnaire ne peuvent pas être usurpés', async () => {
  const client = memoryClient();
  const agent = await authenticatedAgent(client, consultantA);

  await agent.post('/sites').send({
    nom: 'Intrus',
    agence_id: 99,
    gestionnaire: 99,
  }).expect(400, { error: 'SERVER_MANAGED_FIELD' });
});

test('seuls manager et admin peuvent supprimer dans leur agence', async () => {
  const client = memoryClient();
  const ownSite = await client.create('Sites', { nom: 'À moi', agence_id: 3, gestionnaire: 7 });
  const consultantAgent = await authenticatedAgent(client, consultantA);

  await consultantAgent.delete(`/sites/${ownSite.id}`).expect(403);

  const manager = {
    ...consultantA,
    id: 2,
    roles: ['manager'],
    role_actif: 'manager',
  };
  const managerAgent = await authenticatedAgent(client, manager);
  await managerAgent.delete(`/sites/${ownSite.id}`).expect(200, { status: 'ok' });
});

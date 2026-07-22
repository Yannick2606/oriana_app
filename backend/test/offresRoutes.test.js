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
    ['Lots', [
      { id: 10, fields: { nom: 'Lot consultant', agence_id: 3, gestionnaire: 7 } },
      { id: 11, fields: { nom: 'Lot autre', agence_id: 3, gestionnaire: 8 } },
    ]],
    ['Utilisateurs', [
      { id: 7, fields: { agence_id: 3 } },
      { id: 8, fields: { agence_id: 3 } },
      { id: 9, fields: { agence_id: 4 } },
    ]],
    ['Offres', []],
    ['Conditions_Financieres', []],
    ['Sites', []], ['Batiments', []], ['Cellules', []], ['Adresses', []],
  ]);
  let nextId = 100;

  return {
    tables,
    async list(table, filters = {}) {
      return clone((tables.get(table) ?? []).filter((record) => Object.entries(filters).every(
        ([field, values]) => values.map(String).includes(String(record.fields[field])),
      )));
    },
    async getById(table, id) {
      return clone((tables.get(table) ?? []).find((record) => record.id === Number(id)) ?? null);
    },
    async create(table, fields) {
      const record = { id: nextId, fields: clone(fields) };
      nextId += 1;
      tables.get(table).push(record);
      return clone(record);
    },
    async update(table, id, fields) {
      const record = tables.get(table).find((candidate) => candidate.id === Number(id));
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

const consultant = {
  id: 7,
  nom: 'Consultant',
  prenom: 'A',
  roles: ['consultant'],
  role_actif: 'consultant',
  agence_id: 3,
};

async function authenticatedAgent(client, user = consultant) {
  const app = createApp({
    patrimoineClient: client,
    offresClient: client,
    sessionSecret: randomBytes(32).toString('hex'),
    authService: { async login() { return { selectionRequise: false, user }; } },
  });
  const agent = request.agent(app);
  await agent.post('/auth/login').send({
    email: `${randomBytes(8).toString('hex')}@example.invalid`,
    mot_de_passe: randomBytes(24).toString('hex'),
  }).expect(200);
  return agent;
}

test('crée une offre double nature et ses deux conditions négociables', async () => {
  const client = memoryClient();
  const agent = await authenticatedAgent(client);

  const offer = await agent.post('/offres').send({
    numero: 'OFF-TEST',
    nom: 'Offre double',
    lot_id: 10,
    nature: 'vente_et_location',
    occupation: 'libre',
  }).expect(201);
  const sale = await agent.post('/conditions-financieres').send({
    offre_id: offer.body.data.id,
    type: 'vente',
    prix_vente: 1_250_000,
  }).expect(201);
  await agent.post('/conditions-financieres').send({
    offre_id: offer.body.data.id,
    type: 'location',
    loyer_ht_m2_an: 125,
  }).expect(201);

  const negotiated = await agent.put(`/conditions-financieres/${sale.body.data.id}`).send({
    prix_vente: 1_180_000,
  }).expect(200);
  assert.equal(negotiated.body.data.prix_vente, 1_180_000);

  const listed = await agent.get('/conditions-financieres').expect(200);
  assert.deepEqual(listed.body.data.map((item) => item.type).sort(), ['location', 'vente']);
});

test('refuse une deuxième condition du même type', async () => {
  const client = memoryClient();
  const agent = await authenticatedAgent(client);
  const offer = await agent.post('/offres').send({ lot_id: 10, nature: 'vente_et_location' }).expect(201);
  await agent.post('/conditions-financieres').send({
    offre_id: offer.body.data.id, type: 'vente', prix_vente: 1,
  }).expect(201);
  await agent.post('/conditions-financieres').send({
    offre_id: offer.body.data.id, type: 'vente', prix_vente: 2,
  }).expect(400, { error: 'CONDITION_EXISTS' });
});

test('conserve exactement un prix immobilier d’affaires de 250 millions d’euros', async () => {
  const client = memoryClient();
  const agent = await authenticatedAgent(client);
  const offer = await agent.post('/offres').send({ lot_id: 10, nature: 'vente' }).expect(201);

  const condition = await agent.post('/conditions-financieres').send({
    offre_id: offer.body.data.id,
    type: 'vente',
    prix_vente: 250_000_000,
  }).expect(201);

  assert.equal(condition.body.data.prix_vente, 250_000_000);
});

test('refuse une condition incompatible avec la nature de l’offre', async () => {
  const client = memoryClient();
  const agent = await authenticatedAgent(client);
  const offer = await agent.post('/offres').send({ lot_id: 10, nature: 'vente' }).expect(201);

  await agent.post('/conditions-financieres').send({
    offre_id: offer.body.data.id, type: 'location', loyer_global_an: 10,
  }).expect(400, { error: 'INVALID_CONDITION_TYPE' });
});

test('un consultant ne crée pas d’offre sur le lot d’un autre et ne lit pas ses conditions', async () => {
  const client = memoryClient();
  const otherOffer = await client.create('Offres', {
    lot_id: 11, nature: 'vente', agence_id: 3, gestionnaire: 8,
  });
  const otherCondition = await client.create('Conditions_Financieres', {
    offre_id: otherOffer.id, type: 'vente', prix_vente: 10,
  });
  const agent = await authenticatedAgent(client);

  await agent.post('/offres').send({ lot_id: 11, nature: 'vente' }).expect(403, {
    error: 'RELATION_FORBIDDEN',
  });
  await agent.get(`/conditions-financieres/${otherCondition.id}`).expect(403, {
    error: 'FORBIDDEN',
  });
});

test('seul le directeur d’agence supprime une offre et ses conditions', async () => {
  const client = memoryClient();
  const agent = await authenticatedAgent(client);
  const offer = await agent.post('/offres').send({ lot_id: 10, nature: 'vente' }).expect(201);
  await agent.post('/conditions-financieres').send({
    offre_id: offer.body.data.id, type: 'vente', prix_vente: 10,
  }).expect(201);
  await agent.delete(`/offres/${offer.body.data.id}`).expect(403);

  const manager = { ...consultant, id: 2, roles: ['directeur_agence'], role_actif: 'directeur_agence' };
  const managerAgent = await authenticatedAgent(client, manager);
  await managerAgent.delete(`/offres/${offer.body.data.id}`).expect(200, { status: 'ok' });
  assert.equal(client.tables.get('Conditions_Financieres').length, 0);
});

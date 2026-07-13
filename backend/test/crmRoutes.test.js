import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
function memoryClient() {
  const tables = new Map(['Societes', 'Contacts', 'Demandes', 'Adresses', 'Mandats', 'Offres', 'Lots',
    'Utilisateurs', 'Conditions_Financieres', 'Sites', 'Batiments', 'Cellules'].map((name) => [name, []]));
  let nextId = 100;
  return {
    tables,
    async list(table, filters = {}) { return clone(tables.get(table).filter((record) => Object.entries(filters).every(([key, values]) => values.map(String).includes(String(record.fields[key]))))); },
    async getById(table, id) { return clone(tables.get(table).find((record) => record.id === Number(id)) ?? null); },
    async create(table, fields) { const record = { id: nextId++, fields: clone(fields) }; tables.get(table).push(record); return clone(record); },
    async update(table, id, fields) { const record = tables.get(table).find((item) => item.id === Number(id)); Object.assign(record.fields, clone(fields)); return clone(record); },
    async delete(table, id) { const records = tables.get(table); records.splice(records.findIndex((item) => item.id === Number(id)), 1); },
  };
}

const consultantA = { id: 7, roles: ['consultant'], role_actif: 'consultant', agence_id: 3 };
const consultantB = { id: 8, roles: ['consultant'], role_actif: 'consultant', agence_id: 3 };
const autreAgence = { id: 9, roles: ['consultant'], role_actif: 'consultant', agence_id: 4 };
const manager = { id: 2, roles: ['manager'], role_actif: 'manager', agence_id: 3 };

async function agentFor(client, user) {
  const agent = request.agent(createApp({ patrimoineClient: client, crmClient: client,
    sessionSecret: randomBytes(32).toString('hex'), authService: { async login() { return { selectionRequise: false, user }; } } }));
  await agent.post('/auth/login').send({ email: `${randomBytes(6).toString('hex')}@example.invalid`, mot_de_passe: randomBytes(20).toString('hex') }).expect(200);
  return agent;
}

async function parcours(client, agent) {
  const company = (await agent.post('/societes').send({ raison_sociale: 'Logistique Nord', type_relation: 'prospect' }).expect(201)).body.data;
  const contact = (await agent.post('/contacts').send({ nom: 'Martin', prenom: 'Léa', societe_id: company.id }).expect(201)).body.data;
  await agent.put(`/societes/${company.id}`).send({ contact_principal: contact.id }).expect(200);
  const demande = (await agent.post('/demandes').send({ societe_id: company.id, contact_id: contact.id,
    nature_transaction: 'location', surface_min: 500, surface_max: 2_000, budget_max: 150_000_000 }).expect(201)).body.data;
  return { company, contact, demande };
}

test('crée la chaîne société, contact et demande avec propriété serveur', async () => {
  const client = memoryClient(); const agent = await agentFor(client, consultantA);
  const records = await parcours(client, agent);
  for (const record of Object.values(records)) {
    assert.equal(record.gestionnaire, consultantA.id); assert.equal(record.agence_id, 3); assert.equal(record.donnee_exclusive, true);
  }
  await agent.get(`/demandes/${records.demande.id}`).expect(200);
});

test('partage la lecture dans l’agence sans transférer l’écriture', async () => {
  const client = memoryClient(); const owner = await agentFor(client, consultantA);
  const { company } = await parcours(client, owner);
  const colleague = await agentFor(client, consultantB);
  await colleague.get(`/societes/${company.id}`).expect(403);
  await owner.put(`/societes/${company.id}`).send({ donnee_exclusive: false }).expect(200);
  await colleague.get(`/societes/${company.id}`).expect(200);
  await colleague.put(`/societes/${company.id}`).send({ enseigne: 'Interdit' }).expect(403);
  await owner.put(`/societes/${company.id}`).send({ donnee_exclusive: true }).expect(403, { error: 'EXCLUSIVITY_FORBIDDEN' });
  const managerAgent = await agentFor(client, manager);
  await managerAgent.put(`/societes/${company.id}`).send({ donnee_exclusive: true }).expect(200);
});

test('maintient le cloisonnement inter-agences même après partage', async () => {
  const client = memoryClient(); const owner = await agentFor(client, consultantA);
  const { company } = await parcours(client, owner);
  await owner.put(`/societes/${company.id}`).send({ donnee_exclusive: false }).expect(200);
  const outsider = await agentFor(client, autreAgence);
  await outsider.get(`/societes/${company.id}`).expect(403);
});

test('refuse un contact incohérent et réserve la suppression au manager', async () => {
  const client = memoryClient(); const owner = await agentFor(client, consultantA);
  const first = await parcours(client, owner);
  const second = (await owner.post('/societes').send({ raison_sociale: 'Seconde' }).expect(201)).body.data;
  await owner.post('/demandes').send({ societe_id: second.id, contact_id: first.contact.id, nature_transaction: 'vente' })
    .expect(400, { error: 'INVALID_RELATION' });
  await owner.delete(`/demandes/${first.demande.id}`).expect(403);
  const managerAgent = await agentFor(client, manager);
  await managerAgent.delete(`/demandes/${first.demande.id}`).expect(200, { status: 'ok' });
});

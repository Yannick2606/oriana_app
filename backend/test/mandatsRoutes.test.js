import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

function memoryClient() {
  const tables = new Map([
    ['Offres', [
      { id: 10, fields: { nature: 'vente_et_location', agence_id: 3, gestionnaire: 7 } },
      { id: 11, fields: { nature: 'vente', agence_id: 3, gestionnaire: 8 } },
    ]],
    ['Societes', [
      { id: 20, fields: { raison_sociale: 'Mandant', agence_id: 3 } },
      { id: 21, fields: { raison_sociale: 'Autre agence', agence_id: 4 } },
    ]],
    ['Mandats', []], ['Lots', []], ['Utilisateurs', []], ['Conditions_Financieres', []],
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
      const record = { id: nextId++, fields: clone(fields) };
      tables.get(table).push(record); return clone(record);
    },
    async update(table, id, fields) {
      const record = tables.get(table).find((item) => item.id === Number(id));
      Object.assign(record.fields, clone(fields)); return clone(record);
    },
    async delete(table, id) {
      const records = tables.get(table); records.splice(records.findIndex((item) => item.id === Number(id)), 1);
    },
  };
}

const consultant = {
  id: 7, nom: 'Consultant', prenom: 'A', roles: ['consultant'], role_actif: 'consultant', agence_id: 3,
};

async function agentFor(client, user = consultant) {
  const agent = request.agent(createApp({
    patrimoineClient: client, mandatsClient: client,
    sessionSecret: randomBytes(32).toString('hex'),
    authService: { async login() { return { selectionRequise: false, user }; } },
  }));
  await agent.post('/auth/login').send({
    email: `${randomBytes(8).toString('hex')}@example.invalid`, mot_de_passe: randomBytes(24).toString('hex'),
  }).expect(200);
  return agent;
}

test('crée, relit et modifie un mandat dans le périmètre', async () => {
  const client = memoryClient();
  const agent = await agentFor(client);
  const created = await agent.post('/mandats').send({
    numero: 'M-001', numero_registre: 'R-001', offre_id: 10, societe_mandante: 20,
    type: 'exclusif', nature: 'vente', date_debut: '2026-07-13', date_fin: '2027-07-12',
    honoraires_mode: 'pourcentage', honoraires_montant: 2_500_000, honoraires_charge: 'mandant',
  }).expect(201);
  assert.equal(created.body.data.gestionnaire, 7);
  assert.equal(created.body.data.agence_id, 3);
  assert.equal(created.body.data.donnee_exclusive, true);
  await agent.get(`/mandats/${created.body.data.id}`).expect(200);
  const updated = await agent.put(`/mandats/${created.body.data.id}`).send({
    honoraires_montant: 2_200_000,
  }).expect(200);
  assert.equal(updated.body.data.honoraires_montant, 2_200_000);
});

test('refuse une offre d’un autre consultant et une société d’une autre agence', async () => {
  const agent = await agentFor(memoryClient());
  const base = { type: 'simple', nature: 'vente' };
  await agent.post('/mandats').send({ ...base, offre_id: 11, societe_mandante: 20 })
    .expect(403, { error: 'RELATION_FORBIDDEN' });
  await agent.post('/mandats').send({ ...base, offre_id: 10, societe_mandante: 21 })
    .expect(403, { error: 'RELATION_FORBIDDEN' });
});

test('refuse une nature incompatible et une période inversée', async () => {
  const agent = await agentFor(memoryClient());
  await agent.post('/mandats').send({
    offre_id: 10, societe_mandante: 20, type: 'simple', nature: 'location',
    date_debut: '2027-01-01', date_fin: '2026-01-01',
  }).expect(400, { error: 'INVALID_PERIOD' });

  const client = memoryClient();
  client.tables.get('Offres')[0].fields.nature = 'vente';
  const secondAgent = await agentFor(client);
  await secondAgent.post('/mandats').send({
    offre_id: 10, societe_mandante: 20, type: 'simple', nature: 'location',
  }).expect(400, { error: 'INVALID_NATURE' });
});

test('un consultant ne lit pas le mandat d’un autre et seul un manager supprime', async () => {
  const client = memoryClient();
  const other = await client.create('Mandats', {
    offre_id: 11, societe_mandante: 20, type: 'simple', nature: 'vente', agence_id: 3,
    gestionnaire: 8, donnee_exclusive: true,
  });
  const consultantAgent = await agentFor(client);
  await consultantAgent.get(`/mandats/${other.id}`).expect(403, { error: 'FORBIDDEN' });
  await consultantAgent.delete(`/mandats/${other.id}`).expect(403);

  const manager = { ...consultant, id: 2, roles: ['manager'], role_actif: 'manager' };
  const managerAgent = await agentFor(client, manager);
  await managerAgent.delete(`/mandats/${other.id}`).expect(200, { status: 'ok' });
});

test('un mandat partagé reste modifiable par son gestionnaire et le manager seulement', async () => {
  const client = memoryClient();
  const owner = await client.create('Mandats', {
    offre_id: 10, societe_mandante: 20, type: 'simple', nature: 'vente', agence_id: 3,
    gestionnaire: 7, donnee_exclusive: true,
  });
  const ownerAgent = await agentFor(client);
  await ownerAgent.put(`/mandats/${owner.id}`).send({ donnee_exclusive: false }).expect(200);
  const colleagueAgent = await agentFor(client, { ...consultant, id: 8 });
  await colleagueAgent.get(`/mandats/${owner.id}`).expect(200);
  await colleagueAgent.put(`/mandats/${owner.id}`).send({ honoraires_montant: 10 }).expect(403);
  await ownerAgent.put(`/mandats/${owner.id}`).send({ donnee_exclusive: true })
    .expect(403, { error: 'EXCLUSIVITY_FORBIDDEN' });
  const managerAgent = await agentFor(client, { ...consultant, id: 2, roles: ['manager'], role_actif: 'manager' });
  await managerAgent.put(`/mandats/${owner.id}`).send({ donnee_exclusive: true }).expect(200);
});

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
    ['Ref_Familles', [
      { id: 1, fields: { code: 'logistique', libelle: 'Logistique' } },
      { id: 2, fields: { code: 'bureaux', libelle: 'Bureaux' } },
    ]],
    ['Ref_Caracteristiques', [
      {
        id: 10,
        fields: {
          libelle: 'Hauteur libre', familles: ['L', 1], niveaux: ['L', 'cellule'], type_valeur: 'nombre',
        },
      },
      {
        id: 11,
        fields: {
          libelle: 'Climatisation', familles: ['L', 2], niveaux: ['L', 'cellule'], type_valeur: 'bool',
        },
      },
      {
        id: 12,
        fields: {
          libelle: 'Accès poids lourds', familles: ['L', 1], niveaux: ['L', 'batiment'], type_valeur: 'bool',
        },
      },
    ]],
    ['Caracteristiques_Bien', []],
    ['Batiments', []],
    ['Cellules', [
      { id: 20, fields: { nom: 'À moi', agence_id: 3, gestionnaire: 7, type_bien: 1 } },
      { id: 21, fields: { nom: 'À autrui', agence_id: 3, gestionnaire: 8, type_bien: 1 } },
    ]],
    ['Lots', []],
    ['Sites', []],
    ['Adresses', []],
  ]);
  let nextId = 100;

  return {
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
      const record = tables.get(table).find((item) => item.id === Number(id));
      Object.assign(record.fields, clone(fields));
      return clone(record);
    },
    async delete() {},
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

async function authenticatedAgent(client) {
  const app = createApp({
    patrimoineClient: client,
    qualificationClient: client,
    sessionSecret: randomBytes(32).toString('hex'),
    authService: { async login() { return { selectionRequise: false, user: consultant }; } },
  });
  const agent = request.agent(app);
  await agent.post('/auth/login').send({
    email: `${randomBytes(8).toString('hex')}@example.invalid`,
    mot_de_passe: randomBytes(24).toString('hex'),
  }).expect(200);
  return agent;
}

test('le dictionnaire filtre simultanément par famille et niveau', async () => {
  const agent = await authenticatedAgent(memoryClient());

  const response = await agent.get(
    '/caracteristiques/dictionnaire?famille=logistique&niveau=cellule',
  ).expect(200);

  assert.deepEqual(response.body.data.map((item) => item.libelle), ['Hauteur libre']);
});

test('le dictionnaire accepte aussi l’identifiant de famille porté par le bien', async () => {
  const agent = await authenticatedAgent(memoryClient());
  const response = await agent.get('/caracteristiques/dictionnaire?famille=2&niveau=cellule').expect(200);
  assert.deepEqual(response.body.data.map((item) => item.libelle), ['Climatisation']);
});

test('une valeur se saisit puis se relit pour un bien autorisé', async () => {
  const agent = await authenticatedAgent(memoryClient());

  const created = await agent.post('/caracteristiques-bien').send({
    caracteristique_id: 10,
    niveau: 'cellule',
    cellule_id: 20,
    valeur_nombre: 8.5,
  }).expect(201);

  assert.equal(created.body.data.agence_id, consultant.agence_id);
  assert.equal(created.body.data.valeur_nombre, 8.5);

  const listed = await agent.get('/caracteristiques-bien?niveau=cellule&id=20').expect(200);
  assert.equal(listed.body.data.length, 1);
  assert.equal(listed.body.data[0].valeur_nombre, 8.5);
});

test('une nouvelle saisie modifie la valeur existante sans créer de doublon', async () => {
  const agent = await authenticatedAgent(memoryClient());
  const body = { caracteristique_id: 10, niveau: 'cellule', cellule_id: 20 };
  await agent.post('/caracteristiques-bien').send({ ...body, valeur_nombre: 8.5 }).expect(201);
  await agent.post('/caracteristiques-bien').send({ ...body, valeur_nombre: 9.2 }).expect(201);
  const listed = await agent.get('/caracteristiques-bien?niveau=cellule&id=20').expect(200);
  assert.equal(listed.body.data.length, 1);
  assert.equal(listed.body.data[0].valeur_nombre, 9.2);
});

test('un consultant ne lit ni ne qualifie le bien d’un autre consultant', async () => {
  const agent = await authenticatedAgent(memoryClient());

  await agent.get('/caracteristiques-bien?niveau=cellule&id=21').expect(403, {
    error: 'FORBIDDEN',
  });
  await agent.post('/caracteristiques-bien').send({
    caracteristique_id: 10,
    niveau: 'cellule',
    cellule_id: 21,
    valeur_nombre: 8.5,
  }).expect(403, { error: 'FORBIDDEN' });
});

test('le type de valeur doit correspondre au dictionnaire', async () => {
  const agent = await authenticatedAgent(memoryClient());

  await agent.post('/caracteristiques-bien').send({
    caracteristique_id: 10,
    niveau: 'cellule',
    cellule_id: 20,
    valeur_texte: '8,5',
  }).expect(400, { error: 'INVALID_VALUE_TYPE' });
});

test('refuse une caractéristique appartenant à une autre famille', async () => {
  const agent = await authenticatedAgent(memoryClient());
  await agent.post('/caracteristiques-bien').send({
    caracteristique_id: 11,
    niveau: 'cellule',
    cellule_id: 20,
    valeur_bool: true,
  }).expect(400, { error: 'INVALID_CHARACTERISTIC' });
});

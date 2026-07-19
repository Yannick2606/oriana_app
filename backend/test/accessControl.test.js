import assert from 'node:assert/strict';
import test from 'node:test';

import express from 'express';
import request from 'supertest';

import { requireAuth } from '../src/middlewares/requireAuth.js';
import {
  buildAccessScope,
  buildWriteScope,
  requireResourceAccess,
  scopeByRole,
} from '../src/middlewares/scopeByRole.js';

function securedOfferApp({ user, offer, users = [] }) {
  const app = express();
  app.locals.identityRepository = {
    async list(_table, filters) {
      return users.filter(({ fields }) => Object.entries(filters).every(
        ([field, values]) => values.map(String).includes(String(fields[field])),
      ));
    },
  };

  app.get(
    '/offres/:id',
    (incomingRequest, _response, next) => {
      incomingRequest.session = user ? { user } : {};
      next();
    },
    requireAuth,
    scopeByRole,
    requireResourceAccess(async () => offer),
    (incomingRequest, response) => response.status(200).json({ id: incomingRequest.resource.id }),
  );

  return app;
}

const consultantA = {
  id: 7,
  role_actif: 'consultant',
  agence_id: 3,
};

test('les périmètres de lecture et écriture sont explicites pour les cinq rôles', () => {
  const teamIds = [8, 9];
  const cases = [
    {
      role: 'consultant',
      access: { agence_id: 3, gestionnaire: 7 },
      write: { agence_id: 3, gestionnaire: 7 },
    },
    {
      role: 'master_consultant',
      access: { agence_id: 3, gestionnaire: [7, 8, 9] },
      write: { agence_id: 3, gestionnaire: 7 },
    },
    { role: 'directeur_agence', access: { agence_id: 3 }, write: { agence_id: 3 } },
    { role: 'admin_agence', access: { agence_id: 3 }, write: { agence_id: 3 } },
    { role: 'super_admin', access: null, write: null },
  ];

  for (const { role, access, write } of cases) {
    const user = { id: 7, agence_id: 3, role_actif: role };
    assert.deepEqual(buildAccessScope(user, teamIds), access, `lecture ${role}`);
    assert.deepEqual(buildWriteScope(user), write, `écriture ${role}`);
  }
});

test('le calcul du périmètre master échoue sans référentiel d’identité injecté', async () => {
  const incomingRequest = {
    session: { user: { id: 2, role_actif: 'master_consultant', agence_id: 3 } },
    app: { locals: {} },
  };
  let forwardedError;

  await scopeByRole(incomingRequest, {}, (error) => { forwardedError = error; });

  assert.match(forwardedError?.message ?? '', /Référentiel d’identité non configuré/);
  assert.equal(incomingRequest.accessScope, undefined);
});

test('GET /offres/:id refuse directement l’offre d’un autre consultant', async () => {
  const offerConsultantB = {
    id: 42,
    fields: { gestionnaire: 8, agence_id: 3 },
  };

  const response = await request(securedOfferApp({ user: consultantA, offer: offerConsultantB }))
    .get('/offres/42')
    .expect(403);

  assert.equal(response.body.error, 'FORBIDDEN');
});

test('un consultant accède à sa propre offre dans son agence', async () => {
  const ownOffer = {
    id: 41,
    fields: { gestionnaire: 7, agence_id: 3 },
  };

  await request(securedOfferApp({ user: consultantA, offer: ownOffer }))
    .get('/offres/41')
    .expect(200, { id: 41 });
});

test('un directeur d’agence reste limité à son agence', async () => {
  const manager = { id: 2, role_actif: 'directeur_agence', agence_id: 3 };
  const otherAgencyOffer = {
    id: 51,
    fields: { gestionnaire: 9, agence_id: 4 },
  };

  await request(securedOfferApp({ user: manager, offer: otherAgencyOffer }))
    .get('/offres/51')
    .expect(403);
});

test('un administrateur d’agence lit son agence mais pas une autre', async () => {
  const admin = { id: 3, role_actif: 'admin_agence', agence_id: 3 };

  await request(securedOfferApp({
    user: admin,
    offer: { id: 56, fields: { gestionnaire: 7, agence_id: 3 } },
  })).get('/offres/56').expect(200, { id: 56 });

  await request(securedOfferApp({
    user: admin,
    offer: { id: 57, fields: { gestionnaire: 7, agence_id: 4 } },
  })).get('/offres/57').expect(403);
});

test('un master consultant lit les offres de son équipe active, sans élargir son agence', async () => {
  const master = { id: 2, role_actif: 'master_consultant', agence_id: 3 };
  const users = [
    { id: 7, fields: { agence_id: 3, master_consultant_id: 2, actif: true } },
    { id: 8, fields: { agence_id: 3, master_consultant_id: 9, actif: true } },
    { id: 9, fields: { agence_id: 3, master_consultant_id: 2, actif: false } },
  ];

  await request(securedOfferApp({
    user: master,
    users,
    offer: { id: 52, fields: { gestionnaire: 7, agence_id: 3 } },
  })).get('/offres/52').expect(200, { id: 52 });

  await request(securedOfferApp({
    user: master,
    users,
    offer: { id: 53, fields: { gestionnaire: 8, agence_id: 3 } },
  })).get('/offres/53').expect(403);

  await request(securedOfferApp({
    user: master,
    users,
    offer: { id: 54, fields: { gestionnaire: 9, agence_id: 3 } },
  })).get('/offres/54').expect(403);
});

test('le super admin ne reçoit aucun accès implicite aux données métier', async () => {
  const superAdmin = { id: 1, role_actif: 'super_admin', agence_id: 3 };
  await request(securedOfferApp({
    user: superAdmin,
    offer: { id: 55, fields: { gestionnaire: 7, agence_id: 3 } },
  })).get('/offres/55').expect(403);
});

test('une route métier refuse une requête sans session', async () => {
  await request(securedOfferApp({ user: null, offer: null }))
    .get('/offres/41')
    .expect(401);
});

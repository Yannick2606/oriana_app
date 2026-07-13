import assert from 'node:assert/strict';
import test from 'node:test';

import express from 'express';
import request from 'supertest';

import { requireAuth } from '../src/middlewares/requireAuth.js';
import {
  requireResourceAccess,
  scopeByRole,
} from '../src/middlewares/scopeByRole.js';

function securedOfferApp({ user, offer }) {
  const app = express();

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

test('un manager reste limité à son agence', async () => {
  const manager = { id: 2, role_actif: 'manager', agence_id: 3 };
  const otherAgencyOffer = {
    id: 51,
    fields: { gestionnaire: 9, agence_id: 4 },
  };

  await request(securedOfferApp({ user: manager, offer: otherAgencyOffer }))
    .get('/offres/51')
    .expect(403);
});

test('une route métier refuse une requête sans session', async () => {
  await request(securedOfferApp({ user: null, offer: null }))
    .get('/offres/41')
    .expect(401);
});

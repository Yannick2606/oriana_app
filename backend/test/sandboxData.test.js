import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { createSandboxData } from '../src/sandbox/createSandboxData.js';

test('génère cinq offres fictives cohérentes centrées sur le nord francilien', () => {
  const data = createSandboxData();
  const offers = data.tables.Offres;

  assert.equal(offers.length, 5);
  assert.equal(offers.filter((offer) => offer.fields.departement === 'Val-d’Oise').length, 3);
  assert.equal(offers.filter((offer) => offer.fields.departement === 'Seine-et-Marne').length, 2);
  assert.ok(offers.every((offer) => offer.fields.agence_id === 1));
  assert.ok(data.tables.Utilisateurs.every((user) => user.fields.email.endsWith('@example.invalid')));
  assert.match(data.meta.avertissement, /fictives/);
});

test('conserve deux conditions séparées pour chaque offre double nature', () => {
  const data = createSandboxData();
  const doubleOffers = data.tables.Offres.filter(
    (offer) => offer.fields.nature === 'vente_et_location',
  );

  for (const offer of doubleOffers) {
    const types = data.tables.Conditions_Financieres
      .filter((condition) => condition.fields.offre_id === offer.id)
      .map((condition) => condition.fields.type)
      .sort();
    assert.deepEqual(types, ['location', 'vente']);
  }
});

test('référence uniquement des photographies locales présentes dans le projet', () => {
  const data = createSandboxData();
  const photos = data.tables.Medias.map((media) => media.fields.url);

  assert.equal(new Set(photos).size, photos.length);
  for (const photo of photos) {
    assert.equal(photo.startsWith('/demo/offres/'), true);
    assert.equal(existsSync(resolve('..', 'frontend', 'public', photo.slice(1))), true);
  }
});

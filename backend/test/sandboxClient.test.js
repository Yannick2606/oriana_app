import assert from 'node:assert/strict';
import test from 'node:test';

import { createSandboxData } from '../src/sandbox/createSandboxData.js';
import { createSandboxClient } from '../src/services/sandboxClient.js';

const email = 'preview@example.invalid';

test('sert une copie filtrable des données fictives et injecte l’adresse de connexion', async () => {
  const source = createSandboxData();
  const client = createSandboxClient(source, { authEmail: email });
  const users = await client.list('Utilisateurs', { email: [email] });
  const offer = await client.getById('Offres', 600);

  assert.equal(users.length, 1);
  assert.equal(users[0].id, 1001);
  assert.equal(users[0].fields.email, email);
  assert.equal(source.tables.Utilisateurs[0].fields.email, 'camille.riviere@example.invalid');
  assert.equal(offer.id, 600);
});

test('refuse toutes les écritures dans le jeu de prévisualisation', async () => {
  const client = createSandboxClient(createSandboxData(), { authEmail: email });

  await assert.rejects(client.create('Offres', {}), /SANDBOX_READ_ONLY/);
  await assert.rejects(client.update('Offres', 600, {}), /SANDBOX_READ_ONLY/);
  await assert.rejects(client.delete('Offres', 600), /SANDBOX_READ_ONLY/);
});

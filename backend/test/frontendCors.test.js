import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';
import { createPersistenceDouble } from '../test-helpers/persistenceDouble.js';

const frontendOrigin = 'https://oriana.example.invalid';

function testApp() {
  return createApp({
    persistenceClient: createPersistenceDouble(),
    mailer: { async sendPasswordReset() {} },
    sessionSecret: randomBytes(32).toString('hex'),
    frontendOrigin,
  });
}

test('autorise uniquement le frontend configuré avec les cookies de session', async () => {
  const response = await request(testApp())
    .get('/health')
    .set('Origin', frontendOrigin)
    .expect(200);

  assert.equal(response.headers['access-control-allow-origin'], frontendOrigin);
  assert.equal(response.headers['access-control-allow-credentials'], 'true');
  assert.match(response.headers.vary, /Origin/);
});

test('répond aux requêtes préliminaires du navigateur', async () => {
  const response = await request(testApp())
    .options('/auth/login')
    .set('Origin', frontendOrigin)
    .set('Access-Control-Request-Method', 'POST')
    .expect(204);

  assert.match(response.headers['access-control-allow-methods'], /POST/);
  assert.match(response.headers['access-control-allow-headers'], /Content-Type/);
});

test('refuse une origine différente et conserve les appels serveur sans origine', async () => {
  await request(testApp())
    .get('/health')
    .set('Origin', 'https://inconnu.example.invalid')
    .expect(403, { error: 'CORS_ORIGIN_DENIED' });

  await request(testApp()).get('/health').expect(200);
});

import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';

test('GET /health répond avec le statut ok', async () => {
  const response = await request(createApp({ sessionSecret: randomBytes(32).toString('hex') }))
    .get('/health')
    .expect(200);

  assert.deepEqual(response.body, { status: 'ok' });
});

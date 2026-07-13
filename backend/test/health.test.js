import assert from 'node:assert/strict';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';

test('GET /health répond avec le statut ok', async () => {
  const response = await request(createApp()).get('/health').expect(200);

  assert.deepEqual(response.body, { status: 'ok' });
});

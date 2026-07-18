import assert from 'node:assert/strict';
import test from 'node:test';
import { buildChildEnvironment } from './preflightT30Environment.mjs';

test('ne transmet aucun secret ni preuve T-30 aux processus enfants', () => {
  const child = buildChildEnvironment({
    PATH: '/usr/bin',
    HOME: '/tmp/home',
    CI: 'true',
    POSTGRES_PASSWORD: 'sentinelle-ne-doit-pas-sortir',
    SESSION_SECRET: 'sentinelle-ne-doit-pas-sortir',
    N8N_SHARED_SECRET: 'sentinelle-ne-doit-pas-sortir',
    VITE_API_BASE_URL: 'sentinelle-ne-doit-pas-sortir',
    T30_OFFSITE_BACKUP_VERIFIED: 'true',
  });

  assert.deepEqual(child, { PATH: '/usr/bin', HOME: '/tmp/home', CI: 'true' });
});

test('ignore par défaut toute variable non explicitement autorisée', () => {
  const child = buildChildEnvironment({ PATH: '/usr/bin', VARIABLE_INCONNUE: 'valeur' });
  assert.equal(child.PATH, '/usr/bin');
  assert.equal('VARIABLE_INCONNUE' in child, false);
});


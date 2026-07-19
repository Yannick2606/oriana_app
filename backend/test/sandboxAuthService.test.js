import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import { createSandboxAuthService } from '../src/services/sandboxAuthService.js';

const email = 'preview@example.invalid';
const passwordHash = `$2b$12$${'x'.repeat(53)}`;

function service(passwordComparer = async () => true) {
  return createSandboxAuthService({ email, passwordHash, passwordComparer });
}

test('propose les cinq rôles métier de prévisualisation sans le rôle client', async () => {
  const result = await service().login({
    email,
    motDePasse: randomBytes(24).toString('hex'),
  });

  assert.equal(result.selectionRequise, true);
  assert.deepEqual(result.roles, [
    'consultant',
    'master_consultant',
    'directeur_agence',
    'admin_agence',
    'super_admin',
  ]);
});
test('ouvre une session fictive et permet de changer de rôle autorisé', async () => {
  const auth = service();
  const login = await auth.login({
    email: email.toUpperCase(),
    motDePasse: randomBytes(24).toString('hex'),
    roleActif: 'consultant',
  });
  const changed = await auth.changeRole({ userId: login.user.id, roleActif: 'master_consultant' });

  assert.equal(login.user.role_actif, 'consultant');
  assert.equal(changed.role_actif, 'master_consultant');
  assert.equal(changed.agence_id, 1);
});

test('refuse un identifiant invalide et toute mutation du compte fictif', async () => {
  const auth = service(async () => false);
  await assert.rejects(
    auth.login({ email, motDePasse: randomBytes(24).toString('hex') }),
    (error) => error.code === 'INVALID_CREDENTIALS' && error.status === 401,
  );
  await assert.rejects(
    auth.requestPasswordReset({ email }),
    (error) => error.code === 'SANDBOX_READ_ONLY' && error.status === 403,
  );
});

test('exige une adresse et un hash bcrypt fournis par l’environnement', () => {
  assert.throws(() => createSandboxAuthService(), /configuration.*incomplète/i);
  assert.throws(
    () => createSandboxAuthService({ email, passwordHash: '' }),
    /configuration.*incomplète/i,
  );
});

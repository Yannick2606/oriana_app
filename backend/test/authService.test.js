import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import bcrypt from 'bcrypt';

import { AuthError, createAuthService } from '../src/services/authService.js';

async function fixture({ actif = true, roles = ['consultant'], mustChange = false } = {}) {
  const motDePasse = randomBytes(24).toString('hex');
  const hash = await bcrypt.hash(motDePasse, 4);
  const fields = {
    nom: 'Utilisateur', prenom: 'Test', email: 'test@example.invalid',
    mot_de_passe_hash: hash, roles, agence_id: 3, actif, doit_changer_mot_de_passe: mustChange,
  };
  const usersClient = {
    async list() {
      return [{
        id: 7,
        fields: {
          ...fields,
        },
      }];
    },
    async getById() {
      return {
        id: 7,
        fields: { ...fields },
      };
    },
    async update(table, id, changes) {
      Object.assign(fields, changes);
      return { id, fields: { ...fields } };
    },
  };

  return { motDePasse, service: createAuthService({ usersClient }), readFields: () => ({ ...fields }) };
}

test('login accepte le bon mot de passe sans renvoyer le hash', async () => {
  const { motDePasse, service } = await fixture();
  const result = await service.login({ email: 'TEST@example.invalid', motDePasse });

  assert.equal(result.user.role_actif, 'consultant');
  assert.equal(result.user.id, 7);
  assert.equal(JSON.stringify(result).includes('mot_de_passe_hash'), false);
});

test('login refuse un mauvais mot de passe', async () => {
  const { service } = await fixture();

  await assert.rejects(
    service.login({ email: 'test@example.invalid', motDePasse: randomBytes(24).toString('hex') }),
    (error) => error instanceof AuthError && error.status === 401,
  );
});

test('login refuse un compte inactif', async () => {
  const { motDePasse, service } = await fixture({ actif: false });

  await assert.rejects(
    service.login({ email: 'test@example.invalid', motDePasse }),
    (error) => error instanceof AuthError && error.status === 401,
  );
});

test('login demande un rôle actif pour un compte multirôle', async () => {
  const { motDePasse, service } = await fixture({ roles: ['consultant', 'admin'] });
  const result = await service.login({ email: 'test@example.invalid', motDePasse });

  assert.deepEqual(result, {
    selectionRequise: true,
    roles: ['consultant', 'admin'],
  });
});

test('login refuse un rôle actif non attribué', async () => {
  const { motDePasse, service } = await fixture({ roles: ['consultant', 'manager'] });

  await assert.rejects(
    service.login({ email: 'test@example.invalid', motDePasse, roleActif: 'admin' }),
    (error) => error instanceof AuthError && error.status === 403,
  );
});

test('changeRole relit les rôles courants avant de modifier la session', async () => {
  const { service } = await fixture({ roles: ['consultant', 'manager'] });
  const user = await service.changeRole({ userId: 7, roleActif: 'manager' });

  assert.equal(user.role_actif, 'manager');
  assert.deepEqual(user.roles, ['consultant', 'manager']);
});

test('changeRole refuse un rôle retiré ou un compte désactivé', async () => {
  const { service } = await fixture({ roles: ['consultant'] });
  await assert.rejects(
    service.changeRole({ userId: 7, roleActif: 'admin' }),
    (error) => error instanceof AuthError && error.status === 403,
  );

  const { service: inactiveService } = await fixture({ actif: false, roles: ['consultant', 'manager'] });
  await assert.rejects(
    inactiveService.changeRole({ userId: 7, roleActif: 'manager' }),
    (error) => error instanceof AuthError && error.status === 401,
  );
});

test('changeInitialPassword remplace le hash et lève uniquement le blocage requis', async () => {
  const { service, readFields, motDePasse } = await fixture({ mustChange: true });
  await assert.rejects(
    service.changeInitialPassword({ userId: 7, roleActif: 'consultant', newPassword: motDePasse }),
    (error) => error instanceof AuthError && error.code === 'PASSWORD_UNCHANGED',
  );
  const newPassword = randomBytes(24).toString('hex');
  const user = await service.changeInitialPassword({
    userId: 7, roleActif: 'consultant', newPassword,
  });
  assert.equal(user.doit_changer_mot_de_passe, false);
  assert.equal(readFields().doit_changer_mot_de_passe, false);
  assert.equal(await bcrypt.compare(newPassword, readFields().mot_de_passe_hash), true);
});

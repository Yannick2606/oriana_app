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
    roles: ['consultant', 'admin_agence'],
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

  assert.equal(user.role_actif, 'master_consultant');
  assert.deepEqual(user.roles, ['consultant', 'master_consultant']);
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

test('la demande de réinitialisation stocke seulement le hash du jeton et envoie le lien', async () => {
  const fields = { email: 'test@example.invalid', actif: true };
  let sent;
  const usersClient = {
    async list() { return [{ id: 7, fields: { ...fields } }]; },
    async update(table, id, changes) { Object.assign(fields, changes); return { id, fields: { ...fields } }; },
  };
  const service = createAuthService({
    usersClient,
    createToken: () => 'jeton-secret-de-reinitialisation-1234567890',
    now: () => new Date('2026-07-14T12:00:00.000Z'),
    mailer: { async sendPasswordReset(message) { sent = message; } },
  });
  await service.requestPasswordReset({ email: 'TEST@example.invalid' });
  assert.equal(sent.recipient, 'test@example.invalid');
  assert.equal(sent.token, 'jeton-secret-de-reinitialisation-1234567890');
  assert.notEqual(fields.reset_mot_de_passe_hash, sent.token);
  assert.equal(fields.reset_mot_de_passe_hash.length, 64);
  assert.equal(fields.reset_mot_de_passe_expiration, '2026-07-14T12:30:00.000Z');
});

test('une adresse inconnue reçoit la même réponse sans envoi de message', async () => {
  let sent = false;
  const service = createAuthService({
    usersClient: { async list() { return []; } },
    mailer: { async sendPasswordReset() { sent = true; } },
  });
  await service.requestPasswordReset({ email: 'inconnu@example.invalid' });
  assert.equal(sent, false);
});

test('une demande encore valide ne renvoie pas plusieurs e-mails', async () => {
  let sent = false;
  const service = createAuthService({
    usersClient: { async list() { return [{ id: 7, fields: { actif: true, reset_mot_de_passe_expiration: '2026-07-14T12:30:00.000Z' } }]; } },
    now: () => new Date('2026-07-14T12:10:00.000Z'),
    mailer: { async sendPasswordReset() { sent = true; } },
  });
  await service.requestPasswordReset({ email: 'test@example.invalid' });
  assert.equal(sent, false);
});

test('un jeton valide remplace le mot de passe une seule fois et un jeton expiré est refusé', async () => {
  const token = 'jeton-secret-de-reinitialisation-1234567890';
  const { createHash } = await import('node:crypto');
  const fields = {
    actif: true,
    reset_mot_de_passe_hash: createHash('sha256').update(token).digest('hex'),
    reset_mot_de_passe_expiration: '2026-07-14T12:30:00.000Z',
  };
  const usersClient = {
    async list(table, filters) {
      return filters.reset_mot_de_passe_hash?.[0] === fields.reset_mot_de_passe_hash ? [{ id: 7, fields: { ...fields } }] : [];
    },
    async update(table, id, changes) { Object.assign(fields, changes); return { id, fields: { ...fields } }; },
  };
  const service = createAuthService({ usersClient, now: () => new Date('2026-07-14T12:10:00.000Z') });
  const newPassword = randomBytes(24).toString('hex');
  await service.resetPassword({ token, newPassword });
  assert.equal(await bcrypt.compare(newPassword, fields.mot_de_passe_hash), true);
  assert.equal(fields.reset_mot_de_passe_hash, '');
  await assert.rejects(service.resetPassword({ token, newPassword }), (error) => error.code === 'INVALID_RESET_TOKEN');
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { createMailService } from '../src/services/mailService.js';

test('compose le message de réinitialisation sans exposer la configuration SMTP au service métier', async () => {
  let transportOptions;
  let message;
  const service = createMailService({
    host: 'smtp.example.invalid',
    port: 465,
    user: 'mailer@example.invalid',
    password: 'test-password',
    from: 'oriana@example.invalid',
    frontendUrl: 'https://oriana.example.invalid/',
    transportFactory(options) {
      transportOptions = options;
      return { async sendMail(value) { message = value; } };
    },
  });

  await service.sendPasswordReset({ recipient: 'user@example.invalid', token: 'a b' });

  assert.equal(transportOptions.host, 'smtp.example.invalid');
  assert.equal(transportOptions.connectionTimeout, 5_000);
  assert.equal(transportOptions.socketTimeout, 10_000);
  assert.equal(message.to, 'user@example.invalid');
  assert.match(message.text, /https:\/\/oriana\.example\.invalid\/\?reset_token=a%20b/);
});

test('signale explicitement une configuration SMTP incomplète sans ouvrir de transport', async () => {
  let opened = false;
  const service = createMailService({
    transportFactory() { opened = true; return { async sendMail() {} }; },
  });

  await assert.rejects(
    service.sendPasswordReset({ recipient: 'user@example.invalid', token: 'token' }),
    /Configuration email incomplète/,
  );
  assert.equal(opened, false);
});

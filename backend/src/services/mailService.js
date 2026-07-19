import nodemailer from 'nodemailer';

export function createMailService({
  host,
  port,
  user,
  password,
  from,
  frontendUrl,
  transportFactory = (options) => nodemailer.createTransport(options),
} = {}) {
  const config = { host, port, user, password, from, frontendUrl };
  const missing = ['user', 'password', 'from', 'frontendUrl'].filter((key) => !config[key]);

  return {
    async sendPasswordReset({ recipient, token }) {
      if (missing.length > 0) {
        throw new Error(`Configuration email incomplète : ${missing.join(', ')}`);
      }
      const transport = transportFactory({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        connectionTimeout: 5_000,
        greetingTimeout: 5_000,
        socketTimeout: 10_000,
        auth: { user: config.user, pass: config.password },
      });
      const resetUrl = `${config.frontendUrl.replace(/\/$/, '')}/?reset_token=${encodeURIComponent(token)}`;
      await transport.sendMail({
        from: config.from,
        to: recipient,
        subject: 'Réinitialisation de votre mot de passe orIAna',
        text: `Un nouveau mot de passe a été demandé pour votre compte orIAna.\n\nUtilisez ce lien dans les 30 minutes :\n${resetUrl}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`,
      });
    },
  };
}

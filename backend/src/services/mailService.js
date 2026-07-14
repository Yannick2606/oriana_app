import nodemailer from 'nodemailer';

function readMailConfig() {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_APP_PASSWORD,
    from: process.env.MAIL_FROM,
    frontendUrl: process.env.FRONTEND_PUBLIC_URL || process.env.FRONTEND_ORIGIN,
  };
  const missing = ['user', 'password', 'from', 'frontendUrl'].filter((key) => !config[key]);
  if (missing.length > 0) throw new Error(`Configuration email incomplète : ${missing.join(', ')}`);
  return config;
}

export const mailService = {
  async sendPasswordReset({ recipient, token }) {
    const config = readMailConfig();
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
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

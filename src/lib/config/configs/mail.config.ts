import { registerAs } from '@nestjs/config';

export const mail = registerAs('mail', () => ({
  serviceDisabled: process.env.MAIL_SERVICE_DISABLED === 'true',
  host: process.env.MAIL_HOST,
  username: process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD,
  port: process.env.MAIL_PORT,
  server: process.env.MAIL_SERVER || 'SMTP',
  senderEmail: process.env.MAIL_SENDER_EMAIL,
  templateDir: process.env.MAIL_TEMPLATE_DIR || 'resources/templates/mail',
  bccList: process.env.MAIL_BCC_LIST ? process.env.MAIL_BCC_LIST.split(',') : [],
}));

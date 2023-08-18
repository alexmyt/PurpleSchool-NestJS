import { registerAs } from '@nestjs/config';

export const telegram = registerAs('telegram', () => ({
  serviceDisabled: process.env.TELEGRAM_SERVICE_DISABLED === 'true',
  token: process.env.TELEGRAM_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID,
  templateDir: process.env.TELEGRAM_TEMPLATE_DIR || 'resources/templates/telegram',
}));

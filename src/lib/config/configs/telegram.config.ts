import { registerAs } from '@nestjs/config';

export const telegram = registerAs('telegram', () => ({
  token: process.env.TELEGRAM_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
}));

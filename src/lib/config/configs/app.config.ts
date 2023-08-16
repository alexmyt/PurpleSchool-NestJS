import { registerAs } from '@nestjs/config';

export const app = registerAs('app', () => ({
  name: process.env.APP_NAME,
  url: process.env.APP_URL,
  port: process.env.APP_PORT || 3000,
  env: process.env.NODE_ENV || 'dev',
}));

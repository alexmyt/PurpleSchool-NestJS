import { registerAs } from '@nestjs/config';

export const jwt = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessExpire: process.env.JWT_ACCESS_EXPIRE,
}));

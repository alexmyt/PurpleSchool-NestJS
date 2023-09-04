import { registerAs } from '@nestjs/config';

export const mongodb = registerAs('mongodb', () => ({
  uri: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_DBNAME,
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASS,
}));

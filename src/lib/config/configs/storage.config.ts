import { registerAs } from '@nestjs/config';

export const storage = registerAs('storage', () => ({
  type: process.env.STORAGE_TYPE || 'local',
  uploadDir: process.env.LOCAL_STORAGE_UPLOAD_DIR || 'uploads/images',
}));

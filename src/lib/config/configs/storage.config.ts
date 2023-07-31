import { registerAs } from '@nestjs/config';

export const storage = registerAs('storage', () => ({
  defaultType: process.env.DEFAULT_STORAGE_TYPE || 'local',
  local: {
    uploadDir: process.env.LOCAL_STORAGE_UPLOAD_DIR || 'uploads/images',
  },
  s3: {
    endpoint: process.env.S3_STORAGE_ENDPOINT,
    bucket: process.env.S3_STORAGE_BUCKET,
    region: process.env.S3_STORAGE_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
}));

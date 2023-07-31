import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { IConfig } from '../config/config.interface';

import { FileMetadata, FileStorageService, FileUploadSource } from './storage.interface';

@Injectable()
export class S3StorageService implements FileStorageService {
  private s3Client: S3Client;

  private bucket: string;

  private endpoint: string;

  constructor(private configService: ConfigService<IConfig>) {
    this.bucket = configService.get('storage.s3.bucket', { infer: true });
    this.endpoint = configService.get('storage.s3.endpoint', { infer: true });

    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: configService.get('storage.s3.accessKeyId', { infer: true }),
        secretAccessKey: configService.get('storage.s3.secretAccessKey', { infer: true }),
      },
      endpoint: this.endpoint,
      region: configService.get('storage.s3.region', { infer: true }),
    });
  }

  async upload(file: FileUploadSource): Promise<FileMetadata> {
    const { filename, originalname, buffer } = file;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: buffer,
      Metadata: { originalname },
    });

    await this.s3Client.send(command);

    const url = new URL(`${this.bucket}/${filename}`, this.endpoint).toString();
    return { url, originalname, filename };
  }

  async delete(fileMetadata: FileMetadata): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileMetadata.filename,
    });

    await this.s3Client.send(command);
  }
}

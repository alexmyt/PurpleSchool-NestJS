import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ensureDir, writeFile, remove } from 'fs-extra';

import { IConfig } from '../config/config.interface';

import {
  FileMetadata,
  FileStorageService,
  FileUploadSource,
  StorageType,
} from './storage.interface';

@Injectable()
export class LocalStorageService implements FileStorageService {
  readonly type = StorageType.LOCAL;

  private uploadDir: string;

  constructor(private configService: ConfigService<IConfig>) {
    this.uploadDir = configService.getOrThrow('storage.local.uploadDir', { infer: true });
  }

  async upload(file: FileUploadSource): Promise<FileMetadata> {
    const destination = new Date().toISOString().slice(0, 10);
    const uploadDir = path.resolve(this.uploadDir, destination);
    await ensureDir(uploadDir);

    const { filename, originalname, buffer, size, mimetype } = file;

    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `${destination}/${filename}`;
    return {
      url,
      originalname,
      filename,
      destination,
      size,
      mimetype,
    };
  }

  async delete(fileMetadata: Pick<FileMetadata, 'url'>): Promise<void> {
    await remove(path.resolve(this.uploadDir, fileMetadata.url));
  }
}

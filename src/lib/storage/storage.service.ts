import { extname } from 'path';

import { ModuleRef } from '@nestjs/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IConfig } from '../config/config.interface';

import {
  FileUploadOptions,
  FileMetadata,
  FileUploadSource,
  StorageType,
} from './storage.interface';
import { StorageModel } from './storage.model';
import { FILE_ID_NOT_FOUND, STORAGE_NOT_IMPLEMENTED } from './storage.constants';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

@Injectable()
export class StorageService {
  private readonly defaultStorageType: StorageType;

  constructor(
    private readonly configService: ConfigService<IConfig, true>,
    @InjectModel(StorageModel.name) private readonly storageModel: Model<StorageModel>,
    private readonly moduleRef: ModuleRef,
  ) {
    this.defaultStorageType = configService.get('storage.defaultType', { infer: true });
  }

  async upload(
    file: FileUploadSource,
    owner: string | Types.ObjectId,
    options?: FileUploadOptions,
  ): Promise<FileMetadata> {
    const document = new this.storageModel({
      owner: new Types.ObjectId(owner),
      originalname: file.originalname,
      storageType: this.defaultStorageType,
    });

    const filename = document._id.toHexString().concat(extname(file.originalname));

    const fileStorageService = this.getFileStorageService(
      options?.storageType || this.defaultStorageType,
    );

    const result = await fileStorageService.upload({
      ...file,
      filename,
    });

    document.url = result.url;
    document.destination = result.destination;
    document.filename = result.filename;

    await document.save();

    return result;
  }

  async uploadMany(
    files: FileUploadSource[],
    owner: string | Types.ObjectId,
  ): Promise<FileMetadata[]> {
    const uploadedFiles: FileMetadata[] = [];

    for (const file of files) {
      const uploadedFile = await this.upload(file, owner);
      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  }

  async delete(id: string): Promise<void> {
    const document = await this.storageModel.findById(id);
    if (!document) {
      throw new NotFoundException(`${FILE_ID_NOT_FOUND}: ${id}`);
    }

    const fileStorageService = this.getFileStorageService(document.storageType);
    await fileStorageService.delete(document);
    document.deleteOne();
  }

  private getFileStorageService(storageType: StorageType) {
    switch (storageType) {
      case StorageType.LOCAL:
        return this.moduleRef.get(LocalStorageService);
      case StorageType.S3:
        return this.moduleRef.get(S3StorageService);
      default:
        throw new Error(`${STORAGE_NOT_IMPLEMENTED}: ${this.defaultStorageType}`);
    }
  }
}

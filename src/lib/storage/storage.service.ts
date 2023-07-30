import { extname } from 'path';

import { ModuleRef } from '@nestjs/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IConfig } from '../config/config.interface';

import {
  FileUploadOptions,
  FileUploadResult,
  FileUploadSource,
  StorageType,
} from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { StorageModel } from './storage.model';
import { FILE_ID_NOT_FOUND, STORAGE_NOT_IMPLEMENTED } from './storage.constants';

@Injectable()
export class StorageService {
  private readonly defaultStorageType: StorageType;

  constructor(
    private readonly configService: ConfigService<IConfig, true>,
    @InjectModel(StorageModel.name) private readonly storageModel: Model<StorageModel>,
    private readonly moduleRef: ModuleRef,
  ) {
    this.defaultStorageType = configService.get('storage.type', { infer: true });
  }

  async upload(
    file: FileUploadSource,
    owner: string | Types.ObjectId,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult> {
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
  ): Promise<FileUploadResult[]> {
    const uploadedFiles: FileUploadResult[] = [];

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
    await fileStorageService.delete(document.url);
    document.deleteOne();
  }

  private getFileStorageService(storageType: StorageType) {
    switch (storageType) {
      case StorageType.LOCAL:
        return this.moduleRef.get(LocalStorageService);
      default:
        throw new Error(`${STORAGE_NOT_IMPLEMENTED}: ${this.defaultStorageType}`);
    }
  }
}

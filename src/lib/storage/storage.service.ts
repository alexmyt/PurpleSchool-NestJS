import { extname } from 'path';

import { ModuleRef } from '@nestjs/core';
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    const storageType = options?.storageType || this.defaultStorageType;

    const documentId = new Types.ObjectId();
    const filename = documentId.toHexString().concat(extname(file.originalname));

    const fileStorageService = this.getFileStorageService(storageType);

    const result = await fileStorageService.upload({
      ...file,
      filename,
    });

    const document = {
      _id: documentId,
      owner: new Types.ObjectId(owner),
      storageType,
      originalname: file.originalname,
      url: result.url,
      destination: result.destination,
      filename,
    };

    try {
      this.storageModel.create(document);
    } catch (error) {
      await fileStorageService.delete(document);
      throw new InternalServerErrorException(error);
    }

    return result;
  }

  async uploadMany(
    files: FileUploadSource[],
    owner: string | Types.ObjectId,
  ): Promise<FileMetadata[]> {
    const uploadedFiles: FileMetadata[] = [];

    try {
      for (const file of files) {
        const uploadedFile = await this.upload(file, owner);
        uploadedFiles.push(uploadedFile);
      }
    } catch (error) {
      // TODO: if we need to load "all or nothing",
      // then we should delete all files already uploaded and throw an error.
      // Otherwise we don't have to do anything and should return an array with the files already uploaded
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

    document.deleteOne(); // Что если здесь будет ошибка?
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

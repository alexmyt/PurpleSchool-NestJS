import { extname } from 'path';

import { ModuleRef } from '@nestjs/core';
import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IConfig } from '../config/config.interface';

import {
  FileUploadOptions,
  FileUploadSource,
  StorageType,
  StorageServices,
  FileUploadResult,
  fileUploadStatus,
} from './storage.interface';
import { StorageModel } from './storage.model';
import { FILE_ID_NOT_FOUND, FILE_UPLOAD_ERROR, STORAGE_NOT_IMPLEMENTED } from './storage.constants';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

@Injectable()
export class StorageService {
  private readonly defaultStorageType: StorageType;

  private storageServices: StorageServices = {
    [StorageType.LOCAL]: this.moduleRef.get(LocalStorageService),
    [StorageType.S3]: this.moduleRef.get(S3StorageService),
  };

  private readonly logger = new Logger(StorageService.name);

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
  ): Promise<FileUploadResult> {
    const documentId = new Types.ObjectId();
    const filename = documentId.toHexString().concat(extname(file.originalname));

    const storageType = options?.storageType || this.defaultStorageType;
    const fileStorageService = this.getFileStorageService(storageType);

    const result = await fileStorageService.upload({ ...file, filename }).catch(error => {
      this.logger.error({ fileStorageService, owner, file }, error);
      throw new InternalServerErrorException(error);
    });

    const ownerId = owner instanceof Types.ObjectId ? owner : new Types.ObjectId(owner);
    const document = {
      _id: documentId,
      owner: ownerId,
      storageType,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: result.url,
      destination: result.destination,
      filename,
    };

    await this.storageModel.create(document).catch(async error => {
      await fileStorageService.delete(document);
      this.logger.error({ fileStorageService, owner, file }, error);
      throw new InternalServerErrorException(error);
    });

    return { status: fileUploadStatus.SUCCESS, ...result, id: documentId.toHexString() };
  }

  async uploadMany(
    files: FileUploadSource[],
    owner: string | Types.ObjectId,
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => this.upload(file, owner));
    const settledPromises = await Promise.allSettled(uploadPromises);

    const uploadedFiles = settledPromises.map<FileUploadResult>((res, index) => {
      if (res.status === 'fulfilled') {
        return res.value;
      } else {
        return {
          status: fileUploadStatus.FAILED,
          reason: FILE_UPLOAD_ERROR,
          originalname: files[index].originalname,
        };
      }
    });

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
    const storageService = this.storageServices[storageType];
    if (!storageService) {
      const errorMessage = `${STORAGE_NOT_IMPLEMENTED}: ${storageType}`;
      this.logger.error(errorMessage);
      throw new NotImplementedException(errorMessage);
    }
    return storageService;
  }
}

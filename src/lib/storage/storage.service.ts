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
import { StorageModel, StorageModelDocument } from './storage.model';
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

  /**
   * Uploads a file to a storage service.
   */
  async upload(
    file: FileUploadSource,
    fileOwner: string | Types.ObjectId,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult> {
    try {
      const result = await this.uploadFile(file, fileOwner, options);
      return result;
    } catch (error) {
      return {
        status: fileUploadStatus.FAILED,
        reason: FILE_UPLOAD_ERROR,
        originalname: file.originalname,
      };
    }
  }

  /**
   * Upload multiple files to the specified storage service or the default storage service
   */
  async uploadMany(
    files: FileUploadSource[],
    owner: string | Types.ObjectId,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, owner, options));
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

  /**
   * Delete a file from storage by his ID
   *
   * @param id - The ID of the file to be deleted.
   * @throws {NotFoundException} - If the file with the given ID is not found.
   * @throws {NotImplementedException} - If the specified storage type is not implemented.
   * @throws {InternalServerErrorException} - If an error occurs during the deletion process.
   */
  async delete(id: string): Promise<void> {
    const document = await this.storageModel.findById(id);
    if (!document) {
      throw new NotFoundException(`${FILE_ID_NOT_FOUND}: ${id}`);
    }

    const fileStorageService = this.getFileStorageService(document.storageType);
    await fileStorageService.delete(document);

    document.deleteOne(); // Что если здесь будет ошибка?
  }

  /**
   * Upload a file to the specified or the default storage service.
   */
  private async uploadFile(
    file: FileUploadSource,
    fileOwner: string | Types.ObjectId,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult> {
    const fileStorageService = this.getFileStorageService(options?.storageType);

    const fileDocument = await this.createFileDocument(
      fileOwner,
      fileStorageService.type,
      file,
    ).catch(async error => {
      this.logger.error({ fileStorageService, fileOwner, file }, error);
      throw new InternalServerErrorException(error);
    });

    const documentId = fileDocument._id;
    const filename = documentId.toHexString().concat(extname(file.originalname));

    const result = await fileStorageService.upload({ ...file, filename }).catch(error => {
      this.logger.error({ fileStorageService, fileOwner, file }, error);
      throw new InternalServerErrorException(error);
    });

    await fileDocument.updateOne({ result, isUploaded: true });

    return { status: fileUploadStatus.SUCCESS, ...result, id: documentId.toHexString() };
  }

  /**
   * Return a specified storage service implementation
   */
  private getFileStorageService(storageType = this.defaultStorageType) {
    const storageService = this.storageServices[storageType];
    if (!storageService) {
      const errorMessage = `${STORAGE_NOT_IMPLEMENTED}: ${storageType}`;
      this.logger.error(errorMessage);
      throw new NotImplementedException(errorMessage);
    }
    return storageService;
  }

  /**
   * Create a new record in database for an uploaded file
   */
  private async createFileDocument(
    owner: string | Types.ObjectId,
    storageType: StorageType,
    file: FileUploadSource,
  ): Promise<StorageModelDocument> {
    const ownerId = owner instanceof Types.ObjectId ? owner : new Types.ObjectId(owner);
    const document = {
      ownerId,
      storageType,
      ...file,
    };

    return this.storageModel.create(document);
  }
}

export enum StorageType {
  LOCAL = 'local',
  S3 = 's3',
}

export interface FileUploadOptions {
  storageType?: StorageType;
}

export type FileUploadSource = {
  originalname: string;
  buffer: Buffer;
  filename: string;
  size: number;
  mimetype: string;
};

export type FileMetadata = {
  url: string;
  /** Directory to which this file was uploaded */
  destination?: string;
  /** saved filename */
  filename: string;
  /** original filename */
  originalname: string;
  size: number;
  mimetype: string;
};

export enum fileUploadStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

interface FileUploadSuccessResult extends FileMetadata {
  status: fileUploadStatus.SUCCESS;
  id: string;
}

interface FileUploadFailedResult {
  status: fileUploadStatus.FAILED;
  reason: string;
  originalname: string;
}

export type FileUploadResult = FileUploadSuccessResult | FileUploadFailedResult;

export interface FileStorageService {
  type: StorageType;
  upload(file: FileUploadSource): Promise<FileMetadata>;
  delete(fileMetadata: FileMetadata): Promise<void>;
}

export type StorageServices = Record<StorageType, FileStorageService>;

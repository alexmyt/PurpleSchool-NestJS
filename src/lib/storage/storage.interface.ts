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

export interface FileStorageService {
  upload(file: FileUploadSource): Promise<FileMetadata>;
  delete(fileMetadata: FileMetadata): Promise<void>;
}

export type StorageServices = Record<StorageType, FileStorageService>;

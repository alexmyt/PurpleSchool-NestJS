export enum StorageType {
  LOCAL = 'local',
}

export interface FileUploadOptions {
  storageType?: StorageType;
}

export type FileUploadSource = {
  originalname: string;
  buffer: Buffer;
  filename: string;
};

export type FileUploadResult = {
  url: string;
  /** Directory to which this file was uploaded */
  destination?: string;
  /** saved filename */
  filename: string;
  /** original filename */
  originalname: string;
};

export interface FileStorageService {
  upload(file: FileUploadSource): Promise<FileUploadResult>;
  delete(filename: string): Promise<void>;
}

import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InternalServerErrorException, NotImplementedException } from '@nestjs/common';

import { StorageService } from './storage.service';
import { StorageModel } from './storage.model';
import { FileMetadata, FileUploadSource, StorageType, fileUploadStatus } from './storage.interface';
import { FILE_UPLOAD_ERROR } from './storage.constants';

const mockFile = {
  originalname: 'file1.jpg',
  buffer: Buffer.from('1'),
} as FileUploadSource;

const mockOwner = '649546b32cc4d97a1ed30e0c';

// Mock the ConfigService
class MockConfigService {
  private data: any;
  constructor(data: any) {
    this.data = data;
  }
  get(key: string) {
    if (this.data[key]) {
      return this.data[key];
    } else {
      throw new Error(`Config key '${key}' not found`);
    }
  }
}

const mockLocalStorageService = {
  upload: jest.fn().mockImplementation((arg: FileMetadata) => Promise.resolve({ ...arg, url: '' })),
  delete: jest.fn(),
};

const mockModuleRef = {
  get: jest.fn(arg => {
    if (arg.name === 'LocalStorageService') return mockLocalStorageService;
  }),
};

const mockReservationModel = {
  create: jest.fn().mockResolvedValue({}),
};

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: getModelToken(StorageModel.name), useValue: mockReservationModel },
        {
          provide: ConfigService,
          useValue: new MockConfigService({ 'storage.defaultType': 'local' }),
        },
        { provide: ModuleRef, useValue: mockModuleRef },
      ],
    }).compile();

    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(storageService).toBeDefined();
  });

  describe('Upload', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should upload one file', async () => {
      const storageType = StorageType.LOCAL;

      // Mongo ObjectId + '.jpg'
      const expectedFilename = expect.stringMatching(/[0-9abcdef]{24}\.jpg$/i);

      const expectedResult = {
        url: expect.any(String),
        originalname: mockFile.originalname,
        filename: expectedFilename,
      };

      const result = await storageService.upload(mockFile, mockOwner);

      expect(result).toEqual(
        expect.objectContaining({ ...expectedResult, status: fileUploadStatus.SUCCESS }),
      );

      expect(mockLocalStorageService.upload).toHaveBeenCalledTimes(1);
      expect(mockLocalStorageService.upload).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockFile,
          filename: expectedFilename,
        }),
      );

      expect(mockReservationModel.create).toHaveBeenCalledTimes(1);
      expect(mockReservationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ ...expectedResult, storageType }),
      );
    });

    it('should throw an error if file upload filed', async () => {
      mockLocalStorageService.upload.mockImplementationOnce(() => Promise.reject(new Error()));

      await expect(storageService.upload(mockFile, mockOwner)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLocalStorageService.upload).toHaveBeenCalledTimes(1);
    });

    it('should throw error and delete file when database operation filed', async () => {
      mockReservationModel.create.mockImplementationOnce(() => Promise.reject(new Error()));

      await expect(storageService.upload(mockFile, mockOwner)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLocalStorageService.upload).toHaveBeenCalledTimes(1);
      expect(mockLocalStorageService.delete).toHaveBeenCalledTimes(1);
      expect(mockLocalStorageService.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: expect.stringMatching(/[0-9abcdef]{24}\.jpg$/i),
        }),
      );
    });
  });

  describe('UploadMany', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should upload many files', async () => {
      const mockFileArray = [mockFile, mockFile];

      // Mongo ObjectId + '.jpg'
      const expectedFilename = expect.stringMatching(/[0-9abcdef]{24}\.jpg$/i);

      const result = await storageService.uploadMany(mockFileArray, mockOwner);

      expect(mockLocalStorageService.upload).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        expect.objectContaining({ filename: expectedFilename, status: fileUploadStatus.SUCCESS }),
        expect.objectContaining({ filename: expectedFilename, status: fileUploadStatus.SUCCESS }),
      ]);
    });

    it('should return result when one file upload failed', async () => {
      mockLocalStorageService.upload.mockImplementationOnce(
        mockLocalStorageService.upload.getMockImplementation(),
      );
      mockLocalStorageService.upload.mockImplementationOnce(() =>
        Promise.reject(new Error('error')),
      );

      const mockFileArray = [mockFile, mockFile];
      const expectedFilename = expect.stringMatching(/[0-9abcdef]{24}\.jpg$/i);

      const result = await storageService.uploadMany(mockFileArray, mockOwner);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        expect.objectContaining({ filename: expectedFilename, status: fileUploadStatus.SUCCESS }),
        expect.objectContaining({
          originalname: mockFile.originalname,
          status: fileUploadStatus.FAILED,
          reason: FILE_UPLOAD_ERROR,
        }),
      ]);
    });
  });

  describe('getFileStorageService', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return storage service by type', () => {
      const result = storageService['getFileStorageService'](StorageType.LOCAL);
      expect(result).toBeDefined();
    });

    it('should throw error when type is wrong', () => {
      expect(() => storageService['getFileStorageService']('wrong' as StorageType)).toThrowError(
        NotImplementedException,
      );
    });
  });
});

import { extname } from 'path';

import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InternalServerErrorException } from '@nestjs/common';

import { StorageService } from './storage.service';
import { StorageModel } from './storage.model';
import { FileMetadata, FileUploadSource, StorageType } from './storage.interface';

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
  upload: jest.fn((arg: FileMetadata) => ({ ...arg, url: '' })),
  delete: jest.fn(),
};

const mockModuleRef = {
  get: jest.fn(() => mockLocalStorageService),
};

const mockReservationModel = {
  create: jest.fn(),
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
        {
          provide: ModuleRef,
          useValue: mockModuleRef,
        },
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

      expect(result).toEqual(expect.objectContaining(expectedResult));

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

    it('should throw error and delete file when database operation filed', async () => {
      mockReservationModel.create.mockImplementationOnce(() => {
        throw new Error();
      });

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
        expect.objectContaining({ filename: expectedFilename }),
        expect.objectContaining({ filename: expectedFilename }),
      ]);

      expect(result[0].filename).not.toEqual(result[1].filename);
    });
  });
});

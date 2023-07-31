import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ensureDir, writeFile, remove } from 'fs-extra';

import { LocalStorageService } from './local-storage.service';
import { FileUploadSource, FileMetadata } from './storage.interface';

// Mock the ConfigService
class MockConfigService {
  private data: any;
  constructor(data: any) {
    this.data = data;
  }
  getOrThrow(key: string) {
    if (this.data[key]) {
      return this.data[key];
    } else {
      throw new Error(`Config key '${key}' not found`);
    }
  }
}

// Mock fs-extra functions
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
}));

describe('LocalStorageService', () => {
  let localStorageService: LocalStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStorageService,
        {
          provide: ConfigService,
          useValue: new MockConfigService({
            'storage.uploadDir': '/uploads',
          }),
        },
      ],
    }).compile();

    localStorageService = module.get<LocalStorageService>(LocalStorageService);
  });

  describe('upload', () => {
    it('should upload a file and return the correct result', async () => {
      const file: FileUploadSource = {
        originalname: 'test.txt',
        filename: 'test_123.txt',
        buffer: Buffer.from('test content'),
      };

      const expectedDir = new Date().toISOString().slice(0, 10);

      const result: FileMetadata = await localStorageService.upload(file);

      expect(result).toEqual({
        url: expect.stringContaining(file.filename),
        originalname: file.originalname,
        filename: file.filename,
        destination: expect.stringContaining(expectedDir),
      });

      expect(ensureDir).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a file', async () => {
      const fileMetadata = {
        filename: 'test_123.txt',
        originalname: '',
        _id: '',
        url: '',
      };

      await localStorageService.delete(fileMetadata);

      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});

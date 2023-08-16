import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StorageService } from './storage.service';
import { StorageModel, StorageModelSchema } from './storage.model';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StorageModel.name, schema: StorageModelSchema, collection: 'files' },
    ]),
  ],
  exports: [StorageService],
  providers: [StorageService, LocalStorageService, S3StorageService],
})
export class StorageModule {}

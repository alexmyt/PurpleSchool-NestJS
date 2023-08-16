import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../lib/storage/storage.module';

import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomModel, RoomModelSchema } from './room.model';
import { RoomsSubjectHook } from './rooms.subject-hook';
import { RoomsImagesService } from './rooms-images.service';
import { RoomsImagesController } from './rooms-images.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomModel.name, schema: RoomModelSchema, collection: 'rooms' },
    ]),
    StorageModule,
  ],
  controllers: [RoomsController, RoomsImagesController],
  providers: [RoomsService, RoomsImagesService, RoomsSubjectHook],
  exports: [RoomsService, RoomsImagesService],
})
export class RoomsModule {}

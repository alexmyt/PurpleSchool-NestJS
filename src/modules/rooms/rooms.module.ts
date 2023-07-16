import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomModel, RoomModelSchema } from './room.model';
import { RoomsSubjectHook } from './rooms.subject-hook';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomModel.name, schema: RoomModelSchema, collection: 'rooms' },
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsSubjectHook],
  exports: [RoomsService],
})
export class RoomsModule {}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomModel } from './room.model';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(RoomModel.name) private roomModel: Model<RoomModel>) {}

  create(createRoomDto: CreateRoomDto): Promise<Document<RoomModel>> {
    return this.roomModel.create(createRoomDto);
  }

  findAll(): Promise<Document<RoomModel>[]> {
    return this.roomModel
      .find({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] })
      .lean()
      .exec();
  }

  findOneById(id: string): Promise<Document<RoomModel> | null> {
    return this.roomModel.findById(id).lean().exec();
  }

  update(id: string, updateRoomDto: UpdateRoomDto): Promise<Document<RoomModel>> {
    return this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { returnDocument: 'after' })
      .lean()
      .exec();
  }

  softRemove(id: string): Promise<Document<RoomModel> | null> {
    return this.roomModel
      .findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' })
      .lean()
      .exec();
  }
}

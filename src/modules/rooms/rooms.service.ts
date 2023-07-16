import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomModel, RoomModelDocument } from './room.model';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(RoomModel.name) private roomModel: Model<RoomModel>) {}

  create(createRoomDto: CreateRoomDto): Promise<RoomModelDocument> {
    return this.roomModel.create(createRoomDto);
  }

  findAll(): Promise<RoomModel[]> {
    return this.roomModel
      .find({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] })
      .lean()
      .exec();
  }

  findOneById(id: string): Promise<RoomModelDocument | null> {
    return this.roomModel.findById(id).exec();
  }

  update(id: string, updateRoomDto: UpdateRoomDto): Promise<RoomModel> {
    return this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { returnDocument: 'after' })
      .lean()
      .exec();
  }

  softRemove(id: string): Promise<RoomModel | null> {
    return this.roomModel
      .findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' })
      .lean()
      .exec();
  }

  remove(id: string): Promise<RoomModel | null> {
    return this.roomModel.findByIdAndDelete(id, { lean: true }).exec();
  }
}

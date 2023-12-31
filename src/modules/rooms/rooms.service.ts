import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { StorageService } from '../../lib/storage/storage.service';

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomModel, RoomModelDocument } from './room.model';
import { RoomEntity } from './rooms.service.interfaces';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(RoomModel.name) private roomModel: Model<RoomModel>,
    private readonly fileStorage: StorageService,
  ) {}

  create(createRoomDto: CreateRoomDto): Promise<RoomModelDocument> {
    return this.roomModel.create(createRoomDto);
  }

  findAll(): Promise<RoomEntity[]> {
    return this.roomModel
      .aggregate([
        { $match: { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] } },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              { $project: { name: 1 } },
            ],
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      ])
      .exec();
  }

  async findOneById(id: string): Promise<RoomEntity | null> {
    const result = await this.roomModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              { $project: { name: 1 } },
            ],
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'files',
            let: { ownerId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$ownerId', '$$ownerId'] }, { $eq: ['$isDeleted', false] }],
                  },
                },
              },
            ],
            as: 'images',
          },
        },
      ])
      .exec();

    return result.length ? result[0] : null;
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

  /** Removing a room record from the database - for now only for testing */
  remove(id: string): Promise<RoomModel | null> {
    return this.roomModel.findByIdAndDelete(id, { lean: true }).exec();
  }
}

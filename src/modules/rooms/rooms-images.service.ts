import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as sharp from 'sharp';

import { FileUploadResult } from '../../lib/storage/storage.interface';
import { StorageService } from '../../lib/storage/storage.service';

import { RoomModel } from './room.model';
import { ROOM_NOT_FOUND } from './rooms.constants';

@Injectable()
export class RoomsImagesService {
  constructor(
    @InjectModel(RoomModel.name) private roomModel: Model<RoomModel>,
    private readonly fileStorage: StorageService,
  ) {}

  async uploadImages(roomId: string, images: Express.Multer.File[]): Promise<FileUploadResult[]> {
    const room = await this.roomModel.findById(new Types.ObjectId(roomId)).lean().exec();
    if (!room) {
      throw new NotFoundException(ROOM_NOT_FOUND);
    }

    for (const image of images) {
      const resizedImage = await sharp(image.buffer)
        .resize({ width: 500, withoutEnlargement: true })
        .toBuffer();
      image.buffer = resizedImage;
    }

    const uploadResults = await this.fileStorage.uploadMany(images, room._id);

    return uploadResults;
  }

  deleteImage(roomId: string, imageId: string): Promise<void> {
    return this.fileStorage.delete(imageId);
  }
}

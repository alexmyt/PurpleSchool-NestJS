import { ApiProperty } from '@nestjs/swagger';

import { StorageModel } from '../../../lib/storage/storage.model';
import { RoomType } from '../room.model';

export class ImageResponseDTO extends StorageModel {
  _id: string;
}

class UserInfoDto {
  id: string;
  role: string;
}

export class RoomResponseDto {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: UserInfoDto;
  name: string;
  @ApiProperty({ enum: RoomType, enumName: 'roomType' })
  type: string;
  capacity: number;
  price: number;
  amenities: string[];
}

export class RoomResponseWithImagesDto extends RoomResponseDto {
  images: ImageResponseDTO[];
}

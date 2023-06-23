import { IsNotEmpty, IsNumber, IsPositive, IsInt, IsEnum } from 'class-validator';

import { RoomType } from '../room.model';

export class CreateRoomDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  capacity: number;

  amenities: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

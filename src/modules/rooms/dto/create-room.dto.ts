import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsEnum,
  IsString,
  ArrayNotEmpty,
  IsOptional,
  IsMongoId,
} from 'class-validator';

import { RoomType } from '../room.model';

export class CreateRoomDto {
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  userId: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  capacity: number;

  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  amenities: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

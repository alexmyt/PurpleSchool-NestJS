import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsEnum,
  IsString,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

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

  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  amenities: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

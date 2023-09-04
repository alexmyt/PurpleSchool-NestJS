import {
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsPositive,
  IsOptional,
  ArrayNotEmpty,
  IsString,
  IsNumber,
} from 'class-validator';

import { RoomType } from '../room.model';

export class UpdateRoomDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  capacity?: number;

  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  price?: number;
}

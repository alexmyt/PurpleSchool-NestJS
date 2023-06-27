import {
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  Matches,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsMongoId()
  roomId: string;

  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedFrom: string;

  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedTo: string;

  @IsOptional()
  @IsBoolean()
  isCanceled: boolean;
}

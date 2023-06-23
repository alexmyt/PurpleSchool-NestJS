import { IsNotEmpty, IsDateString, IsBoolean, MaxLength } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  @MaxLength(10)
  @IsDateString({ strict: true })
  rentedFrom: string;

  @IsNotEmpty()
  @MaxLength(10)
  @IsDateString({ strict: true })
  rentedTo: string;

  @IsBoolean()
  isCanceled: boolean;
}

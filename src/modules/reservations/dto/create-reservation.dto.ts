import { IsNotEmpty, IsDateString, IsBoolean, Matches } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedFrom: string;

  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedTo: string;

  @IsBoolean()
  isCanceled: boolean;
}

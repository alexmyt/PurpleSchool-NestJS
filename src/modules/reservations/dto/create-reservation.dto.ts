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

  @IsMongoId()
  userId: string;

  /**
   * Reservation from date
   *@example '2023-01-01'
   */
  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedFrom: string;

  /**
   * Reservation to date
   *@example '2023-01-31'
   */
  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedTo: string;

  /**
   * Reservation is canceled
   *
   */
  @IsOptional()
  @IsBoolean()
  isCanceled?: boolean = false;
}

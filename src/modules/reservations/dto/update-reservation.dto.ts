import { IsOptional, IsNotEmpty, Matches, IsDateString, IsBoolean } from 'class-validator';

export class UpdateReservationDto {
  /**
   * Reservation from date
   *@example '2023-01-01'
   */
  @IsOptional()
  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedFrom?: string;

  /**
   * Reservation to date
   *@example '2023-01-31'
   */
  @IsOptional()
  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  rentedTo?: string;

  @IsOptional()
  @IsBoolean()
  isCanceled?: boolean;
}

import { IsDateString, IsNotEmpty, Matches } from 'class-validator';

export class GetReservationsStatisticsDto {
  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  from: string;

  @IsNotEmpty()
  @Matches(/\d\d\d\d-\d\d-\d\d/)
  @IsDateString({ strict: true })
  to: string;
}

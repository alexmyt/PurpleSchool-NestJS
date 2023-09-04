import { IsMongoId } from 'class-validator';

export class GetReservationDto {
  @IsMongoId()
  id: string;
}

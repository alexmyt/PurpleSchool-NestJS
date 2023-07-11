import { PickType, PartialType } from '@nestjs/mapped-types';

import { CreateReservationDto } from './create-reservation.dto';

export class GetReservationDto extends PartialType(
  PickType(CreateReservationDto, ['rentedFrom', 'rentedTo']),
) {}

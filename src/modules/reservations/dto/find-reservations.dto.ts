import { PickType, PartialType } from '@nestjs/mapped-types';

import { CreateReservationDto } from './create-reservation.dto';

export class FindReservationsDto extends PartialType(
  PickType(CreateReservationDto, ['rentedFrom', 'rentedTo']),
) {}

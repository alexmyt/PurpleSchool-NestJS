import {
  Controller,
  Param,
  Body,
  Get,
  Query,
  Post,
  Patch,
  Delete,
  NotFoundException,
} from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { Action, UserRole } from '../../common/permission.enum';
import { CheckAbility } from '../../lib/casl/policies.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

import { ReservationsService } from './reservations.service';
import { GetReservationDto } from './dto/get-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationModel } from './reservation.model';
import { ReservationsSubjectHook } from './reservations.subject-hook';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.CREATE)
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Public()
  @Get('room/:roomId')
  async findForRoom(@Param('roomId') roomId: string, @Query() dto: GetReservationDto) {
    return this.reservationsService.findForRoom(roomId, dto);
  }

  @Public()
  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.reservationsService.findOneById(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.UPDATE)
  async update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    const result = await this.reservationsService.update(id, dto);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Patch(':id/cancel')
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.UPDATE)
  async cancel(@Param('id') id: string) {
    const result = await this.reservationsService.cancel(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Delete(':id')
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.DELETE)
  async remove(@Param('id') id: string) {
    const result = await this.reservationsService.delete(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}

import { Param, Body, Get, Query, Post, Patch, Delete, NotFoundException } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { Action, UserRole } from '../../common/permission.enum';
import { CheckAbility } from '../../lib/casl/policies.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetRoomDto } from '../rooms/dto/get-room.dto';
import { GenericController } from '../../common/decorators/controller.decorator';

import { ReservationsService } from './reservations.service';
import { RESERVATION_NOT_FOUND } from './reservations.constants';
import { FindReservationsDto } from './dto/find-reservations.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { GetReservationDto } from './dto/get-reservation.dto';
import { ReservationModel } from './reservation.model';
import { ReservationsSubjectHook } from './reservations.subject-hook';
import { GetReservationsStatisticsDto } from './dto/get-reservations-statistics.dto';
import { ReservationResponseDto } from './dto/reservation.response';

@GenericController('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Get reservation list for period. For admins only.
   */
  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reservation list for period. For admins only.' })
  @ApiOkResponse({ type: [ReservationResponseDto] })
  async getStats(@Query() { from, to }: GetReservationsStatisticsDto) {
    const result = await this.reservationsService.getRoomsStatistics(from, to);
    return result;
  }

  /**
   * Creates a new reservation for a room.
   */
  @Post()
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.CREATE)
  @ApiOperation({ summary: 'Create a new reservation for a room' })
  @ApiCreatedResponse({ type: ReservationResponseDto })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  /**
   * Retrieves a list of reservations for a specific room within a given period.
   */
  @Public()
  @Get('room/:id')
  @ApiOperation({ summary: 'Get reservation list for room for period' })
  @ApiOkResponse({ type: [ReservationResponseDto] })
  async findForRoom(@Param() { id }: GetRoomDto, @Query() dto: FindReservationsDto) {
    return this.reservationsService.findForRoom(id, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get reservation' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: RESERVATION_NOT_FOUND })
  async findOneById(@Param() { id }: GetReservationDto) {
    const result = await this.reservationsService.findOneById(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.UPDATE)
  @ApiOperation({ summary: 'Update reservation. For admins only.' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: RESERVATION_NOT_FOUND })
  async update(@Param() { id }: GetReservationDto, @Body() dto: UpdateReservationDto) {
    const result = await this.reservationsService.update(id, dto);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Patch(':id/cancel')
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.UPDATE)
  @ApiOperation({ summary: 'Cancel reservation' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: RESERVATION_NOT_FOUND })
  async cancel(@Param() { id }: GetReservationDto) {
    const result = await this.reservationsService.cancel(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Delete(':id')
  @CheckAbility(ReservationModel, ReservationsSubjectHook, Action.DELETE)
  @ApiOperation({ summary: 'Remove reservation from DB. For admins and test purposes only.' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: RESERVATION_NOT_FOUND })
  async remove(@Param() { id }: GetReservationDto) {
    const result = await this.reservationsService.delete(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}

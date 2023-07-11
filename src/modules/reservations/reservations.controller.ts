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

import { ReservationsService } from './reservations.service';
import { GetReservationDto } from './dto/get-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get('room/:roomId')
  async findForRoom(@Param('roomId') roomId: string, @Query() dto: GetReservationDto) {
    return this.reservationsService.findForRoom(roomId, dto);
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.reservationsService.findOneById(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    const result = await this.reservationsService.update(id, dto);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.reservationsService.delete(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}

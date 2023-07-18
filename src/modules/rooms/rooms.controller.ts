import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { CheckAbility } from '../../lib/casl/policies.decorator';
import { Action } from '../../common/permission.enum';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetRoomDto } from './dto/get-room.dto';
import { RoomsSubjectHook } from './rooms.subject-hook';
import { RoomModel } from './room.model';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.CREATE)
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Public()
  @Get(':id')
  async findOneById(@Param() { id }: GetRoomDto) {
    const result = await this.roomsService.findOneById(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Patch(':id')
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.UPDATE)
  async update(@Param() { id }: GetRoomDto, @Body() updateRoomDto: UpdateRoomDto) {
    const result = await this.roomsService.update(id, updateRoomDto);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Delete(':id')
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.DELETE)
  async remove(@Param() { id }: GetRoomDto) {
    const result = await this.roomsService.softRemove(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}

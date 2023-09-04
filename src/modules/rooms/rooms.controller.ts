import { Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { CheckAbility } from '../../lib/casl/policies.decorator';
import { Action } from '../../common/permission.enum';
import { GenericController } from '../../common/decorators/controller.decorator';

import { RoomsService } from './rooms.service';
import { ROOM_NOT_FOUND } from './rooms.constants';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetRoomDto } from './dto/get-room.dto';
import { RoomsSubjectHook } from './rooms.subject-hook';
import { RoomModel } from './room.model';
import { RoomResponseDto, RoomResponseWithImagesDto } from './dto/room.response';

@GenericController('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.CREATE)
  @ApiOperation({ summary: 'Create a new room for user' })
  @ApiCreatedResponse({ type: RoomResponseWithImagesDto })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiOkResponse({ type: [RoomResponseDto] })
  findAll() {
    return this.roomsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get room' })
  @ApiOkResponse({ type: RoomResponseWithImagesDto })
  @ApiNotFoundResponse({ description: ROOM_NOT_FOUND })
  async findOneById(@Param() { id }: GetRoomDto) {
    const result = await this.roomsService.findOneById(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Patch(':id')
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.UPDATE)
  @ApiOperation({ summary: 'Update room' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiOkResponse({ type: RoomResponseWithImagesDto })
  @ApiNotFoundResponse({ description: ROOM_NOT_FOUND })
  async update(@Param() { id }: GetRoomDto, @Body() updateRoomDto: UpdateRoomDto) {
    const result = await this.roomsService.update(id, updateRoomDto);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Delete(':id')
  @CheckAbility(RoomModel, RoomsSubjectHook, Action.DELETE)
  @ApiOperation({ summary: 'Delete room' })
  @ApiOkResponse({ type: RoomResponseWithImagesDto })
  @ApiNotFoundResponse({ description: ROOM_NOT_FOUND })
  async remove(@Param() { id }: GetRoomDto) {
    const result = await this.roomsService.softRemove(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}

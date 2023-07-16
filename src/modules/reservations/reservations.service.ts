import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { RoomsService } from '../rooms/rooms.service';

import { ReservationModel, ReservationModelDocument } from './reservation.model';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetReservationDto } from './dto/get-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

export interface ReservationPeriod {
  rentedFrom: Date;
  rentedTo: Date;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(ReservationModel.name) private readonly reservationModel: Model<ReservationModel>,
    private readonly roomsService: RoomsService,
  ) {}

  async create(createScheduleDto: CreateReservationDto): Promise<ReservationModelDocument> {
    const { roomId } = createScheduleDto;

    const room = await this.roomsService.findOneById(roomId);
    if (!room) {
      throw new NotFoundException();
    }

    const { rentedFrom, rentedTo } = this.rentedPeriodsToDates(createScheduleDto);

    const currentRoomReservations = await this.getRoomReservations(room.id, {
      rentedFrom,
      rentedTo,
    });

    if (currentRoomReservations.length) {
      throw new ConflictException();
    }

    return this.reservationModel.create({
      ...createScheduleDto,
      roomId: room._id,
      rentedFrom,
      rentedTo,
    });
  }

  findForRoom(roomId: string, dto: GetReservationDto): Promise<ReservationModel[]> {
    return this.getRoomReservations(roomId, this.rentedPeriodsToDates(dto));
  }

  findOneById<L = false>(
    reservationId: string,
    lean?: L,
  ): Promise<(ReservationModel | ReservationModelDocument) | null> {
    return this.reservationModel.findById(reservationId).lean(lean).exec();
  }

  async update(reservationId: string, dto: UpdateReservationDto): Promise<ReservationModel | null> {
    const { rentedFrom, rentedTo, ...rest } = dto;
    const rentedPeriod = this.rentedPeriodsToDates({ rentedFrom, rentedTo });
    return this.reservationModel
      .findByIdAndUpdate(reservationId, { ...rentedPeriod, ...rest }, { returnDocument: 'after' })
      .lean()
      .exec();
  }

  cancel(reservationId: string): Promise<ReservationModel | null> {
    return this.reservationModel
      .findByIdAndUpdate(reservationId, { isCanceled: true }, { returnDocument: 'after' })
      .lean()
      .exec();
  }

  delete(reservationId: string): Promise<ReservationModel | null> {
    return this.reservationModel.findByIdAndDelete(reservationId).lean().exec();
  }

  /**
   * Return room reservation periods within dates in given period
   */
  async getRoomReservations(
    roomId: string,
    period?: Partial<ReservationPeriod>,
  ): Promise<ReservationModel[]> {
    const query = this.reservationModel.find({
      roomId: new Types.ObjectId(roomId),
      isCanceled: false,
    });

    if (period?.rentedFrom && period?.rentedTo) {
      query.where({
        $or: [
          { rentedFrom: { $gte: period.rentedFrom, $lte: period.rentedTo } },
          { rentedTo: { $gte: period.rentedFrom, $lte: period.rentedTo } },
          { rentedFrom: { $lt: period.rentedFrom }, rentedTo: { $gt: period.rentedTo } },
        ],
      });
    } else if (period?.rentedFrom) {
      query.where({
        $or: [
          { rentedFrom: { $gte: period.rentedFrom } },
          { rentedTo: { $gte: period.rentedFrom } },
        ],
      });
    } else if (period?.rentedTo) {
      query.where({
        $or: [{ rentedFrom: { $lte: period.rentedTo } }, { rentedTo: { $lte: period.rentedTo } }],
      });
    }

    return query.lean().exec();
  }

  /**
   * Return rented periods from DTO as dates from day start and day ending
   */
  private rentedPeriodsToDates(
    dto: Partial<Pick<CreateReservationDto, 'rentedFrom' | 'rentedTo'>>,
  ): ReservationPeriod {
    const { rentedFrom, rentedTo } = dto;
    return {
      rentedFrom: dto.rentedFrom && new Date(new Date(rentedFrom).setUTCHours(0, 0, 0, 0)),
      rentedTo: dto.rentedTo && new Date(new Date(rentedTo).setUTCHours(23, 59, 59, 999)),
    };
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { RoomsService } from '../rooms/rooms.service';
import { TelegramService } from '../../lib/telegram/telegram.service';

import { ReservationModel, ReservationModelDocument } from './reservation.model';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FindReservationsDto } from './dto/find-reservations.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationEntity, ReservationStatisticsByRoom } from './reservations.service.interfaces';

export interface ReservationPeriod {
  rentedFrom: Date;
  rentedTo: Date;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(ReservationModel.name) private readonly reservationModel: Model<ReservationModel>,
    private readonly roomsService: RoomsService,
    private readonly telegramService: TelegramService,
  ) {}

  async create(createScheduleDto: CreateReservationDto): Promise<ReservationModelDocument> {
    const { roomId } = createScheduleDto;

    const room = await this.roomsService.findOneById(roomId);
    if (!room) {
      throw new NotFoundException();
    }

    const { rentedFrom, rentedTo } = this.rentedPeriodsToDates(createScheduleDto);

    const isReserved = await this.isReserved(roomId, rentedFrom, rentedTo);

    if (isReserved) {
      throw new ConflictException();
    }

    const result = await this.reservationModel.create({
      ...createScheduleDto,
      roomId: room._id,
      rentedFrom,
      rentedTo,
    });

    this.telegramService.sendMessage(
      `\u0000\u2714 <b>Reservation created</b>\n` +
        `Room: ${room.name}\n` +
        `Room #: ${room._id}\n` +
        `Period: ${rentedFrom.toDateString()} - ${rentedTo.toDateString()}`,
    );

    return result;
  }

  findForRoom(roomId: string, dto: FindReservationsDto): Promise<ReservationModel[]> {
    return this.getRoomReservations(roomId, this.rentedPeriodsToDates(dto));
  }

  async findOneById(reservationId: string): Promise<ReservationEntity | null> {
    const result = await this.reservationModel
      .aggregate()
      .match({ _id: new Types.ObjectId(reservationId) })
      .lookup({
        from: 'users',
        let: { userId: '$userId' },
        pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } }, { $project: { name: 1 } }],
        as: 'user',
      })
      .unwind({ path: '$user', preserveNullAndEmptyArrays: true })
      .lookup({ from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'room' })
      .unwind({ path: '$room', preserveNullAndEmptyArrays: true })
      .exec();

    return result.length ? result[0] : null;
  }

  async update(reservationId: string, dto: UpdateReservationDto): Promise<ReservationModel | null> {
    const { rentedFrom, rentedTo, ...rest } = dto;
    const rentedPeriod = this.rentedPeriodsToDates({ rentedFrom, rentedTo });
    return this.reservationModel
      .findByIdAndUpdate(reservationId, { ...rentedPeriod, ...rest }, { returnDocument: 'after' })
      .lean()
      .exec();
  }

  async cancel(reservationId: string): Promise<ReservationModel | null> {
    const result = await this.reservationModel
      .findByIdAndUpdate(reservationId, { isCanceled: true }, { returnDocument: 'after' })
      .lean()
      .exec();

    this.telegramService.sendMessage(
      `\u0000\u274c <b>Reservation canceled</b>\n` +
        `Room #: ${result.roomId}\n` +
        `Period: ${result.rentedFrom.toDateString()} - ${result.rentedTo.toDateString()}`,
    );

    return result;
  }

  delete(reservationId: string): Promise<ReservationModel | null> {
    return this.reservationModel.findByIdAndDelete(reservationId).lean().exec();
  }

  /**
   * Return true if room has been reserved in period
   */
  async isReserved(roomId: string, from: string | Date, to: string | Date): Promise<boolean> {
    const dateFrom = this.startOfDayUTC(from);
    const dateTo = this.endOfDayUTC(to);

    const result = await this.reservationModel.findOne().where({
      roomId: new Types.ObjectId(roomId),
      isCanceled: false,
      $or: [
        { rentedFrom: { $gte: dateFrom, $lte: dateTo } },
        { rentedTo: { $gte: dateFrom, $lte: dateTo } },
        { rentedFrom: { $lt: dateFrom }, rentedTo: { $gt: dateTo } },
      ],
    });

    return result !== null;
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
   * Return reservations statistics by room in the period
   */
  async getRoomsStatistics(from: string, to: string): Promise<ReservationStatisticsByRoom[]> {
    // From day start
    const dateFrom = this.startOfDayUTC(from);
    // To day end
    const dateTo = this.endOfDayUTC(to);

    const result = await this.reservationModel
      .aggregate()
      // Get all reservations which included (fully or partial) to requested period
      .match({
        $or: [
          { rentedFrom: { $gte: dateFrom, $lte: dateTo } },
          { rentedTo: { $gte: dateFrom, $lte: dateTo } },
          { rentedFrom: { $lt: dateFrom }, rentedTo: { $gt: dateTo } },
        ],
      })
      // Trim reservation periods to requested period
      .addFields({
        rentedFrom: { $max: [dateFrom, '$rentedFrom'] },
        rentedTo: { $min: [dateTo, '$rentedTo'] },
      })
      // Setting dates to the beginning of days to help MongoDB count full days
      .addFields({
        // rentedFrom - start of the day
        rentedFrom: { $dateTrunc: { date: '$rentedFrom', unit: 'day' } },
        // rentedTo - start of the next day
        rentedTo: {
          $dateTrunc: {
            date: { $dateAdd: { startDate: '$rentedTo', unit: 'day', amount: 1 } },
            unit: 'day',
          },
        },
      })
      // Count days in periods
      .addFields({
        bookedDaysCount: {
          $dateDiff: { startDate: '$rentedFrom', endDate: '$rentedTo', unit: 'day' },
        },
      })
      // Group results by room and booked days count
      .group({ _id: '$roomId', bookedDaysCount: { $sum: '$bookedDaysCount' } })
      // Add rooms data
      .lookup({ from: 'rooms', as: 'room', localField: '_id', foreignField: '_id' })
      // Convert field 'room' from array of objects to a single object
      .unwind('$room')
      .project({ roomId: '$_id', bookedDaysCount: 1, room: 1 })
      .project({ _id: 0 })
      .exec();

    return result;
  }

  private startOfDayUTC(date: string | number | Date): Date {
    const localDate = new Date(date);
    return new Date(
      Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0),
    );
  }

  private endOfDayUTC(date: string | number | Date): Date {
    const localDate = new Date(date);
    return new Date(
      Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59, 999),
    );
  }

  /**
   * Return rented periods from DTO as dates from day start and day ending
   */
  private rentedPeriodsToDates(
    dto: Partial<Pick<CreateReservationDto, 'rentedFrom' | 'rentedTo'>>,
  ): ReservationPeriod {
    const { rentedFrom, rentedTo } = dto;

    return {
      rentedFrom: rentedFrom && this.startOfDayUTC(rentedFrom),
      rentedTo: rentedTo && this.endOfDayUTC(rentedTo),
    };
  }
}

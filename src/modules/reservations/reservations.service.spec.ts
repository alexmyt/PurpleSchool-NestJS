import { NotFoundException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';

import { ReservationModel } from './reservation.model';
import { ReservationsService } from './reservations.service';
import { EVENTS } from './reservations.constants';

describe('ReservationService', () => {
  let service: ReservationsService;

  const mockedObjectId = { toHexString: jest.fn() };
  const exec = {
    exec: jest.fn(() => {
      _id: mockedObjectId;
    }),
  };
  const where = jest.fn();
  const mockReservationModel = {
    find: jest.fn(() => ({ where, lean: () => exec })),
    findOne: jest.fn(() => ({ where, lean: () => exec })),
    findByIdAndUpdate: jest.fn(() => ({ lean: () => exec })),
    create: jest.fn(() => ({ toObject: jest.fn(() => ({})), _id: mockedObjectId })),
    countDocuments: jest.fn(() => ({ exec: jest.fn(() => 0) })),
  };
  const mockRoomsService = {
    findOneById: jest.fn(() => ({ where, lean: () => exec, _id: mockedObjectId })),
  };
  const mockUsersService = {
    findOneById: jest.fn(() => ({ where, lean: () => exec, _id: mockedObjectId })),
  };
  const mockEventEmitter2 = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getModelToken(ReservationModel.name), useValue: mockReservationModel },
        { provide: RoomsService, useValue: mockRoomsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: EventEmitter2, useValue: mockEventEmitter2 },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should create new reservation for room', async () => {
      const dto = {
        userId: '1',
        roomId: new Types.ObjectId().toHexString(),
        rentedFrom: '2023-01-01',
        rentedTo: '2023-01-01',
      };

      const expectedFrom = new Date(Date.UTC(2023, 0, 1));
      const expectedTo = new Date(Date.UTC(2023, 0, 2) - 1);

      jest.spyOn(service, 'isReserved').mockResolvedValueOnce(false);

      await service.create(dto);

      expect(service.isReserved).toHaveBeenCalledTimes(1);
      expect(service.isReserved).toHaveBeenCalledWith(dto.roomId, expectedFrom, expectedTo);
      expect(mockEventEmitter2.emit).toHaveBeenCalledWith(
        EVENTS.reservationCreated,
        expect.any(Object),
      );
    });

    it('should throw a NotFoundException when the room does not exist', async () => {
      const dto = {
        userId: '1',
        roomId: new Types.ObjectId().toHexString(),
        rentedFrom: '2023-01-01',
        rentedTo: '2023-01-01',
      };

      mockRoomsService.findOneById.mockReturnValueOnce(null);

      expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw a ConflictException when the room is already reserved for the given period', async () => {
      const dto = {
        userId: '1',
        roomId: new Types.ObjectId().toHexString(),
        rentedFrom: '2023-01-01',
        rentedTo: '2023-01-01',
      };

      mockReservationModel.countDocuments.mockReturnValueOnce({
        exec: jest.fn(() => 1),
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('cancel', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should cancel a reservation and return the updated reservation object', async () => {
      const reservationId = '';

      mockReservationModel.findByIdAndUpdate.mockReturnValueOnce({
        lean: jest.fn(() => ({
          exec: jest.fn().mockReturnValueOnce({ _id: { toHexString: jest.fn() }, roomId: '' }),
        })),
      });

      await service.cancel(reservationId);

      expect(mockReservationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        reservationId,
        { isCanceled: true },
        expect.any(Object),
      );

      expect(mockEventEmitter2.emit).toHaveBeenCalledWith(
        EVENTS.reservationCanceled,
        expect.any(Object),
      );
    });
  });

  describe('isReserved', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return false when the room is not reserved in the specified period', async () => {
      const rentedFrom = '2023-01-01';
      const rentedTo = '2023-01-01';

      const expected$gte = new Date(Date.UTC(2023, 0, 1));
      const expected$lte = new Date(Date.UTC(2023, 0, 2) - 1);

      const result = await service.isReserved(
        new Types.ObjectId().toHexString(),
        rentedFrom,
        rentedTo,
      );

      expect(result).toBeFalsy();

      expect(mockReservationModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ rentedFrom: { $gte: expected$gte, $lte: expected$lte } }),
          ]),
        }),
      );
    });

    it('should return true when the room is reserved in the specified period', async () => {
      const rentedFrom = '2023-01-01';
      const rentedTo = '2023-01-01';

      mockReservationModel.countDocuments.mockReturnValueOnce({
        exec: jest.fn(() => 1),
      });

      const result = await service.isReserved(
        new Types.ObjectId().toHexString(),
        rentedFrom,
        rentedTo,
      );

      expect(result).toBeTruthy();
    });
  });

  describe('getRoomReservations', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should be called without where when period is empty', async () => {
      const roomId = new Types.ObjectId().toHexString();

      await service.getRoomReservations(roomId);

      expect(mockReservationModel.find).toHaveBeenCalledTimes(1);
      expect(mockReservationModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ roomId: new Types.ObjectId(roomId) }),
      );
      expect(mockReservationModel.find().where).toHaveBeenCalledTimes(0);
      expect(mockReservationModel.find().lean().exec).toHaveBeenCalledTimes(1);
    });

    it('should be called with $gte when period is from only', async () => {
      const roomId = new Types.ObjectId().toHexString();
      const dto = { rentedFrom: new Date('2023-07-01') };

      await service.getRoomReservations(roomId, dto);

      expect(mockReservationModel.find().where).toHaveBeenCalledTimes(1);
      expect(mockReservationModel.find().where).toHaveBeenCalledWith({
        $or: [{ rentedFrom: { $gte: dto.rentedFrom } }, { rentedTo: { $gte: dto.rentedFrom } }],
      });
      expect(mockReservationModel.find().lean().exec).toHaveBeenCalledTimes(1);
    });

    it('should be called with $lte when period is to only', async () => {
      const roomId = new Types.ObjectId().toHexString();
      const dto = { rentedTo: new Date('2023-07-01') };

      await service.getRoomReservations(roomId, dto);

      expect(mockReservationModel.find().where).toHaveBeenCalledTimes(1);
      expect(mockReservationModel.find().where).toHaveBeenCalledWith({
        $or: [{ rentedFrom: { $lte: dto.rentedTo } }, { rentedTo: { $lte: dto.rentedTo } }],
      });
      expect(mockReservationModel.find().lean().exec).toHaveBeenCalledTimes(1);
    });

    it('should be called with $lte and $gte when period is from and to either', async () => {
      const roomId = new Types.ObjectId().toHexString();
      const dto = { rentedFrom: new Date('2023-07-01'), rentedTo: new Date('2023-07-02') };

      await service.getRoomReservations(roomId, dto);

      expect(mockReservationModel.find().where).toHaveBeenCalledTimes(1);
      expect(mockReservationModel.find().where).toHaveBeenCalledWith({
        $or: [
          { rentedFrom: { $gte: dto.rentedFrom, $lte: dto.rentedTo } },
          { rentedTo: { $gte: dto.rentedFrom, $lte: dto.rentedTo } },
          { rentedFrom: { $lt: dto.rentedFrom }, rentedTo: { $gt: dto.rentedTo } },
        ],
      });
      expect(mockReservationModel.find().lean().exec).toHaveBeenCalledTimes(1);
    });
  });
});

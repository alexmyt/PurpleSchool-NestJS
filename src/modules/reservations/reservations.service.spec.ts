import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../../lib/notifications/notifications.service';

import { ReservationModel } from './reservation.model';
import { ReservationsService } from './reservations.service';

describe('ReservationService', () => {
  let service: ReservationsService;

  const exec = { exec: jest.fn() };
  const where = jest.fn();
  const mockReservationModel = {
    find: jest.fn(() => ({ where, lean: () => exec })),
    findOne: jest.fn(() => ({ where, lean: () => exec })),
    create: jest.fn(() => ({ toObject: jest.fn(() => ({})) })),
  };
  const mockRoomsService = {
    findOneById: jest.fn(() => ({ where, lean: () => exec })),
  };
  const mockUsersService = {
    findOneById: jest.fn(() => ({ where, lean: () => exec })),
  };
  const mockNotificationsService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getModelToken(ReservationModel.name), useValue: mockReservationModel },
        { provide: RoomsService, useValue: mockRoomsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: NotificationsService, useValue: mockNotificationsService },
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
    });

    it('isReserved', async () => {
      const rentedFrom = '2023-01-01';
      const rentedTo = '2023-01-01';

      const expected$gte = new Date(Date.UTC(2023, 0, 1));
      const expected$lte = new Date(Date.UTC(2023, 0, 2) - 1);

      await service.isReserved(new Types.ObjectId().toHexString(), rentedFrom, rentedTo);

      expect(mockReservationModel.findOne).toBeCalledTimes(1);
      expect(mockReservationModel.findOne().where).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ rentedFrom: { $gte: expected$gte, $lte: expected$lte } }),
          ]),
        }),
      );
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

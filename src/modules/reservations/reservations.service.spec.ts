import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { RoomsService } from '../rooms/rooms.service';

import { ReservationModel } from './reservation.model';
import { ReservationsService } from './reservations.service';

describe('ReservationService', () => {
  let service: ReservationsService;

  const exec = { exec: jest.fn() };
  const where = jest.fn();
  const mockReservationModel = {
    find: jest.fn(() => ({ where, lean: () => exec })),
  };
  const mockRoomsService = {};

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getModelToken(ReservationModel.name), useValue: mockReservationModel },
        { provide: RoomsService, useValue: mockRoomsService },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
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

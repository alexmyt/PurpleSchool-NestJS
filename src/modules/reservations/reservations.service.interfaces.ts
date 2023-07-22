import { RoomType } from '../rooms/room.model';

export interface ReservationEntity {
  _id: string;
  roomId: string;
  room: {
    _id: string;
    name: string;
    type: RoomType;
    capacity: number;
    amenities: string[];
    price: number;
    userId: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  rentedFrom: Date;
  rentedTo: Date;
  userId: string;
  user: {
    _id: string;
    name: string;
  };
  isCanceled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationStatisticsByRoom {
  roomId: string;
  bookedDaysCount: number;
  room: {
    _id: string;
    name: string;
    type: RoomType;
  };
}

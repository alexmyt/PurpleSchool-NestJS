import { RoomType } from './room.model';

export interface RoomEntity {
  _id: string;
  name: string;
  type: RoomType;
  capacity: number;
  amenities: string[];
  price: number;
  userId: string;
  user: {
    _id: string;
    name: string;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

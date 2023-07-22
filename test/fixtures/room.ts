import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

import { RoomType } from '../../src/modules/rooms/room.model';

import { testUsers } from './user';

export const fakeRoom = () => {
  return {
    name: faker.word.words(3),
    type: faker.helpers.enumValue(RoomType),
    capacity: faker.number.int({ min: 1, max: 10 }),
    price: faker.number.int({ min: 10, max: 100 }),
    amenities: faker.helpers.multiple(faker.word.noun, { count: { min: 2, max: 4 } }),
  };
};

export const createRoomDto = fakeRoom();

export const fakeRoomList = [
  {
    ...fakeRoom(),
    _id: new mongoose.Types.ObjectId('e426eeefeb837ca83b38d5cc'),
    userId: testUsers.user._id,
    name: 'Red test user room',
  },
  {
    ...fakeRoom(),
    _id: new mongoose.Types.ObjectId('afe46af18ab996d692727c6d'),
    userId: testUsers.user._id,
    name: 'Green test user room',
  },
  {
    ...fakeRoom(),
    _id: new mongoose.Types.ObjectId('bb5bcfaa6f2f8d26ab8eeec4'),
    userId: testUsers.user._id,
    name: 'Blue test user room',
  },
];

import { faker } from '@faker-js/faker';

import { RoomType } from '../../src/modules/rooms/room.model';

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

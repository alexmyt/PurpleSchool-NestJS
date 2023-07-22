import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

import { UserRole } from '../../src/common/permission.enum';

const fakeUser = () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+79#########'),
    password: faker.internet.password(),
    role: UserRole.USER,
  };
};

export const testUsers = {
  admin: {
    ...fakeUser(),
    _id: new mongoose.Types.ObjectId(faker.database.mongodbObjectId()),
    email: 'test.admin@dot.com',
    password: 'Admin@1',
    role: UserRole.ADMIN,
  },
  user: {
    ...fakeUser(),
    _id: new mongoose.Types.ObjectId(faker.database.mongodbObjectId()),
    email: 'test.user@dot.com',
    password: 'User@1',
  },
  nonExisting: {
    email: 'test.null@dot.com',
    password: 'Null1@',
  },
};

export const createUserDto = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number('+79#########'),
  password: faker.internet.password(),
};

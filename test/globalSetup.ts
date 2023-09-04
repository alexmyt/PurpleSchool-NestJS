import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';

import { ConfigModule } from '../src/lib/config/config.module';
import { HelperService } from '../src/common/helper.service';

import { testUsers } from './fixtures/user';
import { fakeRoomList } from './fixtures/room';
import { fakeReservationList } from './fixtures/reservations';

const setup = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule],
  }).compile();

  const config = moduleFixture.get(ConfigService);

  await mongoose.connect(config.getOrThrow('mongodb.uri'), {
    user: config.get('mongodb.user'),
    pass: config.get('mongodb.pass'),
    dbName: config.get('mongodb.dbName'),
  });

  await clearDb();

  await addTestUsers();
  await addTestRooms();
  await addTestReservations();

  mongoose.disconnect();
};

const clearDb = async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany();
  }
};

const addTestUsers = async () => {
  const usersCollection = mongoose.connection.db.collection('users');
  for (const { password, ...newUser } of [testUsers.admin, testUsers.user]) {
    const hashedPassword = await HelperService.hashPassword(password);
    await usersCollection.insertOne({ ...newUser, hashedPassword });
  }
};

const addTestRooms = async () => {
  const roomsCollection = mongoose.connection.db.collection('rooms');
  await roomsCollection.insertMany(fakeRoomList);
};

const addTestReservations = async () => {
  const reservationsCollection = mongoose.connection.db.collection('reservations');
  await reservationsCollection.insertMany(fakeReservationList);
};

export default setup;

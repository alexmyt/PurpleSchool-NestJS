import { Test, TestingModule } from '@nestjs/testing';
import { disconnect } from 'mongoose';

import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';

import { testUsers } from './fixtures/user';

const setup = async (): Promise<void> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  const userService = app.get(UsersService);

  let testAdmin = await userService.findOneByEmail(testUsers.admin.email);
  if (testAdmin) {
    await testAdmin.deleteOne();
  }
  testAdmin = await userService.create(testUsers.admin);

  let testUser = await userService.findOneByEmail(testUsers.user.email);
  if (testUser) {
    await testUser.deleteOne();
  }
  testUser = await userService.create(testUsers.user);

  disconnect();
};

export default setup;

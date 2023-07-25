import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { disconnect, Types } from 'mongoose';

import { AppModule } from '../src/app.module';
import { AppUtils } from '../src/common/app.utils';
import { UsersService } from '../src/modules/users/users.service';
import { UserRole } from '../src/common/permission.enum';

import { testUsers, createUserDto } from './fixtures/user';

describe('Users controller (e2e)', () => {
  let app: INestApplication;

  // existing test users
  let testAdminToken: string;
  let testUserId: string;
  let testUserToken: string;

  // new test user
  let createdUserId: string;
  let createdUserToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(AppUtils.validationPipeOptions()));
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUsers.admin.email, password: testUsers.admin.password })
      .expect(200)
      .then(({ body }) => {
        testAdminToken = body.accessToken;
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUsers.user.email, password: testUsers.user.password })
      .expect(200)
      .then(({ body }) => {
        testUserToken = body.accessToken;
        testUserId = body.user.id;
      });
  });

  afterAll(async () => {
    if (createdUserId) {
      const roomsService = app.get(UsersService);
      await roomsService.remove(createdUserId);
    }
    disconnect();
  });

  it('should not create a new user from unregistered, POST /users', () => {
    return request(app.getHttpServer()).post('/users').send(createUserDto).expect(401);
  });

  it('should not create a new user from user with USER role, POST /users', () => {
    return request(app.getHttpServer())
      .post('/users')
      .auth(testUserToken, { type: 'bearer' })
      .send(createUserDto)
      .expect(403);
  });

  it('should create a new user from user with ADMIN role, POST /users', () => {
    return request(app.getHttpServer())
      .post('/users')
      .auth(testAdminToken, { type: 'bearer' })
      .send({ ...createUserDto, role: UserRole.USER })
      .expect(201)
      .then(async ({ body }) => {
        if (body._id) {
          const userService = app.get(UsersService);
          await userService.remove(body._id);
        }
      });
  });

  it('should register a new user, POST /users/register', () => {
    const { password, ...returnUser } = createUserDto;

    return request(app.getHttpServer())
      .post('/users/register')
      .send(createUserDto)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        createdUserId = body._id;

        expect(body).toEqual(expect.objectContaining(returnUser));
        expect(body).toHaveProperty('role', UserRole.USER);
      });
  });

  it('should login a created user, POST /auth/login', () => {
    const { email, password } = createUserDto;
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toHaveProperty('accessToken');
        createdUserToken = body.accessToken;
      });
  });

  it('should get yourself , GET /users/:id', () => {
    const { password, ...returnUser } = createUserDto;

    return request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .auth(createdUserToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ ...returnUser, role: UserRole.USER }));
      });
  });

  it('should get a list of users from admin, GET /users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .auth(testAdminToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ email: testUsers.admin.email }),
            expect.objectContaining({ email: testUsers.user.email }),
          ]),
        );
      });
  });

  it('should not get a list of users from guest', () => {
    return request(app.getHttpServer()).get('/users').expect(401);
  });

  it('should not get a list of users from registered', () => {
    return request(app.getHttpServer())
      .get('/users')
      .auth(testUserToken, { type: 'bearer' })
      .expect(403);
  });

  it('should update yourself, PATCH /users/:id', () => {
    const updateDto = { name: 'new user name' };

    return request(app.getHttpServer())
      .patch(`/users/${testUserId}`)
      .auth(testUserToken, { type: 'bearer' })
      .send(updateDto)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining(updateDto));
      });
  });

  it('should not update password from yourself, PATCH /users/:id', () => {
    const updateDto = { password: 'newPassword' };
    return request(app.getHttpServer())
      .patch(`/users/${testUserId}`)
      .auth(testUserToken, { type: 'bearer' })
      .send(updateDto)
      .expect(400);
  });

  it('should update password from yourself, PATCH /users/:id/password', () => {
    const updateDto = { oldPassword: createUserDto.password, password: 'newPassword' };

    return request(app.getHttpServer())
      .patch(`/users/${createdUserId}/password`)
      .auth(createdUserToken, { type: 'bearer' })
      .send(updateDto)
      .expect(200);
  });

  it('should update an existing user from admin, PATCH /users/:id', () => {
    const updateDto = { name: 'new user name from admin' };

    return request(app.getHttpServer())
      .patch(`/users/${testUserId}`)
      .auth(testAdminToken, { type: 'bearer' })
      .send(updateDto)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining(updateDto));
      });
  });

  it('should not update an existing user from other user, PATCH /users/:id', () => {
    const updateDto = { name: 'new user name from admin' };

    return request(app.getHttpServer())
      .patch(`/users/${createdUserId}`)
      .auth(testUserToken, { type: 'bearer' })
      .send(updateDto)
      .expect(403);
  });

  it('should not soft-delete user from unregistered, DELETE /users/:id', () => {
    return request(app.getHttpServer()).delete(`/users/${createdUserId}`).expect(401);
  });

  it('should not soft-delete user from yourself, DELETE /users/:id', () => {
    return request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .auth(createdUserToken, { type: 'bearer' })
      .expect(403);
  });

  it('should not soft-delete an existing user from other user, DELETE /users/:id', () => {
    return request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(403);
  });

  it('should soft-delete an existing user from admin, DELETE /users/:id', () => {
    return request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .auth(testAdminToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toHaveProperty('isDeleted', true);
      });
  });

  it('should return 404 when get user that not exist, GET /users/:id', () => {
    const nonexistingUserId = new Types.ObjectId();

    return request(app.getHttpServer())
      .get(`/users/${nonexistingUserId}`)
      .auth(testAdminToken, { type: 'bearer' })
      .expect(404);
  });

  it('should return 404 when update user that not exist, UPDATE /users/:id', () => {
    const nonexistingUserId = new Types.ObjectId();

    return request(app.getHttpServer())
      .patch(`/users/${nonexistingUserId}`)
      .auth(testAdminToken, { type: 'bearer' })
      .expect(404);
  });

  it('should return 404 when delete user that not exist, DELETE /users/:id', async () => {
    const nonexistingUserId = new Types.ObjectId();

    const result = await request(app.getHttpServer())
      .delete(`/users/${nonexistingUserId}`)
      .auth(testAdminToken, { type: 'bearer' });
  });
});

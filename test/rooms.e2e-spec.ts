import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { disconnect, Types } from 'mongoose';

import { AppModule } from '../src/app.module';
import { AppUtils } from '../src/common/app.utils';
import { RoomsService } from '../src/modules/rooms/rooms.service';
import { RoomModelDocument } from '../src/modules/rooms/room.model';

import { createRoomDto, fakeRoom } from './fixtures/room';
import { testUsers } from './fixtures/user';

describe('Rooms controller (e2e)', () => {
  let app: INestApplication;

  let roomId: string;

  // existing test users
  let testAdminId: string;
  let testAdminToken: string;
  let testAdminRoom: RoomModelDocument;

  let testUserId: string;
  let testUserToken: string;
  let testUserRoom: RoomModelDocument;

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
        testAdminId = body.user.id;
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

    const roomsService = app.get(RoomsService);
    testAdminRoom = await roomsService.create({ ...fakeRoom(), userId: testAdminId });
    testUserRoom = await roomsService.create({ ...fakeRoom(), userId: testUserId });
  });

  afterAll(async () => {
    const roomsService = app.get(RoomsService);
    if (roomId) {
      await roomsService.remove(roomId);
    }

    if (testAdminRoom) await roomsService.remove(testAdminRoom._id.toHexString());

    if (testUserRoom) await roomsService.remove(testUserRoom._id.toHexString());

    disconnect();
  });

  it('should return 401 when create new room from unauthenticated user, POST /rooms', () => {
    return request(app.getHttpServer())
      .post('/rooms')
      .send({ ...createRoomDto, userId: testUserId })
      .expect(401);
  });

  it('should create a new room from authenticated user, POST /rooms', () => {
    return request(app.getHttpServer())
      .post('/rooms')
      .auth(testUserToken, { type: 'bearer' })
      .send({ ...createRoomDto, userId: testUserId })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        roomId = body._id;
      });
  });

  it('should list all rooms, GET /rooms', () => {
    return request(app.getHttpServer())
      .get('/rooms')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.arrayContaining([expect.objectContaining({ _id: roomId, ...createRoomDto })]),
        );
      });
  });

  it('should get room, GET /rooms/:id', () => {
    return request(app.getHttpServer())
      .get(`/rooms/${roomId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ _id: roomId, ...createRoomDto }));
      });
  });

  it('should return 404 when room not found, GET /rooms/:id', () => {
    const roomId = new Types.ObjectId().toHexString();
    return request(app.getHttpServer())
      .get(`/rooms/${roomId}`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(404);
  });

  it('should return 404 when room not found, PATCH /rooms/:id', () => {
    const roomId = new Types.ObjectId().toHexString();
    return request(app.getHttpServer())
      .patch(`/rooms/${roomId}`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(404);
  });

  it('should return 404 when room not found, DELETE /rooms/:id', () => {
    const roomId = new Types.ObjectId().toHexString();
    return request(app.getHttpServer())
      .delete(`/rooms/${roomId}`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(404);
  });

  it('should set isDeleted when delete the room, DELETE /rooms/:id', () => {
    const roomId = testUserRoom._id.toHexString();

    return request(app.getHttpServer())
      .delete(`/rooms/${roomId}`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ _id: roomId, isDeleted: true }));
      });
  });

  it('should not delete other user room, DELETE /rooms/:id', () => {
    const roomId = testAdminRoom._id.toHexString();

    return request(app.getHttpServer())
      .delete(`/rooms/${roomId}`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(403);
  });

  it('should delete other user room from Admin, DELETE /rooms/:id', () => {
    const roomId = testUserRoom._id.toHexString();

    return request(app.getHttpServer())
      .delete(`/rooms/${roomId}`)
      .auth(testAdminToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ _id: roomId, isDeleted: true }));
      });
  });

  it('should change room, PATCH /rooms/:id', () => {
    const roomId = testUserRoom._id.toHexString();
    const newRoomName = 'New Room Name';

    return request(app.getHttpServer())
      .patch(`/rooms/${roomId}`)
      .send({ name: newRoomName })
      .auth(testUserToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ _id: roomId, name: newRoomName }));
      });
  });

  it('should not edit uther user room, PATCH /rooms/:id', () => {
    const roomId = testAdminRoom._id.toHexString();
    const newRoomName = 'New Room Name';

    return request(app.getHttpServer())
      .patch(`/rooms/${roomId}`)
      .send({ name: newRoomName })
      .auth(testUserToken, { type: 'bearer' })
      .expect(403);
  });

  it('should change other user room from Admin, PATCH /rooms/:id', () => {
    const roomId = testUserRoom._id.toHexString();
    const newRoomName = 'New Room Name';

    return request(app.getHttpServer())
      .patch(`/rooms/${roomId}`)
      .send({ name: newRoomName })
      .auth(testAdminToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ _id: roomId, name: newRoomName }));
      });
  });

  it.each([
    { ...createRoomDto, name: undefined },
    { ...createRoomDto, type: 'wrongType' },
    { ...createRoomDto, capacity: 0 },
    { ...createRoomDto, amenities: 0 },
    { ...createRoomDto, amenities: [''] },
  ])('should return HTTP errors with wrong data, POST /rooms %o', dto => {
    return request(app.getHttpServer())
      .post('/rooms')
      .auth(testUserToken, { type: 'bearer' })
      .send({ ...dto, userId: testUserId })
      .expect(400);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { disconnect } from 'mongoose';

import { AppModule } from '../src/app.module';
import { AppUtils } from '../src/common/app.utils';
import { RoomsService } from '../src/modules/rooms/rooms.service';
import { ReservationModelDocument } from '../src/modules/reservations/reservation.model';
import { ReservationsService } from '../src/modules/reservations/reservations.service';
import { RoomModelDocument } from '../src/modules/rooms/room.model';

import { fakeRoom } from './fixtures/room';
import {
  createReservationDto,
  reservationExpectedPeriod,
  mockReservationPeriods,
  expectedReservationPeriods,
} from './fixtures/reservations';
import { testUsers } from './fixtures/user';

describe('Reservations controller (e2e)', () => {
  let app: INestApplication;
  let roomsService: RoomsService;
  let reservationsService: ReservationsService;

  // existing test users
  let testAdminId: string;
  let testAdminToken: string;
  let testAdminRoom: RoomModelDocument;
  let testAdminReservation: ReservationModelDocument;

  let testUserId: string;
  let testUserToken: string;
  let testUserRoom: RoomModelDocument;
  let testUserReservation: ReservationModelDocument;

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

    roomsService = app.get(RoomsService);
    testAdminRoom = await roomsService.create({ ...fakeRoom(), userId: testAdminId });
    testUserRoom = await roomsService.create({ ...fakeRoom(), userId: testUserId });

    reservationsService = app.get(ReservationsService);
    testAdminReservation = await reservationsService.create({
      ...mockReservationPeriods.admin,
      roomId: testAdminRoom._id.toHexString(),
      userId: testAdminId,
    });
    testUserReservation = await reservationsService.create({
      ...mockReservationPeriods.user,
      roomId: testUserRoom._id.toHexString(),
      userId: testUserId,
    });
  });

  afterAll(async () => {
    await roomsService.remove(testAdminRoom._id.toHexString());
    await roomsService.remove(testUserRoom._id.toHexString());
    await reservationsService.delete(testAdminReservation._id.toHexString());
    await reservationsService.delete(testUserReservation._id.toHexString());
    disconnect();
  });

  it('should not create reservation from unregistered', () => {
    const dto = { ...createReservationDto, roomId: testUserRoom._id.toHexString() };

    return request(app.getHttpServer()).post('/reservations').send(dto).expect(401);
  });

  it('should create room reservation, POST /reservations', done => {
    const dto = {
      ...createReservationDto,
      roomId: testUserRoom._id.toHexString(),
      userId: testUserId,
    };

    request(app.getHttpServer())
      .post('/reservations')
      .auth(testUserToken, { type: 'bearer' })
      .send(dto)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            ...dto,
            ...reservationExpectedPeriod,
          }),
        );
      })
      .end(async (err, { body }) => {
        if (body._id) {
          await reservationsService.delete(body._id);
        }

        done(err);
      });
  });

  it('should get reservation, GET /reservations/:reservationId', () => {
    const reservationId = testAdminReservation._id.toHexString();

    const expectedResult = {
      _id: reservationId,
      roomId: testAdminRoom._id.toHexString(),
      ...expectedReservationPeriods.admin,
    };

    return request(app.getHttpServer())
      .get(`/reservations/${reservationId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining(expectedResult));
      });
  });

  it('should get all room reservations, GET /reservations/room/:roomId', async () => {
    const roomId = testUserRoom._id.toHexString();

    const expectedResult = {
      roomId,
      userId: testUserId,
      ...expectedReservationPeriods.user,
    };

    return request(app.getHttpServer())
      .get(`/reservations/room/${roomId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.arrayContaining([expect.objectContaining(expectedResult)]));
      });
  });

  it.each([undefined, 0, '', ' ', '1', 'xxxxxxxxxxxxxxxxxxxxxxxx'])(
    'should return HTTP error with roomId=%p, POST /reservations',
    roomId => {
      const dto = { ...createReservationDto, roomId };
      return request(app.getHttpServer())
        .post('/reservations')
        .auth(testUserToken, { type: 'bearer' })
        .send(dto)
        .expect(400);
    },
  );

  it.each([undefined, 0, '2003', '20030101', '2003-1-01', '2003-01-32', '2003-01-01T00:00:00Z'])(
    'should return HTTP error with rentedFrom=%p, POST /reservations',
    rentedFrom => {
      const dto = { ...createReservationDto, rentedFrom };
      return request(app.getHttpServer())
        .post('/reservations')
        .auth(testUserToken, { type: 'bearer' })
        .send(dto)
        .expect(400);
    },
  );

  it.each([undefined, 0, '2003', '20030101', '2003-1-01', '2003-01-32', '2003-01-01T00:00:00Z'])(
    'should return HTTP 400 error with rentedTo=%p, POST /reservations',
    rentedTo => {
      const dto = { ...createReservationDto, rentedTo };
      return request(app.getHttpServer())
        .post('/reservations')
        .auth(testUserToken, { type: 'bearer' })
        .send(dto)
        .expect(400);
    },
  );

  it.each([0, 1, 'some', null])(
    'should return HTTP 400 error with isCanceled=%p, POST /reservations',
    isCanceled => {
      const dto = { ...createReservationDto, isCanceled };
      return request(app.getHttpServer())
        .post('/reservations')
        .auth(testUserToken, { type: 'bearer' })
        .send(dto)
        .expect(400);
    },
  );

  it('should not edit reservation from unregistered, PATCH /reservations/:id', () => {
    const reservationId = testUserReservation._id.toHexString();
    const dto = { isCanceled: true };

    return request(app.getHttpServer())
      .patch(`/reservations/${reservationId}`)
      .send(dto)
      .expect(401);
  });

  it('should cancel user`s own reservation, PATCH  /reservations/:id/cancel', () => {
    const reservationId = testUserReservation._id.toHexString();

    return request(app.getHttpServer())
      .patch(`/reservations/${reservationId}/cancel`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveProperty('isCanceled', true);
      });
  });

  it('should edit other user`s reservation from admin, PATCH  /reservations/:id', () => {
    const reservationId = testUserReservation._id.toHexString();
    const dto = { isCanceled: false };

    return request(app.getHttpServer())
      .patch(`/reservations/${reservationId}`)
      .auth(testAdminToken, { type: 'bearer' })
      .send(dto)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveProperty('isCanceled', false);
      });
  });

  it('should not cancel other user`s reservation, PATCH  /reservations/:id', () => {
    const reservationId = testAdminReservation._id.toHexString();
    const dto = { isCanceled: true };

    return request(app.getHttpServer())
      .patch(`/reservations/${reservationId}`)
      .auth(testUserToken, { type: 'bearer' })
      .send(dto)
      .expect(403);
  });

  it('should not delete reservation from unregistered, DELETE /reservations/:id', () => {
    return request(app.getHttpServer())
      .delete(`/reservations/${testUserReservation._id.toHexString()}`)
      .expect(401);
  });

  it('should not delete reservation from USER, DELETE /reservations/:id', () => {
    return request(app.getHttpServer())
      .delete(`/reservations/${testUserReservation._id.toHexString()}`)
      .auth(testUserToken, { type: 'bearer' })
      .expect(403);
  });

  it('should delete reservation from ADMIN, DELETE /reservations/:id', async () => {
    const reservationId = testUserReservation._id.toHexString();

    await request(app.getHttpServer())
      .delete(`/reservations/${reservationId}`)
      .auth(testAdminToken, { type: 'bearer' })
      .expect(200);
    return request(app.getHttpServer()).get(`/reservations/${reservationId}`).expect(404);
  });
});

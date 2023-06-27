import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { disconnect } from 'mongoose';

import { AppModule } from '../src/app.module';

import { roomDto } from './fixtures/room';
import { reservationDto } from './fixtures/reservations';

describe('Reservations controller (e2e)', () => {
  let app: INestApplication;
  let roomId: string;
  let reservationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    await request(app.getHttpServer())
      .post('/rooms')
      .send(roomDto)
      .then(({ body }) => {
        roomId = body._id;
      });
  });

  afterAll(() => {
    disconnect();
  });

  it('should create room reservation, POST /reservations', () => {
    const createReservationDto = { roomId, ...reservationDto };

    return request(app.getHttpServer())
      .post('/reservations')
      .send(createReservationDto)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.objectContaining({
            rentedFrom: `${createReservationDto.rentedFrom}T00:00:00.000Z`,
            rentedTo: `${createReservationDto.rentedTo}T23:59:59.999Z`,
            roomId,
          }),
        );
        reservationId = body._id;
      });
  });

  it('should get reservation, GET /reservations/:reservationId', () => {
    return request(app.getHttpServer())
      .get(`/reservations/${reservationId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.objectContaining({
            rentedFrom: `${reservationDto.rentedFrom}T00:00:00.000Z`,
            rentedTo: `${reservationDto.rentedTo}T23:59:59.999Z`,
            roomId,
          }),
        );
      });
  });

  it('should get all room reservations, GET /reservations/room/:roomId', async () => {
    return request(app.getHttpServer())
      .get(`/reservations/room/${roomId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              rentedFrom: `${reservationDto.rentedFrom}T00:00:00.000Z`,
              rentedTo: `${reservationDto.rentedTo}T23:59:59.999Z`,
              roomId,
            }),
          ]),
        );
      });
  });

  it('should get all room reservations in period, GET /reservations/room/:roomId', async () => {
    const rentedFrom = new Date(new Date(reservationDto.rentedFrom).setDate(-1))
      .toISOString()
      .slice(0, 10);
    const rentedTo = new Date(
      new Date(reservationDto.rentedTo).setDate(new Date(reservationDto.rentedTo).getDate() + 1),
    )
      .toISOString()
      .slice(0, 10);

    await request(app.getHttpServer())
      .get(`/reservations/room/${roomId}`)
      .query({ rentedFrom, rentedTo })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              rentedFrom: `${reservationDto.rentedFrom}T00:00:00.000Z`,
              rentedTo: `${reservationDto.rentedTo}T23:59:59.999Z`,
              roomId,
            }),
          ]),
        );
      });
  });

  it('should delete reservation, DELETE /reservations/:id', async () => {
    await request(app.getHttpServer()).delete(`/reservations/${reservationId}`).expect(200);
    return request(app.getHttpServer()).get(`/reservations/${reservationId}`).expect(404);
  });

  it.each([undefined, 0, ''])(
    'should return HTTP error with roomId=%p, POST /reservations',
    roomId => {
      const dto = { ...reservationDto, roomId };
      return request(app.getHttpServer()).post('/reservations').send(dto).expect(400);
    },
  );

  it.each([undefined, 0, '2003', '20030101', '2003-1-01', '2003-01-32', '2003-01-01T00:00:00Z'])(
    'should return HTTP error with rentedFrom=%p, POST /reservations',
    rentedFrom => {
      const dto = { ...reservationDto, rentedFrom };
      return request(app.getHttpServer()).post('/reservations').send(dto).expect(400);
    },
  );

  it.each([undefined, 0, '2003', '20030101', '2003-1-01', '2003-01-32', '2003-01-01T00:00:00Z'])(
    'should return HTTP error with rentedTo=%p, POST /reservations',
    rentedTo => {
      const dto = { ...reservationDto, rentedTo };
      return request(app.getHttpServer()).post('/reservations').send(dto).expect(400);
    },
  );

  it.each([0, 1, 'some', null])(
    'should return HTTP error with isCanceled=%p, POST /reservations',
    isCanceled => {
      const dto = { ...reservationDto, isCanceled };
      return request(app.getHttpServer()).post('/reservations').send(dto).expect(400);
    },
  );
});

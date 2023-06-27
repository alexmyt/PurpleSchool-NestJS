import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { disconnect } from 'mongoose';

import { AppModule } from '../src/app.module';

import { roomDto } from './fixtures/room';

describe('Rooms controller (e2e)', () => {
  let app: INestApplication;
  let roomIdx: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(() => {
    disconnect();
  });

  it('should create a new room, POST /rooms', () => {
    return request(app.getHttpServer())
      .post('/rooms')
      .send(roomDto)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        roomIdx = body._id;
      });
  });

  it('should list all rooms, GET /rooms', () => {
    return request(app.getHttpServer())
      .get('/rooms')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.arrayContaining([expect.objectContaining({ _id: roomIdx, ...roomDto })]),
        );
      });
  });

  it('should get room, GET /rooms/:id', () => {
    return request(app.getHttpServer())
      .get(`/rooms/${roomIdx}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ _id: roomIdx, ...roomDto }));
      });
  });

  it('should return 404 when room not found, GET /rooms/:id', () => {
    return request(app.getHttpServer()).get('/rooms/6497ea5b71d2e5c04fc208e1').expect(404);
  });

  it('should return 404 when room not found, PATCH /rooms/:id', () => {
    return request(app.getHttpServer()).patch('/rooms/6497ea5b71d2e5c04fc208e1').expect(404);
  });

  it('should return 404 when room not found, DELETE /rooms/:id', () => {
    return request(app.getHttpServer()).delete('/rooms/6497ea5b71d2e5c04fc208e1').expect(404);
  });

  it('should set isDeleted when delete the room, DELETE /rooms/:id', () => {
    return request(app.getHttpServer())
      .delete(`/rooms/${roomIdx}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(
          expect.objectContaining({ _id: roomIdx, ...roomDto, isDeleted: true }),
        );
      });
  });

  it('should change room, PATCH /rooms/:id', () => {
    const newRoomName = 'New Room Name';

    return request(app.getHttpServer())
      .patch(`/rooms/${roomIdx}`)
      .send({ name: newRoomName })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toEqual(expect.objectContaining({ _id: roomIdx, name: newRoomName }));
      });
  });

  it.each([
    { ...roomDto, name: undefined },
    { ...roomDto, type: 'wrongType' },
    { ...roomDto, capacity: 0 },
    { ...roomDto, amenities: 0 },
    { ...roomDto, amenities: [''] },
  ])('should return HTTP errors with wrong data, POST /rooms %o', dto => {
    return request(app.getHttpServer()).post('/rooms').send(dto).expect(400);
  });
});

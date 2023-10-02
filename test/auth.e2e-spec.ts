import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { disconnect } from 'mongoose';

import { AppModule } from '../src/app.module';
import { AppUtils } from '../src/common/app.utils';

import { testUsers } from './fixtures/user';

describe('Auth service (e2e)', () => {
  let app: INestApplication;

  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(AppUtils.validationPipeOptions()));
    await app.init();
  });

  afterAll(async () => {
    await disconnect();
    app.close();
  });

  it('should get JWT while login', () => {
    const { email, password } = testUsers.user;

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');

        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
        userId = body.user.id;
      });
  });

  it('should access with JWT', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
  });

  it('should refresh JWT', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
      });
  });

  it('should not access with old accessToken', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('should not refresh JWT with old refreshToken', () => {
    return request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(403);
  });
});

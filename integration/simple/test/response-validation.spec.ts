import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Response validation', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  it('should validate responses', () => {
    return request(app.getHttpServer())
      .get('/cats/response')
      .expect(200)
      .expect({
        success: true,
      });
  });
  afterEach(async () => {
    await app.close();
  });
});

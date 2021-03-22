import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Request validation', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  describe('Params', () => {
    it('should validate one param', () => {
      return request(app.getHttpServer())
        .get('/cats/params/1')
        .expect(200)
        .expect({
          success: true,
        });
    });
    it('should validate several params', () => {
      return request(app.getHttpServer())
        .get('/cats/params/1/some/2')
        .expect(200)
        .expect({
          success: true,
        });
    });
  });
  describe('Query', () => {
    it('should validate one query option', () => {
      return request(app.getHttpServer())
        .get('/cats/query?limit=20&extra=some')
        .expect(200)
        .expect({
          success: true,
        });
    });
    it('should validate several query options', () => {
      return request(app.getHttpServer())
        .get('/cats/query/several?limit=20&page=5&extra=some')
        .expect(200)
        .expect({
          success: true,
        });
    });
  });
  describe('Headers', () => {
    it('should validate headers', () => {
      return request(app.getHttpServer())
        .get('/cats/headers')
        .set({
          'some-test-header': '1',
          'some-extra-header': '2',
        })
        .expect(200)
        .expect({
          success: true,
        });
    });
  });
  describe('Body', () => {
    it('should throw an error if foo not provided', () => {
      return request(app.getHttpServer())
        .post('/cats/body')
        .send({})
        .expect(500);
    });
    it('should validate body', () => {
      return request(app.getHttpServer())
        .post('/cats/body')
        .send({
          foo: '1',
          extra: 'bar',
        })
        .expect(201)
        .expect({
          success: true,
        });
    });
  });
  afterEach(async () => {
    await app.close();
  });
});

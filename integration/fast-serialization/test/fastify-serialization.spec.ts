import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as chai from 'chai';
import { AppModule } from '../src/app.module';

const expect = chai.expect;

describe('Fastify serialization', () => {
  let app: NestFastifyApplication;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
  });
  it('should use fast json stringify serialization', async () => {
    const testPayload = {
      success: true,
      foo: 'bar',
      hello: 'world',
      age: 23,
    };
    const response = await app.inject({
      method: 'POST',
      path: '/cats',
      headers: {
        'content-type': 'application/json',
      },
      payload: {
        ...testPayload,
        extra: 'toErase',
      },
    });
    expect(response.statusCode).eq(201);
    expect(response.json()).deep.eq(testPayload);
  });
  afterEach(async () => {
    await app.close();
  });
});

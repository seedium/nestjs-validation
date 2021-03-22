import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Circular Dependencies', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  it('should resolve circular dependencies', async () => {
    const testCat = {
      name: 'Kitty',
      age: 3,
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };
    const testUser = {
      firstName: 'John',
      lastName: 'Doe',
      cat: {
        name: 'Kitty',
        age: 3,
      },
    };
    await request(app.getHttpServer())
      .post('/cats')
      .send([
        {
          ...testCat,
          user: {
            ...testCat.user,
            foo: 'bar',
          },
        },
      ])
      .expect(201)
      .expect([testCat]);
    return request(app.getHttpServer())
      .post('/users')
      .send([
        {
          ...testUser,
          cat: {
            ...testUser.cat,
            foo: 'bar',
          },
        },
      ])
      .expect(201)
      .expect([testUser]);
  });
  afterEach(async () => {
    await app.close();
  });
});

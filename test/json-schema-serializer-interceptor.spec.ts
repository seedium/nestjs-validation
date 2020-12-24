import S from 'fluent-schema';
import * as sinon from 'sinon';
import * as request from 'supertest';
import { Controller, Get, Post, INestApplication, Catch } from '@nestjs/common';
import {
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { VALIDATOR, VALIDATOR_ERROR_HANDLER } from '../lib/constants';
import {
  AjvValidator,
  JsonSchemaSerializerInterceptor,
  ValidationModule,
} from '../lib';
import { expect } from 'chai';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(err: Error, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    return res.status(500).json({
      message: err.message,
    });
  }
}

interface ICreateAppResources {
  app: INestApplication;
  ajvValidator: AjvValidator;
  jsonSchemaSerializerInterceptor: JsonSchemaSerializerInterceptor;
}

describe('JsonSchemaSerializerInterceptor', () => {
  async function createApp(controller): Promise<ICreateAppResources> {
    const moduleRef = await Test.createTestingModule({
      imports: [ValidationModule.forRoot()],
      controllers: [controller],
    }).compile();

    const app = moduleRef.createNestApplication();
    const ajvValidator = app.get(VALIDATOR);
    const errorHandler = app.get(VALIDATOR_ERROR_HANDLER);
    const jsonSchemaSerializerInterceptor = new JsonSchemaSerializerInterceptor(
      ajvValidator,
      errorHandler,
    );

    app.useGlobalInterceptors(jsonSchemaSerializerInterceptor);

    app.useGlobalFilters(new CustomExceptionFilter());
    await app.init();

    return {
      app,
      ajvValidator,
      jsonSchemaSerializerInterceptor,
    };
  }

  beforeEach(() => {
    sinon.restore();
  });

  describe('Controller without schemas', () => {
    let appResources: ICreateAppResources;

    @Controller()
    class TestController {
      @Get('/test')
      test() {
        return {};
      }
    }

    beforeEach(async () => {
      appResources = await createApp(TestController);
    });

    it('without schemas', async () => {
      const spyIntercept = sinon.spy(
        appResources.jsonSchemaSerializerInterceptor,
        'intercept',
      );
      const spyValidateById = sinon.spy(
        appResources.ajvValidator,
        'validateBySwaggerSchemaId',
      );

      await request(appResources.app.getHttpServer()).get('/test');

      expect(spyIntercept.callCount).eq(1);
      expect(spyValidateById.callCount).eq(5);

      await Promise.all(
        spyValidateById.returnValues.map(async (validateResult) => {
          const result = await validateResult;

          expect(result.success).is.true;
          expect(result.validated).is.false;
        }),
      );
    });

    it('should be error', async () => {
      const errorMessage = 'test error message';
      sinon
        .stub(appResources.ajvValidator, <any>'validateBySwaggerSchemaId')
        .returns({
          success: false,
          errors: [new Error(errorMessage)],
        });

      await request(appResources.app.getHttpServer())
        .get('/test')
        .expect(500, { message: errorMessage });
    });
  });

  describe('Params', () => {
    let appResources: ICreateAppResources;

    @Controller()
    class ParamsTestController {
      @Get('/params/:param1/:param2')
      @ApiParam({
        name: 'param1',
        schema: S.string().valueOf(),
      })
      @ApiParam({
        name: 'param2',
        schema: S.string().valueOf(),
      })
      params() {
        return {};
      }
    }

    beforeEach(async () => {
      appResources = await createApp(ParamsTestController);
    });

    it('schema should be validated', async () => {
      const spyValidateById = sinon.spy(
        appResources.ajvValidator,
        'validateBySwaggerSchemaId',
      );

      await request(appResources.app.getHttpServer()).get('/params/test/test');

      expect(spyValidateById.callCount).eq(5);

      const returnValues = await Promise.all(
        spyValidateById.returnValues.map(async (validateResult) => {
          return await validateResult;
        }),
      );

      const validated = returnValues.filter(
        (validateResult) => validateResult.validated,
      );

      expect(validated).length(1);
    });
  });

  describe('Headers', () => {
    let appResources: ICreateAppResources;

    @Controller()
    class HeadersTestController {
      @Get('/headers')
      @ApiHeader({
        name: 'test',
        schema: S.object().valueOf(),
      })
      headers() {
        return {};
      }
    }

    beforeEach(async () => {
      appResources = await createApp(HeadersTestController);
    });

    it('schema should be validated', async () => {
      const spyValidateById = sinon.spy(
        appResources.ajvValidator,
        'validateBySwaggerSchemaId',
      );

      await request(appResources.app.getHttpServer()).get('/headers');

      expect(spyValidateById.callCount).eq(5);

      const returnValues = await Promise.all(
        spyValidateById.returnValues.map(async (validateResult) => {
          return await validateResult;
        }),
      );

      const validated = returnValues.filter(
        (validateResult) => validateResult.validated,
      );

      expect(validated).length(1);
    });
  });

  describe('Query', () => {
    let appResources: ICreateAppResources;

    @Controller()
    class QueryTestController {
      @Get('/query')
      @ApiQuery({
        name: 'param1',
        schema: S.string().valueOf(),
      })
      query() {
        return {};
      }
    }

    beforeEach(async () => {
      appResources = await createApp(QueryTestController);
    });

    it('schema should be validated', async () => {
      const spyValidateById = sinon.spy(
        appResources.ajvValidator,
        'validateBySwaggerSchemaId',
      );

      await request(appResources.app.getHttpServer()).get('/query?param1=test');

      expect(spyValidateById.callCount).eq(5);

      const returnValues = await Promise.all(
        spyValidateById.returnValues.map(async (validateResult) => {
          return await validateResult;
        }),
      );

      const validated = returnValues.filter(
        (validateResult) => validateResult.validated,
      );

      expect(validated).length(1);
    });
  });

  describe('Body', () => {
    let appResources: ICreateAppResources;

    @Controller()
    class BodyTestController {
      @Post('/body')
      @ApiBody({
        schema: S.object().valueOf(),
      })
      body() {
        return {};
      }
    }

    beforeEach(async () => {
      appResources = await createApp(BodyTestController);
    });

    it('schema should be validated', async () => {
      const spyValidateById = sinon.spy(
        appResources.ajvValidator,
        'validateBySwaggerSchemaId',
      );

      await request(appResources.app.getHttpServer()).post('/body');

      expect(spyValidateById.callCount).eq(5);

      const returnValues = await Promise.all(
        spyValidateById.returnValues.map(async (validateResult) => {
          return await validateResult;
        }),
      );

      const validated = returnValues.filter(
        (validateResult) => validateResult.validated,
      );

      expect(validated).length(1);
    });
  });

  describe('Responses', () => {
    let appResources: ICreateAppResources;
    const responsesIdentificator = 'responses_test_object';

    @Controller()
    class ResponseTestController {
      @Get('/responses')
      @ApiResponse({
        status: 200,
        schema: S.object().valueOf(),
      })
      responses() {
        return {
          type: responsesIdentificator,
        };
      }
    }

    beforeEach(async () => {
      appResources = await createApp(ResponseTestController);
    });

    it('schema should be validated', async () => {
      const spyValidateById = sinon.spy(
        appResources.ajvValidator,
        'validateBySwaggerSchemaId',
      );

      await request(appResources.app.getHttpServer()).get('/responses');

      expect(spyValidateById.callCount).eq(5);

      const returnValues = await Promise.all(
        spyValidateById.returnValues.map(async (validateResult) => {
          return await validateResult;
        }),
      );

      const validated = returnValues.filter(
        (validateResult) => validateResult.validated,
      );

      expect(validated).length(1);
    });

    it('responses should be error', async () => {
      const errorMessage = 'test error message';
      sinon
        .stub(appResources.ajvValidator, 'validateBySwaggerSchemaId')
        .callsFake((_id, data: any): any => {
          if (data.type === responsesIdentificator) {
            return {
              success: false,
              errors: [new Error(errorMessage)],
            };
          }

          return {
            success: true,
          };
        });

      await request(appResources.app.getHttpServer())
        .get('/responses')
        .expect(500, { message: errorMessage });
    });
  });
});

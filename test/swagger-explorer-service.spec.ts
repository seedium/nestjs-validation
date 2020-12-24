import S from 'fluent-schema';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Test } from '@nestjs/testing';
import {
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import { Controller, INestApplication } from '@nestjs/common';
import { AjvValidator, ValidationModule } from '../lib';

describe('SwaggerExplorerService', () => {
  let stubLoadSchemas: sinon.SinonStub;

  async function createApp(controller): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
      imports: [ValidationModule.forRoot()],
      controllers: [controller],
    }).compile();

    const app = moduleRef.createNestApplication();

    await app.init();

    return app;
  }

  function getLoadSchemas() {
    return stubLoadSchemas.getCall(0).args[0];
  }

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    stubLoadSchemas = sinon.stub(AjvValidator.prototype, 'loadSwaggerSchemas');
  });

  describe('ApiParam', () => {
    @Controller()
    class TestController {
      @ApiParam({
        name: 'param1',
        schema: S.string().valueOf(),
        required: true,
      })
      @ApiParam({
        name: 'param2',
        schema: S.number().valueOf(),
        required: false,
      })
      @ApiParam({
        name: 'param3',
        schema: S.boolean().valueOf(),
        required: false,
      })
      test() {}
    }

    it('param schema', async () => {
      await createApp(TestController);

      const [param] = getLoadSchemas();

      expect(param.type).eq('object');
      expect(param.required).deep.eq(['param1']);
      expect(param.properties).deep.eq({
        param1: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
        },
        param2: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'number',
        },
        param3: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'boolean',
        },
      });
    });
  });

  describe('ApiHeader', () => {
    @Controller()
    class TestController {
      @ApiHeader({
        name: 'param1',
        schema: S.string().valueOf(),
      })
      @ApiHeader({
        name: 'param2',
        schema: S.string().valueOf(),
      })
      test() {}
    }

    it('header schema', async () => {
      await createApp(TestController);

      const [header] = getLoadSchemas();

      expect(header.type).eq('object');
      expect(header.required).length(0);
      expect(header.properties).deep.eq({
        param1: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
        },
        param2: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
        },
      });
    });
  });

  describe('ApiQuery', () => {
    @Controller()
    class TestController {
      @ApiQuery({
        name: 'param1',
        schema: S.string().valueOf(),
        required: true,
      })
      @ApiQuery({
        name: 'param2',
        schema: S.number().valueOf(),
        required: false,
      })
      test() {}
    }

    it('query schema', async () => {
      await createApp(TestController);

      const [query] = getLoadSchemas();

      expect(query.type).eq('object');
      expect(query.required).deep.eq(['param1']);
      expect(query.properties).deep.eq({
        param1: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
        },
        param2: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'number',
        },
      });
    });
  });

  describe('ApiBody', () => {
    @Controller()
    class TestController {
      @ApiBody({
        schema: S.object()
          .prop('param1', S.number())
          .prop('param2', S.string().required())
          .valueOf(),
      })
      test() {}
    }

    it('body schema', async () => {
      await createApp(TestController);

      const [body] = getLoadSchemas();

      expect(body.type).eq('object');
      expect(body.required).deep.eq(['param2']);
      expect(body.properties).deep.eq({
        param1: {
          type: 'number',
        },
        param2: {
          type: 'string',
        },
      });
    });
  });

  describe('ApiResponse', () => {
    @Controller()
    class TestController {
      @ApiResponse({
        status: 200,
        schema: S.object().prop('param', S.number()).valueOf(),
      })
      @ApiResponse({
        status: 201,
        schema: S.object().prop('param', S.string()).valueOf(),
      })
      @ApiBody({
        schema: S.object().valueOf(),
      })
      test() {}
    }

    it('response schema', async () => {
      await createApp(TestController);

      const [body, responseFirst, responseSecond] = getLoadSchemas();

      expect(body.type).eq('object');

      expect(responseFirst.type).eq('object');
      expect(responseFirst.required).is.undefined;
      expect(responseFirst.properties).deep.eq({
        param: {
          type: 'number',
        },
      });

      expect(responseSecond.type).eq('object');
      expect(responseSecond.required).is.undefined;
      expect(responseSecond.properties).deep.eq({
        param: {
          type: 'string',
        },
      });
    });
  });
});

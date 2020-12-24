import * as sinon from 'sinon';
import Ajv from 'ajv';
import { Test } from '@nestjs/testing';
import { expect } from 'chai';
import { ValidationModule } from '../lib';
import { IValidatorErrorHandler } from '../lib/interfaces';
import { VALIDATOR_ERROR_HANDLER } from '../lib/constants';
import { SwaggerExplorerServices } from '../lib/services';

describe('Validation Module', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('custom error handler', async () => {
    class TestCustomErrorHandler implements IValidatorErrorHandler {
      handle() {}
    }

    const moduleRef = await Test.createTestingModule({
      imports: [ValidationModule.forRoot({}, new TestCustomErrorHandler())],
    }).compile();

    const errorHandler = moduleRef.get(VALIDATOR_ERROR_HANDLER);

    expect(errorHandler).instanceOf(TestCustomErrorHandler);
  });

  it('check loadSchemas', async () => {
    sinon
      .stub(SwaggerExplorerServices.prototype, <any>'explore')
      .returns(() => {
        return [{}];
      });

    const stubAddSchema = sinon.stub(Ajv.prototype, 'addSchema');

    await Test.createTestingModule({
      imports: [ValidationModule.forRoot()],
    }).compile();

    expect(stubAddSchema.callCount).eq(1);
  });
});

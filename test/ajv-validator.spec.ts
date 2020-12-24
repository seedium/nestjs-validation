import * as sinon from 'sinon';
import { expect } from 'chai';
import { AjvValidator } from '../lib';

describe('AjvValidator', () => {
  let ajvValidator: AjvValidator;

  beforeEach(() => {
    ajvValidator = new AjvValidator();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addPrefixToRefs', () => {
    it('should be empty object result', async () => {
      const result = ajvValidator.addPrefixToRefs('test', {});

      expect(result).deep.eq({});
    });

    it('should change ref', async () => {
      const schema = {
        type: 'object',
        properties: {
          propFirst: {
            $ref: '...',
          },
          propSecond: {
            type: 'object',
            properties: {
              propFirst: {
                type: 'string',
              },
              propSecond: {
                $ref: '...',
              },
            },
          },
        },
      };

      const result = ajvValidator.addPrefixToRefs('test', schema);

      expect(result).deep.eq({
        type: 'object',
        properties: {
          propFirst: {
            $ref: 'test...',
          },
          propSecond: {
            type: 'object',
            properties: {
              propFirst: {
                type: 'string',
              },
              propSecond: {
                $ref: 'test...',
              },
            },
          },
        },
      });
    });

    it('array should change ref', async () => {
      const schema = {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              propFirst: {
                $ref: '...',
              },
            },
          },
        ],
      };

      const result = ajvValidator.addPrefixToRefs('test', schema);

      expect(result).deep.eq({
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              propFirst: {
                $ref: 'test...',
              },
            },
          },
        ],
      });
    });
  });

  it('should be success result if schema not exist', async () => {
    const stubGetSchema = sinon
      .stub(ajvValidator.ajv, <any>'getSchema')
      .returns(false);

    const result = await ajvValidator.validateBySwaggerSchemaId('', {});
    expect(result.success).is.true;
    expect(stubGetSchema.callCount).eq(1);
  });

  it('should be success result if schema not exist', async () => {
    const fakeValidator = sinon.fake();
    const stubGetSchema = sinon
      .stub(ajvValidator.ajv, <any>'getSchema')
      .returns(fakeValidator);

    const result = await ajvValidator.validateBySwaggerSchemaId('', {});

    expect(result.success).is.true;
    expect(stubGetSchema.callCount).eq(1);
    expect(fakeValidator.callCount).eq(1);
  });

  it('should be failed result when errors', async () => {
    const stubGetSchema = sinon
      .stub(ajvValidator.ajv, <any>'getSchema')
      .returns(() => {
        throw new Error();
      });

    const result = await ajvValidator.validateBySwaggerSchemaId('', {});

    expect(result.success).is.false;
    expect(stubGetSchema.callCount).eq(1);
  });

  it('loadSchema default option', async () => {
    const stubAddSchema = sinon.stub(ajvValidator.ajv, <any>'addSchema');

    await ajvValidator.loadSchema({});

    expect(stubAddSchema.callCount).eq(1);
    expect(stubAddSchema.getCall(0).args[0]).deep.eq({
      $async: true,
    });
  });

  it('loadSwaggerSchemas without id', async () => {
    const stubGetSchema = sinon.stub(ajvValidator.ajv, <any>'addSchema');

    await ajvValidator.loadSwaggerSchemas([{}]);

    expect(stubGetSchema.callCount).eq(1);
    expect(stubGetSchema.getCall(0).args[0]).deep.eq({
      $async: true,
    });
  });
});

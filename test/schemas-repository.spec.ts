import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { AjvValidator } from '../lib';
import { SchemasRepository } from '../lib/schemas-repository';

chai.use(sinonChai);
const expect = chai.expect;

const stubValueOfSchema = (stub: sinon.SinonStub): any => ({
  isFluentJSONSchema: true,
  valueOf: stub,
});

describe('SchemasRepository', () => {
  let schemasRepository: SchemasRepository;
  let mockAjv: sinon.SinonMock;
  beforeEach(() => {
    const ajvValidator = new AjvValidator();
    mockAjv = sinon.mock(ajvValidator.ajv);
    schemasRepository = new SchemasRepository(ajvValidator);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('loadSchemas', () => {
    it('should skip null schema', () => {
      schemasRepository.loadSchemas({
        TestController_test: {
          parameters: null,
        } as any,
      });
    });
    it('should load query, body, params and headers schemas', () => {
      const queryStubValueOf = sinon.stub();
      const bodyStubValueOf = sinon.stub();
      const paramsStubValueOf = sinon.stub();
      const headersStubValueOf = sinon.stub();
      schemasRepository.loadSchemas({
        TestController_test: {
          parameters: stubValueOfSchema(paramsStubValueOf),
          query: stubValueOfSchema(queryStubValueOf),
          headers: stubValueOfSchema(headersStubValueOf),
          body: stubValueOfSchema(bodyStubValueOf),
          responses: {},
        },
      });
      expect(queryStubValueOf).calledOnce;
      expect(bodyStubValueOf).calledOnce;
      expect(paramsStubValueOf).calledOnce;
      expect(headersStubValueOf).calledOnce;
    });
    it('should load responses schemas', () => {
      const successResponseStubValueOf = sinon.stub();
      const errorResponseStubValueOf = sinon.stub();
      schemasRepository.loadSchemas({
        TestController_test: {
          responses: {
            '200': stubValueOfSchema(successResponseStubValueOf),
            '500': stubValueOfSchema(errorResponseStubValueOf),
          },
        } as any,
      });
      expect(successResponseStubValueOf).calledOnce;
      expect(successResponseStubValueOf).calledOnce;
    });
    it('should throw an error if schema is invalid', () => {
      expect(() =>
        schemasRepository.loadSchemas({
          TestController_test: {
            query: 'invalid schema',
          } as any,
        }),
      ).throw();
    });
  });
  describe('getOperationValidators', () => {
    it('should return operation validators', () => {
      mockAjv.expects('compile').returns('test');
      schemasRepository.loadSchemas({
        TestController_test: {
          query: stubValueOfSchema(sinon.stub()),
        } as any,
      });
      expect(
        schemasRepository.getOperationValidators('TestController_test'),
      ).deep.eq({
        query: 'test',
      });
    });
    it('should return null if not exists', () => {
      expect(schemasRepository.getOperationValidators('TestController_test')).is
        .null;
    });
  });
});

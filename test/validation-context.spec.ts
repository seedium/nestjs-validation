import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { ValidationContextService, AjvValidator } from '../lib';
import { SchemasRepository } from '../lib/schemas-repository';

chai.use(sinonChai);
const expect = chai.expect;

const getMockExecutionContext = (
  className = 'TestController',
  handlerName = 'testEndpoint',
): any => ({
  getClass: () => ({
    name: className,
  }),
  getHandler: () => ({
    name: handlerName,
  }),
});

describe('ValidationContextService', () => {
  let validationContextService: ValidationContextService;
  let mockSchemasRepository: sinon.SinonMock;
  beforeEach(() => {
    const schemasRepository = new SchemasRepository(new AjvValidator());
    mockSchemasRepository = sinon.mock(schemasRepository);
    validationContextService = new ValidationContextService(schemasRepository);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('getValidatorByType', () => {
    it('if no operation validators should return null', () => {
      mockSchemasRepository.expects('getOperationValidators').returns(null);
      expect(
        validationContextService.getValidatorByType(
          'parameters',
          getMockExecutionContext(),
        ),
      ).is.null;
    });
    it('should return null type validator not exists', () => {
      mockSchemasRepository.expects('getOperationValidators').returns({
        parameters: null,
      });
      expect(
        validationContextService.getValidatorByType(
          'parameters',
          getMockExecutionContext(),
        ),
      ).is.null;
    });
    it('should return validator if type validator exists', () => {
      mockSchemasRepository.expects('getOperationValidators').returns({
        parameters: 'test',
      });
      expect(
        validationContextService.getValidatorByType(
          'parameters',
          getMockExecutionContext(),
        ),
      ).eq('test');
    });
  });
  describe('getResponseValidatorByStatusCode', () => {
    it('if no operation validators should return null', () => {
      mockSchemasRepository.expects('getOperationValidators').returns(null);
      expect(
        validationContextService.getResponseValidatorByStatusCode(
          200,
          getMockExecutionContext(),
        ),
      ).is.null;
    });
    it('if no validator for status code should return null', () => {
      mockSchemasRepository.expects('getOperationValidators').returns({
        responses: {},
      });
      expect(
        validationContextService.getResponseValidatorByStatusCode(
          200,
          getMockExecutionContext(),
        ),
      ).is.null;
    });
    it('should return validator for status code', () => {
      mockSchemasRepository.expects('getOperationValidators').returns({
        responses: {
          200: 'test_validator',
        },
      });
      expect(
        validationContextService.getResponseValidatorByStatusCode(
          200,
          getMockExecutionContext(),
        ),
      ).eq('test_validator');
    });
  });
});

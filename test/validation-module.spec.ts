import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { Test } from '@nestjs/testing';
import {
  AjvValidator,
  ValidationContextService,
  ValidationModule,
  ValidationModuleOptions,
  ValidationModuleOptionsFactory,
} from '../lib';
import { SchemasRepository } from '../lib/schemas-repository';
import { Injectable, Module } from '@nestjs/common';

chai.use(sinonChai);
const expect = chai.expect;

describe('ValidationModule', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('forRoot', () => {
    it('should export AjvValidator and SchemasRepository', async () => {
      const module = await Test.createTestingModule({
        imports: [ValidationModule.forRoot()],
      }).compile();
      expect(module.get(AjvValidator)).instanceOf(AjvValidator);
      expect(module.get(SchemasRepository)).instanceOf(SchemasRepository);
    });
  });
  describe('forRootAsync', () => {
    it('should export AjvValidator and SchemasRepository', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ValidationModule.forRootAsync({
            useFactory: () => ({}),
          }),
        ],
      }).compile();
      expect(module.get(AjvValidator)).instanceOf(AjvValidator);
      expect(module.get(SchemasRepository)).instanceOf(SchemasRepository);
    });
    it('can inject provider', async () => {
      @Injectable()
      class TestProvider {}
      @Module({
        providers: [TestProvider],
        exports: [TestProvider],
      })
      class TestModule {}
      const module = await Test.createTestingModule({
        imports: [
          ValidationModule.forRootAsync({
            imports: [TestModule],
            useFactory: () => ({}),
            inject: [TestProvider],
          }),
        ],
      }).compile();
      expect(module.get(AjvValidator)).instanceOf(AjvValidator);
      expect(module.get(SchemasRepository)).instanceOf(SchemasRepository);
    });
    it('should use options from useClass', async () => {
      class ValidationOptionsFactory implements ValidationModuleOptionsFactory {
        createValidationOptions(): ValidationModuleOptions {
          return {};
        }
      }
      const module = await Test.createTestingModule({
        imports: [
          ValidationModule.forRootAsync({
            useClass: ValidationOptionsFactory,
          }),
        ],
      }).compile();
      expect(module.get(AjvValidator)).instanceOf(AjvValidator);
      expect(module.get(SchemasRepository)).instanceOf(SchemasRepository);
    });
  });
  describe('forFeature', () => {
    it('should export `ValidationContextService`', async () => {
      @Injectable()
      class TestProvider {
        constructor(
          public validationContextService: ValidationContextService,
        ) {}
      }
      @Module({
        imports: [ValidationModule.forFeature()],
        providers: [TestProvider],
      })
      class TestModule {}
      @Module({
        imports: [ValidationModule.forRoot(), TestModule],
      })
      class TestAppModule {}
      const module = await Test.createTestingModule({
        imports: [TestAppModule],
      }).compile();
      const testProvider = module.get(TestProvider);
      expect(testProvider)
        .property('validationContextService')
        .instanceof(ValidationContextService);
    });
    it('should load schemas once', async () => {
      @Module({
        imports: [ValidationModule.forFeature()],
      })
      class TestModule {}
      @Module({
        imports: [ValidationModule.forFeature()],
      })
      class SecondTestModule {}
      @Module({
        imports: [ValidationModule.forRoot(), TestModule, SecondTestModule],
      })
      class TestAppModule {}
      const module = await Test.createTestingModule({
        imports: [TestAppModule],
      });
      const loadSchemasStub = sinon.stub();
      module
        .overrideProvider(SchemasRepository)
        .useValue({ loadSchemas: loadSchemasStub });
      const app = await module.compile();
      await app.init();
      expect(loadSchemasStub).calledOnce;
    });
  });
});

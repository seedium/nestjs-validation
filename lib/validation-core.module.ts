import {
  DynamicModule,
  Type,
  OnApplicationBootstrap,
  Provider,
  Module,
  Global,
} from '@nestjs/common';
import {
  ValidationModuleOptions,
  ValidationModuleAsyncOptions,
  ValidationModuleOptionsFactory,
} from './interfaces';
import { SwaggerExplorerServices } from './services';
import { VALIDATION_MODULE_OPTIONS } from './validation.constants';
import { AjvValidator } from './validators';
import { SchemasRepository } from './schemas-repository';

@Global()
@Module({})
export class ValidationCoreModule implements OnApplicationBootstrap {
  static forRoot(options?: ValidationModuleOptions): DynamicModule {
    const validationProviders = this.createValidationProviders(options);
    return {
      module: ValidationCoreModule,
      providers: [
        ...validationProviders,
        SchemasRepository,
        SwaggerExplorerServices,
      ],
      exports: [...validationProviders, SchemasRepository],
    };
  }
  static forRootAsync(options: ValidationModuleAsyncOptions): DynamicModule {
    const validationProvider: Provider = {
      provide: AjvValidator,
      useFactory: (validationModuleOptions: ValidationModuleOptions) =>
        new AjvValidator(validationModuleOptions),
      inject: [VALIDATION_MODULE_OPTIONS],
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: ValidationCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        validationProvider,
        SchemasRepository,
        SwaggerExplorerServices,
      ],
      exports: [validationProvider, SchemasRepository],
    };
  }
  private static createValidationProviders(
    options?: ValidationModuleOptions,
  ): Provider[] {
    return [
      {
        provide: AjvValidator,
        useFactory: () => new AjvValidator(options),
      },
    ];
  }
  private static createAsyncProviders(
    options: ValidationModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<ValidationModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }
  private static createAsyncOptionsProvider(
    options: ValidationModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: VALIDATION_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<ValidationModuleOptionsFactory>,
    ];
    return {
      provide: VALIDATION_MODULE_OPTIONS,
      useFactory: async (optionsFactory: ValidationModuleOptionsFactory) =>
        await optionsFactory.createValidationOptions(),
      inject,
    };
  }
  constructor(
    private readonly _swaggerExplorer: SwaggerExplorerServices,
    private readonly _schemasRepository: SchemasRepository,
  ) {}
  onApplicationBootstrap(): void {
    const paths = this._swaggerExplorer.explore();
    this._schemasRepository.loadSchemas(paths);
  }
}

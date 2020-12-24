import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { IValidator, IValidatorErrorHandler } from './interfaces';
import { IValidationModuleOptions } from './interfaces/validation-module-options.interface';
import { NestJsContextProvider } from './nestjs-context-provider';
import { SwaggerExplorerServices } from './services';
import { VALIDATOR, VALIDATOR_ERROR_HANDLER } from './constants';
import { AjvValidator } from './validators';

export class ValidationCoreModule implements OnApplicationBootstrap {
  constructor(
    private readonly _swaggerExplorer: SwaggerExplorerServices,
    @Inject(VALIDATOR) private _validator: IValidator,
  ) {}

  static forRoot(
    options: IValidationModuleOptions,
    validatorErrorHandler: IValidatorErrorHandler,
  ): DynamicModule {
    return {
      global: true,
      module: ValidationCoreModule,
      providers: [
        {
          provide: VALIDATOR_ERROR_HANDLER,
          useValue: validatorErrorHandler,
        },
        {
          provide: VALIDATOR,
          useFactory: () => new AjvValidator(options),
        },
        NestJsContextProvider,
        SwaggerExplorerServices,
      ],
      exports: [
        NestJsContextProvider,
        SwaggerExplorerServices,
        VALIDATOR_ERROR_HANDLER,
        VALIDATOR,
      ],
    };
  }

  onApplicationBootstrap(): void {
    const schemas = this._swaggerExplorer.explore();

    this._validator.loadSwaggerSchemas(schemas);
  }
}

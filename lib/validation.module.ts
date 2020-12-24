import { DynamicModule } from '@nestjs/common';
import { ValidationCoreModule } from './validation.core.module';
import { IValidatorErrorHandler } from './interfaces';
import { IValidationModuleOptions } from './interfaces/validation-module-options.interface';
import { ValidatorErrorHandler } from './validator-error-handler';

export class ValidationModule {
  static forRoot(
    options: IValidationModuleOptions = {
      strict: false,
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
    },
    validatorErrorHandler: IValidatorErrorHandler = new ValidatorErrorHandler(),
  ): DynamicModule {
    return {
      module: ValidationModule,
      imports: [ValidationCoreModule.forRoot(options, validatorErrorHandler)],
    };
  }
}

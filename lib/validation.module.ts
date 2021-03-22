import { DynamicModule, Module } from '@nestjs/common';
import { ValidationCoreModule } from './validation-core.module';
import {
  ValidationModuleAsyncOptions,
  ValidationModuleOptions,
} from './interfaces';
import { createValidationProviders } from './validation.provider';

@Module({})
export class ValidationModule {
  static forRoot(options?: ValidationModuleOptions): DynamicModule {
    return {
      module: ValidationModule,
      imports: [ValidationCoreModule.forRoot(options)],
    };
  }
  static forRootAsync(options: ValidationModuleAsyncOptions): DynamicModule {
    return {
      module: ValidationModule,
      imports: [ValidationCoreModule.forRootAsync(options)],
    };
  }
  static forFeature(): DynamicModule {
    const providers = createValidationProviders();
    return {
      module: ValidationModule,
      providers: providers,
      exports: providers,
    };
  }
}

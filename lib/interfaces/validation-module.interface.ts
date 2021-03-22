import { ModuleMetadata, Type } from '@nestjs/common';
import { Options as AjvOptions } from 'ajv';

export type ValidationModuleOptions = AjvOptions;

export interface ValidationModuleOptionsFactory {
  createValidationOptions():
    | Promise<ValidationModuleOptions>
    | ValidationModuleOptions;
}

export interface ValidationModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ValidationModuleOptionsFactory>;
  useClass?: Type<ValidationModuleOptionsFactory>;
  useFactory?: (
    ..._args: any[]
  ) => Promise<ValidationModuleOptions> | ValidationModuleOptions;
  inject?: any[];
}

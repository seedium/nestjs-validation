import { OperationValidators } from './paths-schemas.interface';
import { AsyncValidateFunction } from 'ajv';

export interface SerializerTypeValidator<T = AsyncValidateFunction | null> {
  type: keyof OperationValidators;
  validator: T;
}

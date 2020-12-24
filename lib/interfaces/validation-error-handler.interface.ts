import { IValidationError } from './validator-result.interface';

export interface IValidatorErrorHandler {
  handle(_errors: IValidationError[]): void;
}

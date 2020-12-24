import { ValidationError } from './errors';
import { IValidationError, IValidatorErrorHandler } from './interfaces';

export class ValidatorErrorHandler implements IValidatorErrorHandler {
  public handle(errors: IValidationError[]): void {
    throw new ValidationError(errors[0].message, errors);
  }
}

import { IValidationError } from '../interfaces';

export class ValidationError extends Error {
  public validation?: IValidationError[];
  public name = 'ValidationError';
  public type = 'validation_error';

  constructor(message?: string, errors?: IValidationError[]) {
    super(message);

    this.validation = errors;
  }
}

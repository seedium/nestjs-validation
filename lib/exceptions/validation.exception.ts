import { ErrorObject } from 'ajv';

export class ValidationException extends Error {
  public errors: ErrorObject[];
  public name = 'ValidationException';

  constructor(errors: ErrorObject[], message?: string) {
    super(message || `Validation is failed`);

    this.errors = errors;
  }
}

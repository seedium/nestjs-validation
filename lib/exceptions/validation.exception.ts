import { ErrorObject } from 'ajv';

export class ValidationException extends Error {
  public errors: ErrorObject[];
  public originalData: unknown;
  public name = 'ValidationException';

  constructor(errors: ErrorObject[], originalData?: unknown, message?: string) {
    super(message || `Validation is failed`);

    this.errors = errors;
    this.originalData = originalData;
  }
}

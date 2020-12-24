export interface IValidationError {
  message: string;
}

export interface IValidatorResult {
  success: boolean;
  validated: boolean;
  errors: IValidationError[];
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AsyncValidateFunction } from 'ajv';
import { OperationSchemas } from '../interfaces';
import { SchemasRepository } from '../schemas-repository';

@Injectable()
export class ValidationContextService {
  constructor(private readonly _schemasRepository: SchemasRepository) {}
  public getValidatorByType(
    type: keyof OperationSchemas,
    context: ExecutionContext,
  ): AsyncValidateFunction | null {
    const operationId = this.getOperationId(context);
    const operationValidators = this._schemasRepository.getOperationValidators(
      operationId,
    );
    if (!operationValidators) {
      return null;
    }
    return operationValidators[type] ?? null;
  }
  public getResponseValidatorByStatusCode(
    statusCode: number,
    context: ExecutionContext,
  ): AsyncValidateFunction | null {
    const operationId = this.getOperationId(context);
    const operationValidators = this._schemasRepository.getOperationValidators(
      operationId,
    );
    if (!operationValidators) {
      return null;
    }
    const responseValidator = operationValidators.responses[statusCode];
    if (!responseValidator) {
      return null;
    }
    return responseValidator;
  }
  private getOperationId(context: ExecutionContext): string {
    return `${context.getClass().name}_${context.getHandler().name}`;
  }
}

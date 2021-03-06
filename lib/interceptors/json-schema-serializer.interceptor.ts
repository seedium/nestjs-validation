import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ValidationContextService } from '../services';
import { ValidationException } from '../exceptions';
import { SerializerTypeValidator } from '../interfaces';
import { AsyncValidateFunction } from 'ajv';

@Injectable()
export class JsonSchemaSerializerInterceptor implements NestInterceptor {
  constructor(private readonly _validationContext: ValidationContextService) {}
  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    await this.onRequest(context);
    return next.handle().pipe(map((data) => this.onResponse(data, context)));
  }
  private async onRequest(context: ExecutionContext): Promise<void> {
    const req = context.switchToHttp().getRequest();
    const serializerTypeValidators: SerializerTypeValidator[] = [
      {
        type: 'params',
        validator: this._validationContext.getValidatorByType(
          'parameters',
          context,
        ),
      },
      {
        type: 'query',
        validator: this._validationContext.getValidatorByType('query', context),
      },
      {
        type: 'headers',
        validator: this._validationContext.getValidatorByType(
          'headers',
          context,
        ),
      },
      {
        type: 'body',
        validator: this._validationContext.getValidatorByType('body', context),
      },
    ];
    try {
      await Promise.all(
        serializerTypeValidators
          .filter(this.isSerializerValidatorSet())
          .map(({ type, validator }) => validator(req[type])),
      );
    } catch (err) {
      throw new ValidationException(err.errors);
    }
  }
  private async onResponse<T = unknown>(
    data: T,
    context: ExecutionContext,
  ): Promise<T> {
    const statusCode = this.getStatusCode(context);
    const validator = this._validationContext.getResponseValidatorByStatusCode(
      statusCode,
      context,
    );
    if (!validator) {
      return data;
    }
    try {
      await validator(data);
    } catch (err) {
      throw new ValidationException(err.errors);
    }
    return data;
  }
  private getStatusCode(context: ExecutionContext): number {
    const res = context.switchToHttp().getResponse();
    return res.statusCode;
  }
  private isSerializerValidatorSet(): (
    _serializerValidator: SerializerTypeValidator,
  ) => _serializerValidator is SerializerTypeValidator<AsyncValidateFunction> {
    return (
      serializerValidator: SerializerTypeValidator,
    ): serializerValidator is SerializerTypeValidator<AsyncValidateFunction> =>
      !!serializerValidator.validator;
  }
}

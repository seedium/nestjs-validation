import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncValidateFunction } from 'ajv';
import type { FastifyReply } from 'fastify';
import type { Response } from '@nestjs/common';
import { AjvValidator } from '../validators';
import { ValidationContextService } from '../services';
import { ValidationException } from '../exceptions';
import {
  SerializerTypeValidator,
  ValidationModuleOptions,
} from '../interfaces';
import { VALIDATION_MODULE_OPTIONS } from '../validation.constants';

@Injectable()
export class JsonSchemaSerializerInterceptor implements NestInterceptor {
  constructor(
    private readonly _validationContext: ValidationContextService,
    private readonly _ajv: AjvValidator,
    @Inject(VALIDATION_MODULE_OPTIONS)
    private readonly _validationModuleOptions: ValidationModuleOptions,
  ) {}
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
      throw new ValidationException(
        err.errors,
        this._ajv.ajv.errorsText(err.errors),
      );
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
      const maybeJsonString = await validator(data);
      if (this._validationModuleOptions.fastSerialization) {
        this.setApplicationJsonType(context);
        return maybeJsonString;
      }
    } catch (err) {
      throw new ValidationException(
        err.errors,
        this._ajv.ajv.errorsText(err.errors),
      );
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
  private setApplicationJsonType(context: ExecutionContext): void {
    const res = context.switchToHttp().getResponse<FastifyReply | Response>();
    if (this.isFastifyResponse(res)) {
      res.type('application/json');
      return;
    }
    throw new Error(
      `The application is using Express adapter which currently is not supported`,
    );
  }
  private isFastifyResponse(res: FastifyReply | Response): res is FastifyReply {
    return !!(res as FastifyReply).raw;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VALIDATOR, VALIDATOR_ERROR_HANDLER } from '../constants';
import { ISchemaIdContextData, IValidator } from '../interfaces';
import { NestJsContextProvider } from '../nestjs-context-provider';
import { ValidatorErrorHandler } from '../validator-error-handler';

@Injectable()
export class JsonSchemaSerializerInterceptor implements NestInterceptor {
  private readonly _contextProvider = new NestJsContextProvider();

  constructor(
    @Inject(VALIDATOR) private _validator: IValidator,
    @Inject(VALIDATOR_ERROR_HANDLER)
    private _errorHandler: ValidatorErrorHandler,
  ) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const schemas = this.getPathSchemas(context);

    await Promise.all(
      schemas.map(async (schema) => {
        const result = await this._validator.validateBySwaggerSchemaId(
          schema.id,
          schema.data,
        );

        if (!result.success) {
          this._errorHandler.handle(result.errors);
        }
      }),
    );

    return next.handle().pipe(
      map(async (data) => {
        const statusCode = this._contextProvider.getStatusCode(context);

        const result = await this._validator.validateBySwaggerSchemaId(
          this._contextProvider.getSchemaIdCompiler(context)(statusCode),
          data,
        );

        if (!result.success) {
          this._errorHandler.handle(result.errors);
        }

        return data;
      }),
    );
  }

  private getPathSchemas(context: ExecutionContext): ISchemaIdContextData[] {
    const getSchemaId = this._contextProvider.getSchemaIdCompiler(context);
    const extractDataRequest = this._contextProvider.getRequestExtractor(
      context,
    );

    return this._contextProvider.swaggerDataTypes.map((dataType) => ({
      data: extractDataRequest(dataType),
      id: getSchemaId(dataType),
    }));
  }
}

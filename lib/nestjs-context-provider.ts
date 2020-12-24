import { ExecutionContext } from '@nestjs/common';
import { ReqDataGiver, SchemaIdCompiler, SwaggerDataType } from './interfaces';

export class NestJsContextProvider {
  public readonly swaggerDataTypes: SwaggerDataType[] = [
    'body',
    'query',
    'path',
    'header',
  ];

  public getStatusCode(context: ExecutionContext): number {
    return context.switchToHttp().getResponse().statusCode;
  }

  public getSchemaIdCompiler(context: ExecutionContext): SchemaIdCompiler {
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    return (prefix: string | number) =>
      `${controllerName}_${handlerName}_${prefix}`;
  }

  public getRequestExtractor(context: ExecutionContext): ReqDataGiver {
    const req = context.switchToHttp().getRequest();

    return (dataType: SwaggerDataType) => {
      let key: string = dataType;

      if (dataType === 'path') {
        key = 'params';
      } else if (dataType === 'header') {
        key = 'headers';
      }

      return req[key];
    };
  }
}

import { Injectable } from '@nestjs/common';
import { JSONSchema, BaseSchema } from 'fluent-json-schema';
import { AsyncValidateFunction } from 'ajv';
import * as fastJson from 'fast-json-stringify';
import {
  OperationSchemas,
  OperationValidators,
  PathsSchemas,
  ResponsesSchemas,
  LoadSchemasOptions,
  FastJsonStringifier,
} from './interfaces';
import { AjvValidator } from './validators';

@Injectable()
export class SchemasRepository {
  private _schemas: Record<string, OperationValidators> = {};
  constructor(private readonly _ajv: AjvValidator) {}
  public loadSchemas(
    pathsSchemas: PathsSchemas,
    { fastSerialization }: LoadSchemasOptions = {},
  ): void {
    this.iterateThroughEachMethod(
      pathsSchemas,
      (operationId, type, jsonSchemaOrResponses) => {
        if (!jsonSchemaOrResponses) {
          return;
        }
        this._schemas[operationId] = this._schemas[operationId] ?? {};
        if (this.isJsonSchema(jsonSchemaOrResponses)) {
          this._schemas[operationId][type] = this.compileJsonSchema(
            jsonSchemaOrResponses,
          );
        } else if (this.isResponsesSchemas(type, jsonSchemaOrResponses)) {
          this._schemas[operationId].responses =
            this._schemas[operationId].responses ?? {};
          Object.entries(jsonSchemaOrResponses).forEach(
            ([statusCode, jsonSchema]) => {
              if (!jsonSchema) {
                return;
              }
              this._schemas[operationId].responses[
                statusCode
              ] = this.getAjvSerializationValidator(
                jsonSchema,
                fastSerialization,
              );
            },
          );
        } else {
          throw new Error(
            `Fail loading schemas. Method ${operationId} has some of invalid schema`,
          );
        }
      },
    );
  }
  public getOperationValidators(
    operationId: string,
  ): OperationValidators | null {
    return this._schemas[operationId] ?? null;
  }
  private iterateThroughEachMethod(
    pathsSchemas: PathsSchemas,
    cb: (
      _operationId: string,
      _type: keyof OperationSchemas,
      _jsonSchemaOrResponses: JSONSchema | ResponsesSchemas<JSONSchema>,
    ) => void,
  ) {
    Object.entries(pathsSchemas).forEach(([operationId, methodSchemas]) =>
      Object.entries(methodSchemas).forEach(([type, jsonSchemaOrResponses]) =>
        cb(operationId, type, jsonSchemaOrResponses),
      ),
    );
  }
  private getAjvSerializationValidator(
    jsonSchema: JSONSchema,
    fastSerialization?: boolean,
  ): AsyncValidateFunction | FastJsonStringifier {
    if (fastSerialization) {
      return fastJson(jsonSchema.valueOf());
    }
    return this.compileJsonSchema(jsonSchema);
  }
  private compileJsonSchema(jsonSchema: JSONSchema): AsyncValidateFunction {
    return this._ajv.ajv.compile({
      $async: true,
      ...jsonSchema.valueOf(),
    });
  }
  private isJsonSchema(
    maybeJsonSchema: unknown,
  ): maybeJsonSchema is JSONSchema {
    return (maybeJsonSchema as BaseSchema<unknown>).isFluentJSONSchema;
  }
  private isResponsesSchemas(
    type: keyof OperationSchemas,
    maybeResponses: unknown,
  ): maybeResponses is ResponsesSchemas<JSONSchema> {
    return type === 'responses';
  }
}

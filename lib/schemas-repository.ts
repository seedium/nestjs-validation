import { Injectable } from '@nestjs/common';
import { JSONSchema, BaseSchema } from 'fluent-json-schema';
import {
  OperationSchemas,
  OperationValidators,
  PathsSchemas,
  ResponsesSchemas,
} from './interfaces';
import { AjvValidator } from './validators';

@Injectable()
export class SchemasRepository {
  private _schemas: Record<string, OperationValidators> = {};
  constructor(private readonly _ajv: AjvValidator) {}
  public loadSchemas(pathsSchemas: PathsSchemas): void {
    this.iterateThroughEachMethod(
      pathsSchemas,
      (operationId, type, jsonSchemaOrResponses) => {
        if (!jsonSchemaOrResponses) {
          return;
        }
        this._schemas[operationId] = this._schemas[operationId] ?? {};
        if (this.isJsonSchema(jsonSchemaOrResponses)) {
          this._schemas[operationId][type] = this._ajv.ajv.compile({
            $async: true,
            ...jsonSchemaOrResponses.valueOf(),
          });
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
              ] = this._ajv.ajv.compile({
                $async: true,
                ...jsonSchema.valueOf(),
              });
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

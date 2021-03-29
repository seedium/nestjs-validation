import { JSONSchema } from 'fluent-json-schema';
import { AsyncValidateFunction } from 'ajv';

export type FastJsonStringifier = (_doc: any) => any;

export type PathsSchemas = Record<string, OperationSchemas>;

export interface ResponsesSchemas<T> {
  [statusCode: string]: T | null;
}
export interface OperationSchemas extends Record<string, any> {
  parameters: JSONSchema | null;
  query: JSONSchema | null;
  body: JSONSchema | null;
  headers: JSONSchema | null;
  responses: ResponsesSchemas<JSONSchema>;
}

export interface OperationValidators extends Record<string, any> {
  parameters: AsyncValidateFunction | null;
  query: AsyncValidateFunction | null;
  body: AsyncValidateFunction | null;
  headers: AsyncValidateFunction | null;
  responses: ResponsesSchemas<AsyncValidateFunction | FastJsonStringifier>;
}

export interface DefaultObjectSchema {
  type: 'object';
  additionalProperties: boolean;
  required: string[];
  properties: Record<string, any>;
}

import { IValidatorResult } from '.';
import { AnySchemaObject } from 'ajv';

export type SchemaObject = AnySchemaObject;

export interface IValidator {
  validateBySchemaId(_schemaId: string, _data: any): Promise<IValidatorResult>;
  validateBySwaggerSchemaId(
    _schemaId: string,
    _data: any,
  ): Promise<IValidatorResult>;
  loadSchema(_schema: SchemaObject): void;
  loadSwaggerSchemas(_schemas: SchemaObject[]): void;
  getIdWithPrefix(_id: string): string;
}

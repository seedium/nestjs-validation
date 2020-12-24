import { Injectable } from '@nestjs/common';
import Ajv, { Options } from 'ajv';
import addFormats from 'ajv-formats';
import { VALIDATOR_ID_PREFIX } from '../constants';
import { IValidator, IValidatorResult, SchemaObject } from '../interfaces';

@Injectable()
export class AjvValidator implements IValidator {
  protected _ajv: Ajv;

  public get ajv(): Ajv {
    return this._ajv;
  }

  constructor(options?: Options) {
    const ajv: any = new Ajv(options);

    addFormats(ajv);

    this._ajv = ajv;
  }

  public loadSwaggerSchemas(schemas: SchemaObject[]): void {
    schemas = JSON.parse(JSON.stringify(schemas));

    schemas.forEach((schema) => {
      schema = this.addPrefixToRefs(VALIDATOR_ID_PREFIX, schema);

      if (schema.$id) {
        schema.$id = `${VALIDATOR_ID_PREFIX}${schema.$id}`;
      }

      this.ajv.addSchema({
        ...schema,
        $async: true,
      });
    });
  }

  public loadSchema(schema: SchemaObject): void {
    this.ajv.addSchema({
      ...schema,
      $async: true,
    });
  }

  public addPrefixToRefs(prefix: string, schema: SchemaObject): SchemaObject {
    Object.keys(schema).forEach((key) => {
      if (Array.isArray(schema[key])) {
        schema[key].forEach((prop) => {
          this.addPrefixToRefs(prefix, prop);
        });
      } else if (schema[key] && typeof schema[key] === 'object') {
        this.addPrefixToRefs(prefix, schema[key]);
      } else if (key === '$ref') {
        schema[key] = `${prefix}${schema[key]}`;
      }
    });

    return schema;
  }

  public async validateBySchemaId(
    schemaId: string,
    data: Record<string, unknown>,
  ): Promise<IValidatorResult> {
    const validator = this._ajv.getSchema(schemaId);
    const successResult = {
      success: true,
      errors: [],
    };

    if (!validator || !data) {
      return {
        ...successResult,
        validated: false,
      };
    }

    this.objectIdToString(data);

    try {
      await validator(data);
    } catch (e) {
      return {
        success: false,
        validated: true,
        errors: e.errors,
      };
    }

    return {
      ...successResult,
      validated: true,
    };
  }

  public validateBySwaggerSchemaId(
    schemaId: string,
    data: Record<string, unknown>,
  ): Promise<IValidatorResult> {
    return this.validateBySchemaId(this.getIdWithPrefix(schemaId), data);
  }

  public getIdWithPrefix(schemaId: string): string {
    return `${VALIDATOR_ID_PREFIX}${schemaId}`;
  }

  // TODO fix error - invalid ObjectId, ObjectId.id must be either a string or a Buffer
  // it is fast bad solution
  public objectIdToString(data: Record<string, unknown>): void {
    const clone = JSON.parse(JSON.stringify(data));

    Object.keys(data).forEach((key) => {
      data[key] = clone[key];
    });
  }
}

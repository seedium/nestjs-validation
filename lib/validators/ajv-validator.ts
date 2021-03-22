import { Injectable } from '@nestjs/common';
import Ajv, { Options } from 'ajv';
import { JSONSchema } from 'fluent-json-schema';
import { SchemaForwardRef } from '../interfaces';

@Injectable()
export class AjvValidator {
  protected _ajv: Ajv;

  public get ajv(): Ajv {
    return this._ajv;
  }

  constructor(
    options: Options = {
      strict: false,
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
    },
  ) {
    this._ajv = new Ajv(options);
    this.addCircularRefKeyword(this._ajv);
  }
  private addCircularRefKeyword(ajv: Ajv) {
    const getSchemaFromForwardRef = (forwardRef: SchemaForwardRef): object => {
      if (this.isRefFunction(forwardRef)) {
        return forwardRef().valueOf();
      }
      return forwardRef.valueOf();
    };
    ajv.addKeyword({
      keyword: 'forwardRef',
      modifying: true,
      async: true,
      validate(forwardRef: SchemaForwardRef, data: any) {
        const schema = getSchemaFromForwardRef(forwardRef);
        return ajv.validate(
          {
            ...schema,
            $async: true,
          },
          data,
        );
      },
    });
  }
  private isRefFunction(
    forwardRef: SchemaForwardRef,
  ): forwardRef is () => JSONSchema {
    return typeof forwardRef === 'function';
  }
}

import S, { JSONSchema } from 'fluent-json-schema';
import { SchemaForwardRef } from './interfaces';

export const createRef = (schemaOrRef: SchemaForwardRef): JSONSchema =>
  S.raw({
    forwardRef: schemaOrRef,
  });

import { JSONSchema } from 'fluent-json-schema';

export type SchemaForwardRef = JSONSchema | (() => JSONSchema);

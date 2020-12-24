export type SwaggerDataType = 'body' | 'query' | 'path' | 'header';

export type SchemaIdCompiler = (_prefix: string | number) => string;

export type ReqDataGiver = (_dataType: SwaggerDataType) => unknown;

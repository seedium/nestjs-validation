export interface ISchemaIdContextData {
  id: string;
  data: any;
}

export interface IScanBodySchema {
  operationId: string;
  requestBody: any;
}

export interface IScanResponsesSchemas {
  operationId: string;
  responses: any;
}

export interface IScanQueryParamHeaderSchemas {
  operationId: string;
  parameters: any[];
}

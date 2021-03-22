import { Injectable } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';
import { SwaggerScanner } from '@nestjs/swagger/dist/swagger-scanner';
import {
  ParameterObject,
  ResponsesObject,
  ReferenceObject,
  ResponseObject,
  ParameterLocation,
  RequestBodyObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import S, { JSONSchema } from 'fluent-json-schema';
import { PathsSchemas, DefaultObjectSchema } from '../interfaces';
import { flatten } from '../utils';

@Injectable()
export class SwaggerExplorerServices {
  private _scanner = new SwaggerScanner();

  constructor(private readonly _modulesContainer: ModulesContainer) {}

  public explore(): PathsSchemas {
    const { paths } = this.scanApplication();
    let schemas: PathsSchemas = {};
    Object.values(paths).forEach((methods) => {
      Object.values(methods).forEach((operationObject) => {
        const operationId = operationObject.operationId;
        schemas = {
          ...schemas,
          [operationId]: {
            parameters: this.mergeParameters(
              'path',
              operationObject.parameters,
            ),
            query: this.mergeParameters('query', operationObject.parameters),
            headers: this.mergeParameters('header', operationObject.parameters),
            body: this.extractBodySchema(operationObject.requestBody),
            responses: this.transformResponses(operationObject.responses),
          },
        };
      });
    });
    return schemas;
  }
  protected scanApplication(): Omit<OpenAPIObject, 'openapi' | 'info'> {
    const modules: Module[] = this._scanner.getModules(
      this._modulesContainer,
      [],
    );

    const denormalizedPaths = modules.map(({ routes, metatype }) => {
      const allRoutes = new Map(routes);
      const path = Reflect.getMetadata(MODULE_PATH, metatype);

      return this._scanner.scanModuleRoutes(allRoutes, path);
    });

    return (this._scanner as any).transfomer.normalizePaths(
      flatten(denormalizedPaths),
    );
  }
  private mergeParameters(
    type: ParameterLocation,
    parameters?: (ParameterObject | ReferenceObject)[],
  ): JSONSchema | null {
    if (!parameters) {
      return null;
    }
    const filteredParameters = parameters
      .filter(this.filterNotReferenceObject())
      .filter(this.filterParameterObjectByType(type));
    if (!filteredParameters.length) {
      return null;
    }
    const required: string[] = [];
    const jsonSchema = this.createEmptyObjectSchema();
    filteredParameters.forEach((parameterObject) => {
      const propertyName = this.getPropertyName(type, parameterObject.name);
      if (parameterObject.required) {
        required.push(propertyName);
      }
      jsonSchema.properties[propertyName] = parameterObject.schema;
    });
    jsonSchema.required.push(...required);
    return S.raw(jsonSchema);
  }
  private getPropertyName(type: ParameterLocation, name: string): string {
    if (type === 'header') {
      return name.toLowerCase();
    }
    return name;
  }
  private extractBodySchema(requestBody: RequestBodyObject): JSONSchema | null {
    const schema = this.getSchemaFromJsonMediaType(requestBody);
    return schema ?? null;
  }
  private transformResponses(
    responses?: ResponsesObject,
  ): Record<string, JSONSchema> {
    if (!responses) {
      return {};
    }
    return Object.entries(responses).reduce(
      (responsesJsonSchemas, [statusCode, responseObject]) => {
        const isNotReferenceObject = this.filterNotReferenceObject()(
          responseObject,
        );
        if (!isNotReferenceObject) {
          return responsesJsonSchemas;
        }
        const schema = this.getSchemaFromJsonMediaType(
          responseObject as ResponseObject,
        );
        if (schema) {
          responsesJsonSchemas[statusCode] = schema;
        }
        return responsesJsonSchemas;
      },
      {} as Record<string, JSONSchema>,
    );
  }
  private filterParameterObjectByType(type: ParameterLocation) {
    return (parameterObject: ParameterObject) => parameterObject.in === type;
  }
  private filterNotReferenceObject<T>(): (
    _args: T | ReferenceObject,
  ) => _args is T {
    return (
      parameterObjectOrRef: T | ReferenceObject,
    ): parameterObjectOrRef is T => !('$ref' in parameterObjectOrRef);
  }
  private createEmptyObjectSchema(): DefaultObjectSchema {
    return {
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: {},
    };
  }
  private getSchemaFromJsonMediaType(
    responseOrRequestObject?: ResponseObject | RequestBodyObject,
  ): JSONSchema | null {
    if (
      responseOrRequestObject &&
      responseOrRequestObject.content &&
      responseOrRequestObject.content['application/json'] &&
      responseOrRequestObject.content['application/json'].schema
    ) {
      return S.raw(responseOrRequestObject.content['application/json'].schema);
    } else {
      return null;
    }
  }
}

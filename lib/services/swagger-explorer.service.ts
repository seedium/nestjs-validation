import { Injectable } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';
import { SwaggerScanner } from '@nestjs/swagger/dist/swagger-scanner';
import {
  IScanBodySchema,
  IScanResponsesSchemas,
  IScanQueryParamHeaderSchemas,
  SwaggerDataType,
} from '../interfaces';
import { flatten } from '../utils';

@Injectable()
export class SwaggerExplorerServices {
  private _scanner = new SwaggerScanner();

  constructor(private readonly _modulesContainer: ModulesContainer) {}

  public explore(): any[] {
    const { paths } = this.scanApplication();

    return Object.values(paths).reduce((schemas: unknown[], methods) => {
      Object.values(methods).forEach((swaggerSchemas) => {
        schemas.push(...this.scanBodySchema(swaggerSchemas));
        schemas.push(...this.scanSchemas(swaggerSchemas, 'path'));
        schemas.push(...this.scanSchemas(swaggerSchemas, 'query'));
        schemas.push(...this.scanSchemas(swaggerSchemas, 'header'));
        schemas.push(...this.scanResponsesSchemas(swaggerSchemas));
      });

      return schemas;
    }, []);
  }

  protected scanBodySchema({
    operationId,
    requestBody,
  }: IScanBodySchema): any[] {
    if (!requestBody || !requestBody.content) {
      return [];
    }

    return [
      {
        ...requestBody.content['application/json'].schema,
        $id: `${operationId}_body`,
      },
    ];
  }

  protected scanResponsesSchemas({
    operationId,
    responses,
  }: IScanResponsesSchemas): any[] {
    const result: any[] = [];

    Object.keys(responses).forEach((status) => {
      if (responses[status].content) {
        const schema = responses[status].content['application/json'].schema;

        result.push({
          ...schema,
          $id: `${operationId}_${status}`,
        });
      }
    });

    return result;
  }

  protected scanSchemas(
    { operationId, parameters }: IScanQueryParamHeaderSchemas,
    type: SwaggerDataType,
  ): any[] {
    const schemaFilter = (filterSchema) => filterSchema.in === type;

    const filterSchemas = parameters.filter(schemaFilter);

    if (filterSchemas.length === 0) {
      return [];
    }

    const schema = this.createSchemaFromSchemas(filterSchemas);

    return [
      {
        ...schema,
        $id: `${operationId}_${type}`,
      },
    ];
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

  protected createSchemaFromSchemas(
    swaggerSchemas: Record<string, any>[],
  ): any {
    const schema: Record<string, any> = {
      type: 'object',
      required: [],
      properties: {},
    };

    swaggerSchemas.forEach((swaggerSchema) => {
      schema.properties[swaggerSchema.name] = swaggerSchema.schema;

      if (swaggerSchema.required) {
        schema.required.push(swaggerSchema.name);
      }
    });

    return schema;
  }
}

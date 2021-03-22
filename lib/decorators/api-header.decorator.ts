import { isNil } from '@nestjs/common/utils/shared.utils';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { SwaggerEnumType } from '@nestjs/swagger/dist/types/swagger-enum.type';
import {
  ParameterObject,
  ParameterLocation,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  getEnumValues,
  getEnumType,
} from '@nestjs/swagger/dist/utils/enum.utils';
import {
  createClassDecorator,
  createParamDecorator,
} from '@nestjs/swagger/dist/decorators/helpers';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import * as pickBy from 'lodash.pickby';
import { negate } from '../utils';

export interface ApiHeaderOptions extends Omit<ParameterObject, 'in'> {
  enum?: SwaggerEnumType;
}

const defaultHeaderOptions: Partial<ApiHeaderOptions> = {
  name: '',
};

export function ApiHeader(
  options: ApiHeaderOptions,
): MethodDecorator & ClassDecorator {
  const param: ApiHeaderOptions & { in: ParameterLocation } = pickBy(
    {
      name: isNil(options.name) ? defaultHeaderOptions.name : options.name,
      in: 'header',
      description: options.description,
      required: options.required,
      schema: options.schema || {
        type: 'string',
      },
    },
    negate(isUndefined),
  );

  if (options.enum) {
    const enumValues = getEnumValues(options.enum);
    param.schema = {
      enum: enumValues,
      type: getEnumType(enumValues),
    };
  }

  return (
    target: object | Function,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ): any => {
    if (descriptor && key) {
      return createParamDecorator(param, defaultHeaderOptions)(
        target,
        key,
        descriptor,
      );
    }
    return createClassDecorator(DECORATORS.API_HEADERS, [param])(
      target as Function,
    );
  };
}

export const ApiHeaders = (
  headers: ApiHeaderOptions[],
): MethodDecorator & ClassDecorator => {
  return (
    target: object | Function,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ): any => {
    headers.forEach((options) =>
      ApiHeader(options)(
        target,
        key as string | symbol,
        descriptor as TypedPropertyDescriptor<any>,
      ),
    );
  };
};

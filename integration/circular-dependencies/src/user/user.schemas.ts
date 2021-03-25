import S from 'fluent-json-schema';
import { catDto } from '../cats/cats.schemas';
import { createRef } from '../../../../lib';

export const userDto = S.object()
  .additionalProperties(false)
  .prop('firstName', S.string())
  .prop('lastName', S.string())
  .prop(
    'cat',
    createRef(() => catDto),
  );

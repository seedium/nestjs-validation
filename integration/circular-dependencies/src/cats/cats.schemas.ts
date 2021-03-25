import S from 'fluent-json-schema';
import { userDto } from '../user/user.schemas';
import { createRef } from '../../../../lib';

export const catDto = S.object()
  .additionalProperties(false)
  .prop('name', S.string())
  .prop('age', S.number())
  .prop(
    'user',
    createRef(() => userDto),
  );

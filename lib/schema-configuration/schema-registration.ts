import { SchemaPrecompiler } from './schema-precompiler';
import { catDto } from './test-schemas/cats.schemas';
import { PrecompiledSchemas } from './schema-enum';

export class SchemaRegistration {
  public static Init(): void {
    const precompiler = SchemaPrecompiler.getInstance();
    precompiler.precompileSchema(catDto.valueOf(), PrecompiledSchemas._catDto);
  }
}

import { AjvValidator } from '../../lib';
import { PrecompiledSchemas } from './schema-enum';

export class SchemaPrecompiler {
  private static instance: SchemaPrecompiler;
  private validators: object;
  private ajvValidator: AjvValidator;

  private constructor() {
    this.ajvValidator = new AjvValidator({
      allErrors: true,
      useDefaults: true,
    });
    this.validators = new Object();
  }

  public static getInstance(): SchemaPrecompiler {
    if (!SchemaPrecompiler.instance) {
      SchemaPrecompiler.instance = new SchemaPrecompiler();
    }

    return SchemaPrecompiler.instance;
  }

  public precompileSchema(schema: Object, key: PrecompiledSchemas): void {
    const schemaWithAsync = (schema.valueOf()['$async'] = true);
    const validator = this.ajvValidator.ajv.compile(schemaWithAsync);
    this.validators[key] = validator;
  }

  public getValidatorByKey(key: PrecompiledSchemas): any {
    return this.validators[key];
  }
}

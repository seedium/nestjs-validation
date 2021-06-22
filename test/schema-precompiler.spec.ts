import { SchemaRegistration } from '../lib/schema-configuration/schema-registration';
import { SchemaPrecompiler } from '../lib/schema-configuration/schema-precompiler';
import * as chai from 'chai';
import { PrecompiledSchemas } from '../lib/schema-configuration/schema-enum';

const expect = chai.expect;

describe('SchemaPrecompiler', () => {
  SchemaRegistration.Init();
  it('should validate plain object with schema with circular dependencies', async () => {
    const data = {
      name: 'name1',
      age: 5,
    };
    const validate = SchemaPrecompiler.getInstance().getValidatorByKey(
      PrecompiledSchemas._catDto,
    );
    const valid = validate(data);
    expect(valid).to.equal(true);
  });
  it('should validate circular object schema with circular dependencies', async () => {
    const data = {
      name: 'name1',
      age: 5,
      user: {
        firstName: 'firstName1',
        lastname: 'lastname1',
      },
    };
    const validate = SchemaPrecompiler.getInstance().getValidatorByKey(
      PrecompiledSchemas._catDto,
    );
    const valid = validate(data);
    expect(valid).to.equal(true);
  });
});

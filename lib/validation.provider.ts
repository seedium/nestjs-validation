import { Provider } from '@nestjs/common';
import { ValidationContextService } from './services';

export const createValidationProviders = (): Provider[] => {
  return [ValidationContextService];
};

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JsonSchemaSerializerInterceptor, ValidationModule } from '../../../lib';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [ValidationModule.forRoot(), ValidationModule.forFeature(), CatsModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: JsonSchemaSerializerInterceptor,
    },
  ],
})
export class AppModule {}

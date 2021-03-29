import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('cats')
export class CatsController {
  @Post()
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        success: {
          type: 'boolean',
        },
        foo: {
          type: 'string',
        },
        hello: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
    },
  })
  public list(@Body() body: unknown) {
    return body;
  }
}

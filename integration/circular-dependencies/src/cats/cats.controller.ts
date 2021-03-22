import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { catDto } from './cats.schemas';

@Controller('cats')
export class CatsController {
  @Post()
  @ApiResponse({
    status: 201,
    schema: {
      type: 'array',
      items: catDto.valueOf(),
    },
  })
  public list(@Body() body: any) {
    return body;
  }
}

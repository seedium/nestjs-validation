import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { userDto } from './user.schemas';

@Controller('users')
export class UserController {
  @Post()
  @ApiResponse({
    status: 201,
    schema: {
      type: 'array',
      items: userDto.valueOf(),
    },
  })
  public list(@Body() body: any) {
    return body;
  }
}

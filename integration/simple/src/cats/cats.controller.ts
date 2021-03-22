import { Controller, Get, Headers, Param, Post, Query, Body } from '@nestjs/common';
import { ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiHeader } from '../../../../lib/decorators';

@Controller('cats')
export class CatsController {
  @Get('/params/:id_cat')
  public param(@Param('id_cat') idCat: number) {
    if (typeof idCat !== 'number') {
      throw new Error('id cat is not number');
    }
    return {
      success: true,
    };
  }

  @Get('/params/:first/some/:second')
  public severalParams(
    @Param('first') first: number,
    @Param('second') second: number,
  ) {
    if (typeof first !== 'number') {
      throw new Error('first is not number');
    }
    if (typeof second !== 'number') {
      throw new Error('second is not number');
    }
    return {
      success: true,
    };
  }

  @Get('/query')
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  public query(@Query() options: any) {
    if (typeof options.limit !== 'number') {
      throw new Error('limit is not number');
    }
    if (options.extra) {
      throw new Error('Should not pass extra option')
    }
    return {
      success: true,
    };
  }

  @Get('/query/several')
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  public severalQuery(@Query() options: any) {
    if (typeof options.limit !== 'number') {
      throw new Error('limit is not number');
    }
    if (typeof options.page !== 'number') {
      throw new Error('page is not number');
    }
    if (options.extra) {
      throw new Error('Should not pass extra option')
    }
    return {
      success: true,
    };
  }

  @Get('headers')
  @ApiHeader({
    name: 'Some-Test-Header',
    required: true,
    schema: {
      type: 'number',
    },
  })
  public headers(@Headers() headers: any) {
    if (!headers['some-test-header'] || typeof headers['some-test-header'] !== 'number') {
      throw new Error(`Header wrong`);
    }
    if (headers['some-extra-header']) {
      throw new Error('Should not pass extra header');
    }
    return {
      success: true,
    };
  }

  @Post('/body')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['foo'],
      additionalProperties: false,
      properties: {
        foo: {
          type: 'number',
        },
      }
    },
  })
  public body(@Body() body: any) {
    if (!body.foo || typeof body.foo !== 'number') {
      throw new Error(`Foo is invalid`);
    }
    if (body.extra) {
      throw new Error('Should not pass extra data');
    }
    return {
      success: true,
    };
  }

  @Get('/response')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        success: {
          type: 'boolean',
        },
      },
    },
  })
  public response() {
    return {
      success: true,
      extra: 'string',
    };
  }
}

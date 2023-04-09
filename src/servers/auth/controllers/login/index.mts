import { Controller, Get, Required, Query } from 'wittyna';

import { Context } from 'koa';

// todo
@Controller('login')
export class LoginController {
  // todo
  @Get()
  async login(
    @Query('client_id') @Required() client_id: string,

    ctx: Context
  ) {
    return null;
  }
}

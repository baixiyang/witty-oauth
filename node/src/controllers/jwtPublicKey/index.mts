import { Controller, Get } from 'wittyna';
import { Context } from 'koa';
import { CONFIG } from '../../config.mjs';
@Controller('jwtPublicKey')
export class JwtPublicKeyController {
  @Get()
  async jwtPublicKey(ctx: Context) {
    ctx.response.body = CONFIG.jwtPublicKey;
  }
}

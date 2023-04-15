import {
  Controller,
  Get,
  Required,
  Query,
  Header,
  ResponseError,
} from 'wittyna';
import { Context } from 'koa';
import { redisClient } from '../../index.mjs';
import { getJwtInfo, isJwt } from '../../utils/jwt.mjs';
import { clearAllTokenOfUser, getAccessTokenInfo } from '../../utils/token.mjs';
import { getResponseError } from '../../utils/error.mjs';
import { ResponseErrorType } from '../../type.mjs';
@Controller('logout')
export class LogoutController {
  @Get()
  async logout(
    @Query('access_token')
    access_token: string,
    @Query('id_token')
    id_token: string,
    @Query('redirect_uri')
    redirect_uri: string,
    ctx: Context
  ) {
    const session = ctx.session as any;
    let info;
    if (session.user_id) {
      info = { user_id: session.user_id };
    } else if (access_token) {
      info = await getAccessTokenInfo(access_token);
    } else if (id_token) {
      info = getJwtInfo(id_token);
    }
    if (info && info.user_id) {
      await clearAllTokenOfUser(info.user_id);
    }
    ctx.session = null;
    if (redirect_uri) {
      ctx.redirect(redirect_uri);
      return;
    }
    return 'logout success!';
  }
}

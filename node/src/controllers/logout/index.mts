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
    accessToken: string,
    @Query('id_token')
    idToken: string,
    @Query('redirect_uri')
    redirectUri: string,
    ctx: Context
  ) {
    const session = ctx.session as any;
    let info;
    if (session.userId) {
      info = { userId: session.userId };
    } else if (accessToken) {
      info = await getAccessTokenInfo(accessToken);
    } else if (idToken) {
      info = getJwtInfo(idToken);
    }
    if (info && info.userId) {
      await clearAllTokenOfUser(info.userId);
    }
    ctx.session = null;
    if (redirectUri) {
      ctx.redirect(redirectUri);
      return;
    }
    return 'logout success!';
  }
}

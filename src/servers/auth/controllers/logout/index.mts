import { Controller, Get, Required, Query, Header } from 'wittyna';
import { Context } from 'koa';
import { redisClient } from '../../index.mjs';
import { getJwtInfo, isJwt } from '../../utils/jwt.mjs';
import { clearAllTokenOfUser, getAccessTokenInfo } from '../../utils/token.mjs';
import { getResponseError } from '../../utils/error.mjs';
import { ResponseErrorType } from '../../type.mjs';
@Controller('logout')
export class LoginController {
  // todo code_challenge
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
    if (!access_token || !id_token) {
      throw getResponseError(
        ResponseErrorType.INVALID_TOKEN,
        'token is required!'
      );
    }
    let info;
    if (id_token) {
      info = getJwtInfo(id_token);
    } else {
      info = await getAccessTokenInfo(access_token);
    }
    if (!info || !info.user_id) {
      throw getResponseError(
        ResponseErrorType.INVALID_TOKEN,
        'Token is illegal or expired',
        401
      );
    }
    const session = ctx.session as unknown as { user_id: string };
    session.user_id = '';
    // 清除token 和refresh_token
    await clearAllTokenOfUser(info.user_id);
    // todo redirect_uri
  }
}

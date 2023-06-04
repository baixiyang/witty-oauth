import { Controller, Required, Query, Post, ResponseError } from 'wittyna';
import { prismaClient } from '../../index.mjs';
import { genNormalJwt } from '../../utils/jwt.mjs';
import { setAccessToken } from '../../utils/token.mjs';

@Controller('testToken')
export class TestTokenController {
  // 该接口在oauth2.1中规定只用于授权码模式
  @Post()
  async getToken(
    @Query('client_id') @Required() clientId: string,
    @Query('username') @Required() username: string | undefined,
    @Query('secret') @Required() secret: string | undefined
  ) {
    if (secret !== 'wittyna-auth-niubi') {
      throw new ResponseError({
        error: '暗号错误!',
      });
    }
    const client = await prismaClient.client.findUnique({
      where: {
        id: clientId,
      },
    });
    // 判断是否存在客户端
    if (!client) {
      throw new ResponseError({
        error: 'unknown client!',
      });
    }
    const user = await prismaClient.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new ResponseError({
        error: 'unknown user!',
      });
    }
    return {
      id_token: genNormalJwt({
        clientId,
        userId: user.id,
        scope: '',
      }),
      access_token: await setAccessToken({
        clientId,
        userId: user.id,
        scope: '',
      }),
    };
  }
}

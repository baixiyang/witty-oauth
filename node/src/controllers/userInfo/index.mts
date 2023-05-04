import { Controller, Get, Required, Header, ResponseError } from 'wittyna';
import { prismaClient } from '../../index.mjs';
import { getResponseError } from '../../utils/error.mjs';
import { ResponseErrorType } from '../../type.mjs';
import { getAccessTokenInfo } from '../../utils/token.mjs';
import { getJwtInfo, isJwt } from '../../utils/jwt.mjs';

@Controller('user/info')
export class UserInfoController {
  @Get()
  async getUserInfo(
    @Required()
    @Header('authorization')
    authorization: string
  ) {
    const token = authorization.split('Bearer ')[1];
    if (!token) {
      throw getResponseError(ResponseErrorType.INVALID_TOKEN, 'invalid_token!');
    }
    let info;
    if (isJwt(token)) {
      info = getJwtInfo(token) as {
        userId: string;
        clientId: string;
        scope: string;
      };
    } else {
      info = await getAccessTokenInfo(token);
    }
    if (!info || !info.userId) {
      throw getResponseError(
        ResponseErrorType.INVALID_TOKEN,
        'Token is illegal or expired',
        401
      );
    }
    let select = {
      id: true,
      username: true,
      email: true,
      phone: true,
    } as Record<string, boolean>;
    if (info.scope) {
      const scopes = info.scope.split(' ');
      select = scopes.reduce(
        (previousValue: Record<string, boolean>, currentValue) => {
          previousValue[currentValue] = true;
          return previousValue;
        },
        {} as Record<string, boolean>
      );
    }
    const user = await prismaClient.user.findUnique({
      where: {
        id: info.userId,
      },
      select: {
        ...select,
        client2UserArr: {
          where: {
            clientId: info.clientId,
          },
        },
      },
    });
    if (!user) {
      throw new ResponseError({
        error: 'no user found',
      });
    }
    return {
      ...user,
      isClientAdmin: user.client2UserArr?.[0]?.isClientAdmin,
      expiresAt: user.client2UserArr?.[0]?.expiresAt,
      client2UserArr: undefined,
    };
  }
}

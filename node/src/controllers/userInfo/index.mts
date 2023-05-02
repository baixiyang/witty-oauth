import { Controller, Get, Required, Header } from 'wittyna';
import { prismaClient } from '../../index.mjs';
import { getResponseError } from '../../utils/error.mjs';
import { ResponseErrorType } from '../../type.mjs';
import { getAccessTokenInfo } from '../../utils/token.mjs';
import { getJwtInfo, isJwt } from '../../utils/jwt.mjs';
import { User } from '@prisma/client';

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
        user_id: string;
        client_id: string;
        scope: string;
      };
    } else {
      info = await getAccessTokenInfo(token);
    }
    if (!info || !info.user_id) {
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
    return prismaClient.user.findUnique({
      where: {
        id: info.user_id,
      },
      select,
    });
  }
}

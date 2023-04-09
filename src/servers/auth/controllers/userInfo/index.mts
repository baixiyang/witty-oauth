import { Controller, Get, Required, Query, Header } from 'wittyna';
import { prismaClient } from '../../index.mjs';
import { getResponseError } from '../../utils/error.mjs';
import { ResponseErrorType } from '../../type.mjs';
import { getAccessTokenInfo } from '../../utils/token.mjs';
import { getJwtInfo, isJwt } from '../../utils/jwt.mjs';
import jwt from 'jsonwebtoken';

@Controller('user-info')
export class UserInfoController {
  @Get()
  async getUserInfo(
    @Query('client_id') @Required() client_id: string,
    @Query('client_secret') @Required() client_secret: string,
    @Required()
    @Header('Authorization')
    authorization: string
  ) {
    const token = authorization.split('Bearer ')[1];
    if (!token) {
      throw getResponseError(ResponseErrorType.INVALID_TOKEN, 'invalid_token!');
    }

    const client = await prismaClient.client.findUnique({
      where: {
        client_id: client_id,
      },
    });
    // 判断是否存在客户端
    if (!client) {
      throw getResponseError(
        ResponseErrorType.INVALID_CLIENT,
        'unknown client!',
        401
      );
    }
    // 判断client_secret是否正确
    if (client.client_secret !== client_secret) {
      throw getResponseError(
        ResponseErrorType.INVALID_CLIENT,
        'Client secret is not correct!',
        401
      );
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
    if (!info || !info.user_id || info.client_id !== client_id) {
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
      roles: true,
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

import {
  Controller,
  Required,
  Post,
  Body,
  Session,
  ResponseError,
} from 'wittyna';

import { prismaClient } from '../../index.mjs';
import { sha256 } from '../../utils/encrypt.mjs';

// todo
@Controller('login')
export class LoginController {
  @Post()
  async login(
    @Body('username') @Required() username: string,
    @Body('password') @Required() password: string,
    @Session() session: any
  ) {
    const user = await prismaClient.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      throw new ResponseError({
        error: 'invalid_user',
        error_description: 'user not found',
      });
    }
    // 暂时数据库密码不加密
    if (user.password !== sha256(password) && user.password !== password) {
      throw new ResponseError({
        error: 'invalid_password',
        error_description: 'password is not correct',
      });
    }
    if (!session.client_id || !session.redirect_uri) {
      // todo 重定向到默认客户端
      throw new ResponseError({
        error: 'No authorization client',
        error_description: 'No authorization client',
      });
    }
    session.user_id = user.id;
    return {
      redirect_uri: session.redirect_uri,
    };
  }
}

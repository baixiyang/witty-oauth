import {
  Controller,
  Get,
  ParamRequired,
  Query,
  ResponseError,
} from 'witty-koa';
import { prismaClient, redisClient } from '../../../index.mjs';
import { CodeChallengeMethod, ResponseErrorType, ResponseType } from '../type.mjs';
import { ClientScope, GrantType } from '@prisma/client';
import { Context } from 'koa';
import { remove } from 'lodash-es';
import config from '../../../config.mjs';

@Controller('/auth')
export class AuthController {
  // 该接口在oauth2.1中规定只用于授权码模式
  @Get('/authorize')
  async authorize(
    @Query('response_type') @ParamRequired() response_type: string,
    @Query('client_id') @ParamRequired() client_id: string,
    @Query('code_challenge') @ParamRequired() code_challenge: string,
    @Query('code_challenge_method')
    code_challenge_method = CodeChallengeMethod.s256,
    @Query('redirect_uri') redirect_uri: string,
    @Query('scope') scope: string,
    @Query('state') state: string,
    ctx: Context
  ) {
    const client = await prismaClient.client.findUnique({
      where: {
        client_id: client_id,
      },
    });
    // 判断是否存在客户端
    if (!client) {
      throw new ResponseError({
        error: ResponseErrorType.UNREGISTERED_CLIENT,
        error_description: 'Client is not registered!',
        iss: config.iss,
      });
    }

    // 判断是否为code 授权模式
    if (response_type !== ResponseType.code) {
      throw new ResponseError({
        error: ResponseErrorType.UNSUPPORTED_CHALLENGE_METHOD,
        error_description: 'response_type is not supported!',
        iss: config.iss,
      });
    }
    // 判断客户端是否支持code授权模式
    if (
      response_type === ResponseType.code &&
      !client.grantTypes.includes(GrantType.authorization_code)
    ) {
      throw new ResponseError({
        error: ResponseErrorType.UNAUTHORIZED_CLIENT,
        error_description: 'Client is not allowed to use authorization_code!',
        iss: config.iss,
      });
    }
    // 判断是否支持code_challenge_method
    if (!CodeChallengeMethod[code_challenge_method as CodeChallengeMethod]) {
      throw new ResponseError({
        error: ResponseErrorType.UNSUPPORTED_RESPONSE_TYPE,
        error_description: 'code_challenge_method is not supported!',
        iss: config.iss,
      });
    }
    // 判断redirect_uri是否合法
    if (redirect_uri) {
      const clientRedirectUris = client.redirectUris.map((uri) => {
        try {
          return new URL(uri);
        } catch (e) {
          return null;
        }
      });
      remove(clientRedirectUris, (item) => !item);
      let redirectRri: URL;
      try {
        redirectRri = new URL(redirect_uri);
      } catch (error) {
        throw new ResponseError({
          error: ResponseErrorType.INVALID_REDIRECT_URI,
          error_description: 'redirect_uri is invalid!',
          iss: config.iss,
        });
      }
      if (
        !clientRedirectUris.some((clientRedirectUri) => {
          return (
            clientRedirectUri!.origin === redirectRri.origin &&
            clientRedirectUri!.pathname === redirectRri.pathname
          );
        })
      ) {
        throw new ResponseError({
          error: ResponseErrorType.INVALID_REDIRECT_URI,
          error_description: 'redirect_uri is not registered!',
          iss: config.iss,
        });
      }
    }
    // 判断scope是否合法
    if (
      scope &&
      scope
        .split(' ')
        .some((item) => !client.scopes.includes(item as ClientScope))
    ) {
      throw new ResponseError({
        error: ResponseErrorType.INVALID_SCOPE,
        error_description: 'scope is not registered!',
        iss: config.iss,
      });
    }
    // 生成授权码code的逻辑
    redirect_uri = redirect_uri || client.redirectUris[0]
    const code = Math.random().toString(36).slice(2);
    const ttl = config.authorizationCodeLifeTime;
    const key = `code:${code}`;
    await redisClient.setex(
      key,
      ttl,
      JSON.stringify({
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
      })
    );
    // 重定向到客户端
    const redirectUri = new URL(redirect_uri );
    redirectUri.searchParams.set('code', code);
    if(state) {
      redirectUri.searchParams.set('state', state);
    }
    redirectUri.searchParams.set('iss', config.iss);
    ctx.redirect(redirectUri.href);
  }
}

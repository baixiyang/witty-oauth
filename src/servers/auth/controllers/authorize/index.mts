import { Controller, Get, Required, Query, Session } from 'wittyna';
import { prismaClient, redisClient } from '../../index.mjs';
import {
  CodeChallengeMethod,
  ResponseErrorType,
  ResponseType,
} from '../../type.mjs';
import { Scope, GrantType } from '@prisma/client';
import { Context } from 'koa';
import { remove } from 'lodash-es';
import { CONFIG } from '../../../../config.mjs';
import { getResponseError } from '../../utils/error.mjs';

@Controller('authorize')
export class AuthController {
  // 该接口在oauth2.1中规定只用于授权码模式,
  // 由于在SSO场景中不太适用PKCE，暂时对是否 PKCE 不做限制，按oauth2.1标准处理是必须要 PKCE 的
  @Get()
  async authorize(
    @Query('response_type') @Required() response_type: string,
    @Query('client_id') @Required() client_id: string,
    @Query('code_challenge') code_challenge: string,
    @Query('code_challenge_method')
    code_challenge_method = CodeChallengeMethod.plain,
    @Query('redirect_uri') redirect_uri: string | undefined,
    @Query('scope') scope: string | undefined,
    @Query('state') state: string | undefined,
    @Session('user_id') user_id: string | undefined,
    ctx: Context
  ) {
    // mock login
    // user_id = 'admin';
    const client = await prismaClient.client.findUnique({
      where: {
        client_id: client_id,
      },
    });
    // 判断是否存在客户端
    if (!client) {
      throw getResponseError(
        ResponseErrorType.INVALID_CLIENT,
        'unknown client'
      );
    }

    // 判断是否为code 授权模式
    if (response_type !== ResponseType.code) {
      throw getResponseError(
        ResponseErrorType.UNSUPPORTED_RESPONSE_TYPE,
        'response_type is not supported!'
      );
    }
    // 判断客户端是否支持code授权模式
    if (
      response_type === ResponseType.code &&
      !client.grant_types.includes(GrantType.authorization_code)
    ) {
      throw getResponseError(
        ResponseErrorType.UNAUTHORIZED_CLIENT,
        'The client is not authorized to request an authorization code using this method!'
      );
    }
    // 判断是否支持code_challenge_method
    if (!CodeChallengeMethod[code_challenge_method as CodeChallengeMethod]) {
      throw getResponseError(
        ResponseErrorType.INVALID_REQUEST,
        'invalid code_challenge_method'
      );
    }
    // 判断redirect_uri是否合法
    if (redirect_uri) {
      const clientRedirectUris = client.redirect_uris.map((uri) => {
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
        throw getResponseError(
          ResponseErrorType.INVALID_REDIRECT_URI,
          'redirect_uri is invalid!'
        );
      }
      if (
        !clientRedirectUris.some((clientRedirectUri) => {
          return (
            clientRedirectUri!.origin === redirectRri.origin &&
            clientRedirectUri!.pathname === redirectRri.pathname
          );
        })
      ) {
        throw getResponseError(
          ResponseErrorType.INVALID_REDIRECT_URI,
          'redirect_uri does not match the client!'
        );
      }
    }
    // 判断scope是否合法
    if (
      scope &&
      scope.split(' ').some((item) => !client.scopes.includes(item as Scope))
    ) {
      throw getResponseError(
        ResponseErrorType.INVALID_SCOPE,
        'scope beyond range!'
      );
    }
    redirect_uri = redirect_uri || client.redirect_uris[0];
    // 判断用户是否登录
    if (!user_id) {
      ctx.redirect(
        `/auth/login?redirect_uri=${encodeURIComponent(
          ctx.request.originalUrl
        )}&client_id=${encodeURIComponent(
          client_id
        )}&scope=${encodeURIComponent(scope || '')}`
      );
      return;
    }

    // 生成授权码code的逻辑
    const code = Math.random().toString(36).slice(2);
    const ttl = CONFIG.authorizationCodeLifeTime;
    const key = `auth:code:${code}`;
    await redisClient.setex(
      key,
      ttl,
      JSON.stringify({
        user_id,
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
      })
    );
    // 重定向到客户端
    const redirectUri = new URL(redirect_uri);
    redirectUri.searchParams.set('code', code);
    if (state) {
      redirectUri.searchParams.set('state', state);
    }
    redirectUri.searchParams.set('iss', CONFIG.authIss);
    ctx.redirect(redirectUri.href);
  }
}

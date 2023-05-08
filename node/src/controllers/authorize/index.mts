import { Controller, Get, Required, Query, Session } from 'wittyna';
import { prismaClient, redisClient } from '../../index.mjs';
import {
  CodeChallengeMethod,
  ResponseErrorType,
  ResponseType,
} from '../../type.mjs';
import { GrantType } from '@prisma/client';
import { Context } from 'koa';
import { remove } from 'lodash-es';
import { CONFIG } from '../../config.mjs';
import { getResponseError } from '../../utils/error.mjs';

@Controller('authorize')
export class AuthController {
  // 在oauth2.1中规定: 授权接口只能用授权码模式授权,
  @Get()
  async authorize(
    @Query('response_type') @Required() responseType: string,
    @Query('client_id') @Required() clientId: string,
    @Query('code_challenge') @Required() codeChallenge: string,
    @Query('code_challenge_method')
    codeChallengeMethod = CodeChallengeMethod.plain,
    @Query('redirect_uri') redirectUri: string | undefined,
    @Query('scope') scope: string | undefined,
    @Query('state') state: string | undefined,
    @Session('userId') userId: string | undefined,
    @Session() session: any,
    ctx: Context
  ) {
    // mock login
    // userId = 'admin';
    const client = await prismaClient.client.findUnique({
      where: {
        id: clientId,
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
    if (responseType !== ResponseType.code) {
      throw getResponseError(
        ResponseErrorType.UNSUPPORTED_RESPONSE_TYPE,
        'response_type is not supported!'
      );
    }
    // 判断客户端是否支持code授权模式
    if (
      responseType === ResponseType.code &&
      !client.grantTypes.includes(GrantType.authorization_code)
    ) {
      throw getResponseError(
        ResponseErrorType.UNAUTHORIZED_CLIENT,
        'The client is not authorized to request an authorization code using this method!'
      );
    }
    // 判断是否支持code_challenge_method
    if (!CodeChallengeMethod[codeChallengeMethod as CodeChallengeMethod]) {
      throw getResponseError(
        ResponseErrorType.INVALID_REQUEST,
        'invalid code_challenge_method'
      );
    }
    // 判断redirect_uri是否合法
    if (redirectUri) {
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
        redirectRri = new URL(redirectUri);
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
    redirectUri = redirectUri || client.redirectUris[0];
    // 如何用户没有登陆或者没有确认都会跳转到登陆页面。// todo 三方应用需要确认。
    if (!userId) {
      session.redirectUri = ctx.request.originalUrl;
      session.clientId = clientId;
      session.scope = scope;
      ctx.redirect(`/`);
      return;
    }
    const client2User = await prismaClient.client2User.findUnique({
      where: {
        clientId_userId: { userId, clientId },
      },
      select: {
        user: true,
        expiresAt: true,
      },
    });
    if (
      !client2User ||
      (client2User.expiresAt && client2User.expiresAt.getTime() < Date.now())
    ) {
      session.userId = undefined;
      session.redirectUri = ctx.request.originalUrl;
      session.clientId = clientId;
      session.scope = scope;
      return `<html><body><p>You do not have permission to access this client. Please <a href="/">login again</a></p></body></html>`;
    }

    // 生成授权码code的逻辑
    const code = Math.random().toString(36).slice(2);
    const ttl = CONFIG.authorizationCodeLifeTime;
    const key = `auth:code:${code}`;
    await redisClient.setex(
      key,
      ttl,
      JSON.stringify({
        userId,
        clientId,
        redirectUri,
        scope,
        state,
        codeChallenge,
        codeChallengeMethod,
      })
    );
    // 重定向到客户端
    const redirectUri_ = new URL(redirectUri!);
    redirectUri_.searchParams.set('code', code);
    if (state) {
      redirectUri_.searchParams.set('state', state);
    }
    redirectUri_.searchParams.set('iss', CONFIG.iss);
    ctx.redirect(redirectUri_.href);
  }
}

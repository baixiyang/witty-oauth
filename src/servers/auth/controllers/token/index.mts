import { Controller, Get, Required, Query } from 'wittyna';
import { prismaClient, redisClient } from '../../index.mjs';
import { CodeChallengeMethod, ResponseErrorType } from '../../type.mjs';
import { Scope, GrantType } from '@prisma/client';
import { Context } from 'koa';
import { CONFIG } from '../../../../config.mjs';
import { getResponseError } from '../../utils/error.mjs';
import { genNormalJwt } from '../../utils/jwt.mjs';
import { sha256 } from '../../../../utils/encrypt.mjs';
import {
  getRefreshTokenInfo,
  setAccessToken,
  setRefreshToken,
} from '../../utils/token.mjs';

@Controller('token')
export class TokenController {
  // 该接口在oauth2.1中规定只用于授权码模式
  @Get()
  async getToken(
    @Query('client_id') @Required() client_id: string,
    @Query('client_secret') @Required() client_secret: string,
    @Query('grant_type') @Required() grant_type: string,
    @Query('code') code: string | undefined,
    @Query('redirect_uri') redirect_uri: string | undefined,
    @Query('code_verifier') code_verifier: string | undefined,
    @Query('scope') scope: string | undefined,
    @Query('refresh_token') refresh_token: string | undefined,
    ctx: Context
  ) {
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
    // 判断grant_type是否合法
    if (!client.grant_types.includes(grant_type as GrantType)) {
      throw getResponseError(
        ResponseErrorType.UNSUPPORTED_GRANT_TYPE,
        'grant_type is not supported!'
      );
    }
    switch (grant_type) {
      case GrantType.authorization_code: {
        if (!code) {
          throw getResponseError(
            ResponseErrorType.INVALID_REQUEST,
            'code is required!'
          );
        }
        if (!code_verifier) {
          throw getResponseError(
            ResponseErrorType.INVALID_REQUEST,
            'code_verifier is required!'
          );
        }
        const codeInfo = await redisClient.get(`auth:code:${code}`);
        if (!codeInfo) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'code is invalid!'
          );
        }
        const {
          user_id,
          client_id,
          scope: scope_,
          redirect_uri: redirect_uri_,
          code_challenge,
          code_challenge_method,
        } = JSON.parse(codeInfo);
        // 判断redirect_uri是否合法
        if (redirect_uri !== redirect_uri_) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'redirect_uri is invalid!'
          );
        }
        if (client_id !== client.client_id) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'code is invalid!'
          );
        }
        // 不必管code_challenge_method是否合法，因为在生成code时已经判断过了，这里只需要判断code_challenge是否正确
        if (
          (code_challenge_method === CodeChallengeMethod.s256 &&
            code_challenge !== sha256(code_verifier)) ||
          (code_challenge_method === CodeChallengeMethod.plain &&
            code_challenge !== code_verifier)
        ) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'code_verifier is invalid!'
          );
        }
        const accessToken = await setAccessToken({
          client_id,
          user_id,
          scope,
        });
        let refreshToken;
        if (client.grant_types.includes(GrantType.refresh_token)) {
          refreshToken = await setRefreshToken({
            client_id,
            user_id,
            scope,
          });
        }
        return {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: CONFIG.accessTokenLifeTime,
          id_token: genNormalJwt({ scope, client_id: client.id, user_id }),
          refresh_token: refreshToken,
          scope: scope_,
        };
      }
      case GrantType.client_credentials: {
        const accessToken = await setAccessToken({ client_id, scope });
        let refreshToken;
        if (client.grant_types.includes(GrantType.refresh_token)) {
          refreshToken = await setRefreshToken({ client_id, scope });
        }
        return {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: CONFIG.accessTokenLifeTime,
          refresh_token: refreshToken,
          id_token: genNormalJwt({ scope, client_id: client.client_id }),
          scope: scope,
        };
      }
      case GrantType.refresh_token: {
        const info = await getRefreshTokenInfo(refresh_token!);
        if (!info || info.client_id !== client_id) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'refresh_token is invalid!'
          );
        }
        const accessToken = await setAccessToken({
          client_id: info.client_id,
          user_id: info.user_id,
          scope: info.scope,
        });
        return {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: CONFIG.accessTokenLifeTime,
          id_token: genNormalJwt({
            client_id: client.client_id,
            user_id: info.user_id,
            scope: info.scope,
          }),
          scope: scope,
          refresh_token: refresh_token,
        };
      }
    }
  }
}

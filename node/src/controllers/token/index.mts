import {
  Controller,
  Required,
  Query,
  Post,
  Header,
  Reg,
  ResponseError,
} from 'wittyna';
import { prismaClient, redisClient } from '../../index.mjs';
import { CodeChallengeMethod, ResponseErrorType } from '../../type.mjs';
import { GrantType } from '@prisma/client';
import { CONFIG } from '../../config.mjs';
import { getResponseError } from '../../utils/error.mjs';
import { genNormalJwt } from '../../utils/jwt.mjs';
import { sha256 } from '../../utils/encrypt.mjs';
import {
  ACCESS_TOKEN_REG,
  getAccessTokenInfo,
  getRefreshTokenInfo,
  setAccessToken,
  setRefreshToken,
} from '../../utils/token.mjs';

@Controller('token')
export class TokenController {
  // 该接口在oauth2.1中规定只用于授权码模式
  @Post()
  async getToken(
    @Query('client_id') @Required() clientId: string,
    @Query('client_secret') @Required() clientSecret: string,
    @Query('grant_type') @Required() grantType: GrantType,
    @Query('code') code: string | undefined,
    @Query('code_verifier') codeVerifier: string | undefined,
    @Query('refresh_token') refreshToken: string | undefined
  ) {
    const client = await prismaClient.client.findUnique({
      where: {
        id: clientId,
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
    if (client.secret !== clientSecret) {
      throw getResponseError(
        ResponseErrorType.INVALID_CLIENT,
        'Client secret is not correct!',
        401
      );
    }
    // 判断grant_type是否合法
    if (!client.grantTypes.includes(grantType)) {
      throw getResponseError(
        ResponseErrorType.UNSUPPORTED_GRANT_TYPE,
        'grant_type is not supported!'
      );
    }
    switch (grantType) {
      case GrantType.authorization_code: {
        if (!code) {
          throw getResponseError(
            ResponseErrorType.INVALID_REQUEST,
            'code is required!'
          );
        }

        const codeInfo = await redisClient.get(`auth:code:${code}`);
        await redisClient.del(`auth:code:${code}`);
        if (!codeInfo) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'code is invalid!'
          );
        }
        const { userId, clientId, scope, codeChallenge, codeChallengeMethod } =
          JSON.parse(codeInfo);
        if (clientId !== client.id) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'code is invalid!'
          );
        }
        if (!codeVerifier && codeChallenge) {
          throw getResponseError(
            ResponseErrorType.INVALID_REQUEST,
            'code_verifier is required!'
          );
        }
        if (codeChallenge) {
          if (
            codeChallengeMethod === CodeChallengeMethod.s256 ||
            codeChallengeMethod === CodeChallengeMethod.plain
          ) {
            if (
              (codeChallengeMethod === CodeChallengeMethod.s256 &&
                codeChallenge !== sha256(codeVerifier!)) ||
              (codeChallengeMethod === CodeChallengeMethod.plain &&
                codeChallenge !== codeVerifier)
            ) {
              throw getResponseError(
                ResponseErrorType.INVALID_GRANT,
                'code_verifier is invalid!'
              );
            }
          } else {
            throw getResponseError(
              ResponseErrorType.INVALID_GRANT,
              'code_verifier is invalid!'
            );
          }
        }

        const accessToken = await setAccessToken({
          clientId,
          userId,
          scope,
        });
        let refreshToken;
        if (client.grantTypes.includes(GrantType.refresh_token)) {
          refreshToken = await setRefreshToken({
            clientId,
            userId,
            scope,
          });
        }
        return {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: CONFIG.accessTokenLifeTime,
          id_token: genNormalJwt({
            scope,
            clientId: client.id,
            userId,
          }),
          refresh_token: refreshToken,
          scope,
        };
      }
      case GrantType.client_credentials: {
        const accessToken = await setAccessToken({ clientId });
        let refreshToken;
        if (client.grantTypes.includes(GrantType.refresh_token)) {
          refreshToken = await setRefreshToken({ clientId });
        }
        return {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: CONFIG.accessTokenLifeTime,
          refresh_token: refreshToken,
          id_token: genNormalJwt({ clientId: client.id }),
        };
      }
      case GrantType.refresh_token: {
        const info = await getRefreshTokenInfo(refreshToken!);

        if (!info || info.clientId !== clientId) {
          throw getResponseError(
            ResponseErrorType.INVALID_GRANT,
            'refresh_token is invalid!'
          );
        }
        const client2User = await prismaClient.client2User.findUnique({
          where: {
            clientId_userId: { userId: info.userId, clientId },
          },
          select: {
            user: true,
            expiresAt: true,
          },
        });
        if (
          !client2User ||
          (client2User.expiresAt &&
            client2User.expiresAt.getTime() < Date.now())
        ) {
          throw new ResponseError({
            error: 'user permission of client is expired !',
          });
        }

        const accessToken = await setAccessToken({
          clientId: info.clientId,
          userId: info.userId,
          scope: info.scope,
        });
        return {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: CONFIG.accessTokenLifeTime,
          id_token: genNormalJwt({
            clientId: client.id,
            userId: info.userId,
            scope: info.scope,
          }),
          scope: info.scope,
          refresh_token: refreshToken,
        };
      }
    }
  }
  @Post('info')
  async validateToken(
    @Header('access_token')
    @Required()
    @Reg(ACCESS_TOKEN_REG)
    authorization: string
  ) {
    const info = await getAccessTokenInfo(authorization);
    if (!info) {
      throw getResponseError(
        ResponseErrorType.INVALID_TOKEN,
        'Token is illegal or expired',
        401
      );
    }
    return info;
  }
}

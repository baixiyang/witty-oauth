import {
  Controller,
  Get,
  ParamRequired,
  Query,
  ResponseError,
} from 'witty-koa';
import { prismaClient } from '../../index';
import { CodeChallengeMethod, ResponseErrorType, ResponseType } from './type';
import { ClientScope, GrantType } from '@prisma/client';

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
    @Query('state') state: string
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
      });
    }

    // 判断是否为code 授权模式
    if (response_type !== ResponseType.code) {
      throw new ResponseError({
        error: ResponseErrorType.UNSUPPORTED_CHALLENGE_METHOD,
        error_description: 'response_type is not supported!',
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
      });
    }
    // 判断是否支持code_challenge_method
    if (!CodeChallengeMethod[code_challenge_method as CodeChallengeMethod]) {
      throw new ResponseError({
        error: ResponseErrorType.UNSUPPORTED_RESPONSE_TYPE,
        error_description: 'code_challenge_method is not supported!',
      });
    }
    // 判断redirect_uri是否合法
    if (redirect_uri && !client.redirectUris.includes(redirect_uri)) {
      const clientRedirectUris = client.redirectUris.map((uri) => {
        return new URL(uri);
      });
      const redirectRri = new URL(redirect_uri);
      if (
        !clientRedirectUris.some((clientRedirectUri) => {
          return (
            clientRedirectUri.origin === redirectRri.origin &&
            clientRedirectUri.pathname === redirectRri.pathname
          );
        })
      ) {
        throw new ResponseError({
          error: ResponseErrorType.INVALID_REDIRECT_URI,
          error_description: 'redirect_uri is not registered!',
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
      });
    }
  }
}

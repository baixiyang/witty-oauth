import {
  Controller,
  Get,
  ParamRequired,
  Query,
  ResponseError,
} from 'witty-koa';
import { prismaClient } from '../../index';
import { ResponseErrorType, ResponseType } from './type';
import { GrantTypes } from '@prisma/client';

@Controller()
export class AuthController {
  @Get('/authorize')
  async authorize(
    @Query('response_type') @ParamRequired() response_type: string,
    @Query('client_id') @ParamRequired() client_id: string,
    @Query('code_challenge') @ParamRequired() code_challenge: string,
    @Query('code_challenge_method')
    code_challenge_method = 's256',
    @Query('redirect_uri') redirect_uri: string,
    @Query('scope') scope: string,
    @Query('state') state: string
  ) {
    const client = await prismaClient.client.findUnique({
      where: {
        clientId: client_id,
      },
    });
    if (!client) {
      throw new ResponseError({
        error: ResponseErrorType.UNAUTHORIZED_CLIENT,
        error_description: 'Client is not registered!',
      });
    }
    if (!client.grantTypes.includes(GrantTypes.authorization_code)) {
      throw new ResponseError({
        error: ResponseErrorType.UNAUTHORIZED_CLIENT,
        error_description: 'Client is not allowed to use authorization_code!',
      });
    }
    if (response_type !== ResponseType.CODE) {
      throw new ResponseError({
        error: ResponseErrorType.UNSUPPORTED_RESPONSE_TYPE,
        error_description: 'response_type is not supported!',
      });
    }

    // todo redirect_uri scope state
  }
}

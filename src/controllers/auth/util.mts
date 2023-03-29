import { ResponseErrorType } from './type.mjs';
import config from '../../config.mjs';
import { ResponseError } from 'witty-koa';
export function getResponseError(
  error: ResponseErrorType,
  error_description: string,
  status = 400
) {
  return new ResponseError({
    error,
    error_description,
    iss: config.iss,
    status,
  });
}

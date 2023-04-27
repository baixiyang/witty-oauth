import { ResponseErrorType } from '../type.mjs';
import { CONFIG } from '../config.mjs';
import { ResponseError } from 'wittyna';
export function getResponseError(
  error: ResponseErrorType,
  error_description: string,
  status = 400
) {
  return new ResponseError({
    error,
    error_description,
    iss: CONFIG.iss,
    status,
  });
}

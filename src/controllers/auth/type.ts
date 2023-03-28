// 授权接口的返回值类型
export enum ResponseType {
  code = 'code',
}

export enum CodeChallengeMethod {
  s256 = 's256',
}

export enum ResponseErrorType {
  // 请求参数不合法或者必填参数未传
  INVALID_REQUEST = 'invalid_request',
  // 客户端未注册
  UNREGISTERED_CLIENT = 'unregistered_client',
  // 客户端不支持授权
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  // 重定向地址未注册
  INVALID_REDIRECT_URI = 'invalid_redirect_uri',
  // 用户或授权服务器拒绝授权
  ACCESS_DENIED = 'access_denied',
  // 不支持当前请求的response_type
  UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type',
  // 不支持当前请求的code_challenge_method
  UNSUPPORTED_CHALLENGE_METHOD = 'unsupported_challenge_method',
  // 当前请求的scope格式非法
  INVALID_SCOPE = 'invalid_scope',
  // 当前请求500错误
  SERVER_ERROR = 'server_error',
  // 503
  TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',
}

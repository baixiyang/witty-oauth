// 授权类型
export enum GrantType {
  // 客户端凭据授权
  CLIENT_CREDENTIALS = 'client_credentials',
  // 资源所有者凭据授权,不建议使用,oauth2.1 已经删除
  PASSWORD = 'password',
  // 刷新令牌授权，通过刷新令牌重新获取token
  REFRESH_TOKEN = 'refresh_token',
  // 授权码授权
  AUTHORIZATION_CODE = 'authorization_code',
  // 隐式授权,不建议使用,oauth2.1 已经删除
  IMPLICIT = 'implicit',
}

// 认证接口的返回值类型，根据授权方式会有不同的返回值类型
export enum ResponseType {
  CODE = 'code',
  TOKEN = 'token',
}

// 验证 token 有效性时候的 token 类型
enum TokenType {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

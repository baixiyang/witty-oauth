import jwt from 'jsonwebtoken';
import { CONFIG } from '../../../config.mjs';
export function genNormalJwt({
  client_id,
  user_id,
  scope,
}: {
  client_id: string;
  user_id?: string;
  scope?: string;
}) {
  return jwt.sign({ user_id, client_id, scope }, CONFIG.jwtPrivateKey, {
    issuer: CONFIG.authIss,
    subject: user_id || client_id,
    audience: user_id ? client_id : '',
    expiresIn: CONFIG.jwtLifeTime,
    algorithm: 'RS256',
  });
}

export function getJwtInfo(jwt_: string): JwtPayload | undefined {
  try {
    const res = jwt.verify(jwt_, CONFIG.jwtPublicKey) as JwtPayload;
    if (res.exp * 1000 < Date.now()) {
      return undefined;
    }
    return res;
  } catch (e) {
    return undefined;
  }
}

export function isJwt(jwt: string) {
  return jwt.indexOf('.') > 1;
}
interface JwtPayload extends BaseJwtPayload {
  user_id: string;
  client_id: string;
  scope: string;
}
interface BaseJwtPayload {
  // jwt发布者的标识符
  iss: string;
  // 实体的标识符，通常位userId，如果存粹是客户端申请的jwt，那就是clientId。
  sub: string;
  // JWT 所代表的实体的预期接收者, 通常情况下，"aud" 声明的值是一个 URL 或一个应用程序的名称，用于标识该 JWT 应该被哪个系统或应用程序使用。
  // todo 暂时只支持clientId，表示该jwt只能被clientId所代表的客户端使用。
  aud: string;
  // 过期时间 毫秒数
  exp: number;
  // jwt发布的时间
  iat: number;
}

import { redisClient } from '../index.mjs';
import { CONFIG } from '../config.mjs';
import { v4 as uuid } from 'uuid';
enum RedisKeyPrefix {
  ACCESS_TOKEN_ARR_PREFIX = 'auth:access_token_arr:',
  ACCESS_TOKEN_PREFIX = 'auth:access_token:',
  REFRESH_TOKEN_ARR_PREFIX = 'auth:refresh_token_arr:',
  REFRESH_TOKEN_PREFIX = 'auth:refresh_token:',
}
export async function setAccessToken({
  userId,
  clientId,
  scope,
}: {
  clientId: string;
  userId?: string;
  scope?: string;
}): Promise<string> {
  const token = uuid();
  await redisClient.sadd(
    `${RedisKeyPrefix.ACCESS_TOKEN_ARR_PREFIX}${userId || clientId}`,
    token
  );
  await redisClient.expire(
    `${RedisKeyPrefix.ACCESS_TOKEN_ARR_PREFIX}${userId || clientId}`,
    CONFIG.accessTokenLifeTime
  );
  await redisClient.setex(
    `${RedisKeyPrefix.ACCESS_TOKEN_PREFIX}${token}`,
    CONFIG.accessTokenLifeTime,
    JSON.stringify({ userId, clientId, scope })
  );
  return token;
}
export async function setRefreshToken({
  userId,
  clientId,
  scope,
}: {
  clientId: string;
  userId?: string;
  scope?: string;
}): Promise<string> {
  const token = uuid();
  await redisClient.sadd(
    `${RedisKeyPrefix.REFRESH_TOKEN_ARR_PREFIX}${userId || clientId}`,
    token
  );
  await redisClient.expire(
    `${RedisKeyPrefix.REFRESH_TOKEN_ARR_PREFIX}${userId || clientId}`,
    CONFIG.refreshTokenLifeTime
  );
  await redisClient.setex(
    `${RedisKeyPrefix.REFRESH_TOKEN_PREFIX}${token}`,
    CONFIG.refreshTokenLifeTime,
    JSON.stringify({ userId, clientId, scope })
  );
  return token;
}

export async function getRefreshTokenInfo(
  refreshToken: string
): Promise<{ userId: string; clientId: string; scope: string } | undefined> {
  const string = await redisClient.get(
    `${RedisKeyPrefix.REFRESH_TOKEN_PREFIX}${refreshToken}`
  );
  if (string) {
    return JSON.parse(string);
  }
}

export async function getAccessTokenInfo(
  accessToken: string
): Promise<{ userId: string; clientId: string; scope: string } | undefined> {
  if (accessToken.indexOf('Bearer ') === 0) {
    accessToken = accessToken.slice(7);
  }
  const string = await redisClient.get(
    `${RedisKeyPrefix.ACCESS_TOKEN_PREFIX}${accessToken}`
  );
  if (string) {
    return JSON.parse(string);
  }
}

export async function clearAllTokenOfUser(userId: string) {
  for (const [tokenArrPrefix, tokenPrefix] of [
    [
      RedisKeyPrefix.ACCESS_TOKEN_ARR_PREFIX,
      RedisKeyPrefix.ACCESS_TOKEN_PREFIX,
    ],
    [
      RedisKeyPrefix.REFRESH_TOKEN_ARR_PREFIX,
      RedisKeyPrefix.REFRESH_TOKEN_PREFIX,
    ],
  ]) {
    const tokens = await redisClient.smembers(`${tokenArrPrefix}${userId}`);
    if (tokens) {
      const promiseArr = tokens.map((token) =>
        redisClient.del(`${tokenPrefix}${token}`)
      );
      promiseArr.push(redisClient.del(`${tokenArrPrefix}${userId}`));
      await Promise.all(promiseArr);
    }
  }
}

export const ACCESS_TOKEN_REG =
  /^Bearer [a-f0-9]{8}\-([a-f0-9]{4}\-){3}[a-f0-9]{12}$/;

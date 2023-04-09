import { redisClient } from '../index.mjs';
import { CONFIG } from '../../../config.mjs';
import { v4 as uuid } from 'uuid';
enum RedisKeyPrefix {
  ACCESS_TOKEN_ARR_PREFIX = 'auth:access_token_arr:',
  ACCESS_TOKEN_PREFIX = 'auth:access_token:',
  REFRESH_TOKEN_ARR_PREFIX = 'auth:refresh_token_arr:',
  REFRESH_TOKEN_PREFIX = 'auth:refresh_token:',
}
export async function setAccessToken({
  user_id,
  client_id,
  scope,
}: {
  client_id: string;
  user_id?: string;
  scope?: string;
}): Promise<string> {
  const token = uuid();
  await redisClient.sadd(
    `${RedisKeyPrefix.ACCESS_TOKEN_ARR_PREFIX}${user_id || client_id}`,
    token
  );
  await redisClient.expire(
    `${RedisKeyPrefix.ACCESS_TOKEN_ARR_PREFIX}${user_id || client_id}`,
    CONFIG.accessTokenLifeTime
  );
  await redisClient.setex(
    `${RedisKeyPrefix.ACCESS_TOKEN_PREFIX}${token}`,
    CONFIG.accessTokenLifeTime,
    JSON.stringify({ user_id, client_id, scope })
  );
  return token;
}
export async function setRefreshToken({
  user_id,
  client_id,
  scope,
}: {
  client_id: string;
  user_id?: string;
  scope?: string;
}): Promise<string> {
  const token = uuid();
  await redisClient.sadd(
    `${RedisKeyPrefix.REFRESH_TOKEN_ARR_PREFIX}${user_id || client_id}`,
    token
  );
  await redisClient.expire(
    `${RedisKeyPrefix.REFRESH_TOKEN_ARR_PREFIX}${user_id || client_id}`,
    CONFIG.refreshTokenLifeTime
  );
  await redisClient.setex(
    `${RedisKeyPrefix.REFRESH_TOKEN_PREFIX}${token}`,
    CONFIG.refreshTokenLifeTime,
    JSON.stringify({ user_id, client_id, scope })
  );
  return token;
}

export async function getRefreshTokenInfo(
  refresh_token: string
): Promise<{ user_id: string; client_id: string; scope: string } | undefined> {
  const string = await redisClient.get(
    `${RedisKeyPrefix.REFRESH_TOKEN_PREFIX}${refresh_token}`
  );
  if (string) {
    return JSON.parse(string);
  }
}

export async function getAccessTokenInfo(
  access_token: string
): Promise<{ user_id: string; client_id: string; scope: string } | undefined> {
  const string = await redisClient.get(
    `${RedisKeyPrefix.ACCESS_TOKEN_PREFIX}${access_token}`
  );
  if (string) {
    return JSON.parse(string);
  }
}

// todo 性能优化
export async function clearAllTokenOfUser(userId: string) {
  const access_tokens = await redisClient.get(
    `${RedisKeyPrefix.ACCESS_TOKEN_ARR_PREFIX}${userId}`
  );
  if (access_tokens) {
    await redisClient.del(`${RedisKeyPrefix.ACCESS_TOKEN_ARR_PREFIX}${userId}`);
    for (const access_token of access_tokens) {
      await redisClient.del(
        `${RedisKeyPrefix.ACCESS_TOKEN_PREFIX}${access_token}`
      );
    }
  }
}

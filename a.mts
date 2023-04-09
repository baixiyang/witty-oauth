import Redis from "ioredis";
import { CONFIG } from "./src/config.mjs";

export const redisClient = new Redis({
  host: CONFIG.redis.host,
  port: CONFIG.redis.port,
  db: CONFIG.redis.db,
});

await redisClient.sadd('auth:user:refresh_tokens:xx', '10', )
// await redisClient.sadd('auth:user:refresh_tokens:xx', '2', '3', '4')

console.log(await redisClient.sismember('auth:user:refresh_tokens:xx', '3'), '3333')
console.log(await redisClient.sismember('auth:user:refresh_tokens:xx', '4'), '4444')
console.log(await redisClient.sismember('auth:user:refresh_tokens:xx', '5'), '5555')
console.log(await redisClient.smembers('auth:user:refresh_tokens:xx'), 'all')

await redisClient.expire('auth:user:refresh_tokens:xx', 0)

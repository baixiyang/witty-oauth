import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
} from 'witty-koa';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers';
import { init } from './init.mjs';
import Redis from 'ioredis';
import config from './config.mjs';

export const prismaClient = new PrismaClient();
export const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: 1,
});
await init();

startServer({
  port: 5555,
  controllers: Object.values(controllers),
  middlewares: [
    sessionMiddleWare({
      redisOptions: {
        host: config.redis.host,
        port: config.redis.port,
        db: 0,
      },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
  options: {
    iss: config.iss,
  },
});

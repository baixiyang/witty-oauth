import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
} from 'witty-koa';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers';
import { init } from './init';
import Redis from 'ioredis';
import config from './config';

export const prismaClient = new PrismaClient();
export const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: 5555,
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
});

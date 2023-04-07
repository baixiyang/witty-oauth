import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
} from 'wittyna';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers';
import { init } from './init.mjs';
import Redis from 'ioredis';
import config from './config.mjs';

export const prismaClient = new PrismaClient();
export const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db,
});
await init();

startServer({
  port: 5555,
  controllers: Object.values(controllers),
  routerPrefix: '/auth',
  middlewares: [
    sessionMiddleWare({
      redisOptions: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
      },
      sessionOptions: {
        prefix: 'auth:sid:',
        ttl: config.sessionLeftTime ? config.sessionLeftTime * 1000 : undefined,
      },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
  options: {
    iss: config.iss,
  },
});

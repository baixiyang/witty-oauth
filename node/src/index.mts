import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
  staticMiddleWare,
} from 'wittyna';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers/index.mjs';
import { init } from './init.mjs';
import Redis from 'ioredis';
import { CONFIG } from './config.mjs';

export const prismaClient = new PrismaClient();
export const redisClient = new Redis({
  host: CONFIG.redis.host,
  port: CONFIG.redis.port,
  db: CONFIG.redis.db,
});
await init();
startServer({
  port: CONFIG.port,
  controllers: Object.values(controllers),
  routerPrefix: '/auth',
  middlewares: [
    staticMiddleWare({
      root: CONFIG.uiRoot,
      pathPrefix: '',
      ignorePathPrefix: '/auth',
    }),
    sessionMiddleWare({
      redisOptions: {
        host: CONFIG.redis.host,
        port: CONFIG.redis.port,
        db: CONFIG.redis.db,
      },
      sessionOptions: {
        prefix: 'auth:sid:',
        key: 'auth:sid',
        ttl: CONFIG.sessionLeftTime ? CONFIG.sessionLeftTime * 1000 : undefined,
      },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
  options: {
    iss: CONFIG.iss,
  },
});

import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
} from 'wittyna';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers/index.mjs';
import Redis from 'ioredis';
import { CONFIG } from '../../config.mjs';

export const prismaClient = new PrismaClient();

startServer({
  port: 5566,
  controllers: Object.values(controllers),
  routerPrefix: '/admin',
  middlewares: [
    sessionMiddleWare({
      redisOptions: {
        host: CONFIG.redis.host,
        port: CONFIG.redis.port,
        db: CONFIG.redis.db,
      },
      sessionOptions: {
        ttl: CONFIG.sessionLeftTime ? CONFIG.sessionLeftTime * 1000 : undefined,
      },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
  options: {
    iss: CONFIG.adminIss,
  },
});

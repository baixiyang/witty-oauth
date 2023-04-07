import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
} from 'wittyna';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers/index.mjs';
import Redis from 'ioredis';
import config from '../config.mjs';

export const prismaClient = new PrismaClient();

startServer({
  port: 5566,
  controllers: Object.values(controllers),
  routerPrefix: '/admin',
  middlewares: [
    sessionMiddleWare({
      redisOptions: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
      },
      sessionOptions: {
        ttl: config.sessionLeftTime ? config.sessionLeftTime * 1000 : undefined,
      },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
  options: {
    iss: config.adminIss,
  },
});

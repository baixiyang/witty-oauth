import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
} from 'witty-koa';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers';
import { init } from './init';
export const prismaClient = new PrismaClient();
await init();

startServer({
  port: 1111,
  controllers: Object.values(controllers),
  middlewares: [
    sessionMiddleWare({
      redisOptions: {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
});

import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
  staticMiddleWare,
  authMiddleWare,
} from 'wittyna';
import { PrismaClient } from '@prisma/client';
import * as controllers from './controllers/index.mjs';
import { CONFIG } from '../../config.mjs';

export const prismaClient = new PrismaClient();

startServer({
  port: 5566,
  controllers: Object.values(controllers),
  routerPrefix: '/admin',
  middlewares: [
    staticMiddleWare({
      root: CONFIG.adminStaticRoot,
      path: '/admin/ui',
    }),
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
    authMiddleWare({
      client_id: CONFIG.systemClient.client_id,
      client_secret: CONFIG.systemClient.client_secret,
      apiPrefix: `${CONFIG.adminIss}/admin`,
      uiUrl: `${CONFIG.adminIss}/admin/ui`,
      authServerOrigin: CONFIG.authIss,
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
  options: {
    iss: CONFIG.adminIss,
  },
});

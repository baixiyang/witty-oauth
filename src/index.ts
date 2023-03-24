import {
  bodyMiddleWare,
  responseMiddleWare,
  sessionMiddleWare,
  startServer,
} from 'witty-koa';
import { PrismaClient, Role, User } from '@prisma/client';
import { readFile } from 'fs/promises';
import { UserController } from './controllers';
const config: { systemAdmins: User[] } = JSON.parse(
  (await readFile(new URL('./config.json', import.meta.url))).toString()
);
export const prismaClient = new PrismaClient();

for (const admin of config.systemAdmins) {
  await prismaClient.user.upsert({
    where: { username: admin.username },
    update: {
      username: admin.username,
      password: admin.password,
      role: Role.SYSTEM_ADMIN,
    },
    create: {
      username: admin.username,
      password: admin.password,
      role: Role.SYSTEM_ADMIN,
    },
  });
}

startServer({
  port: 3000,
  controllers: [new UserController()],
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

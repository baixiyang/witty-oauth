import { prismaClient } from './index';
import { ClientType, UserRole } from '@prisma/client';
import sha256 from 'crypto-js/sha256';
import config from './config';

export async function init() {
  const systemClient = config.systemClient;
  const systemAdminUsers = config.systemAdminUsers;
  await prismaClient.$transaction([
    ...systemAdminUsers.map((user) =>
      prismaClient.user.upsert({
        where: {
          username: user.username,
        },
        create: {
          ...user,
          role: UserRole.SYSTEM_ADMIN,
          password: sha256(user.password).toString(),
        },
        update: {
          ...user,
          role: UserRole.SYSTEM_ADMIN,
          password: sha256(user.password).toString(),
        },
      })
    ),
    prismaClient.client.upsert({
      where: {
        clientId: systemClient.clientId,
      },
      create: {
        ...systemClient,
        clientSecret: sha256(systemClient.clientSecret).toString(),
        type: ClientType.SYSTEM,
      },
      update: {
        ...systemClient,
        clientSecret: sha256(systemClient.clientSecret).toString(),
        type: ClientType.SYSTEM,
      },
    }),
    prismaClient.client.update({
      where: {
        clientId: systemClient.clientId,
      },
      data: {
        users: {
          connect: systemAdminUsers.map((user) => ({
            username: user.username,
          })),
        },
      },
    }),
  ]);
}

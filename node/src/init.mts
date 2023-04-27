import { prismaClient } from './index.mjs';
import { ClientType, UserRole } from '@prisma/client';
import { CONFIG } from './config.mjs';
import { sha256 } from './utils/encrypt.mjs';

export async function init() {
  const systemClient = CONFIG.systemClient;
  const normalClients = CONFIG.normalClients;
  const systemAdminUsers = CONFIG.systemAdminUsers;
  await prismaClient.$transaction([
    ...systemAdminUsers.map((user) =>
      prismaClient.user.upsert({
        where: {
          username: user.username,
        },
        create: {
          ...user,
          roles: [UserRole.SYSTEM_ADMIN],
          password: sha256(user.password),
        },
        update: {
          ...user,
          roles: [UserRole.SYSTEM_ADMIN],
          password: sha256(user.password),
        },
      })
    ),
    prismaClient.client.upsert({
      where: {
        client_id: systemClient.client_id,
      },
      create: {
        ...systemClient,
        client_secret: systemClient.client_secret,
        type: ClientType.SYSTEM,
      },
      update: {
        ...systemClient,
        client_secret: systemClient.client_secret,
        type: ClientType.SYSTEM,
      },
    }),
    ...normalClients.map((normalClient) => {
      return prismaClient.client.upsert({
        where: {
          client_id: normalClient.client_id,
        },
        create: {
          ...normalClient,
          client_secret: normalClient.client_secret,
          type: ClientType.SYSTEM,
        },
        update: {
          ...normalClient,
          client_secret: normalClient.client_secret,
          type: ClientType.SYSTEM,
        },
      });
    }),
    prismaClient.client.update({
      where: {
        client_id: systemClient.client_id,
      },
      data: {
        users: {
          connect: systemAdminUsers.map((user) => ({
            username: user.username,
          })),
        },
      },
    }),
    ...normalClients.map((normalClient) => {
      return prismaClient.client.update({
        where: {
          client_id: normalClient.client_id,
        },
        data: {
          users: {
            connect: systemAdminUsers.map((user) => ({
              username: user.username,
            })),
          },
        },
      });
    }),
  ]);
}

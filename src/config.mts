import fs from 'node:fs';
import { createRequire } from 'module';
import { dirname } from 'path';
const require = createRequire(import.meta.url);

export const CONFIG = {
  systemClient: {
    desc: 'system',
    client_id: 'system',
    client_secret: '42ea9BE#',
    redirect_uris: ['https://www.baidu.com'],
  },
  systemAdminUsers: [
    {
      id: 'admin',
      username: 'admin',
      password: '42ea9BE#',
    },
    {
      id: 'baixiyang',
      username: 'baixiyang',
      email: 'baixiyang@outlook.com',
      password: '42ea9BE#',
    },
    {
      id: 'rona',
      username: 'rona',
      password: 'luona0206',
    },
  ],
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 5,
  },
  // 单位 秒
  authorizationCodeLifeTime: 60,
  accessTokenLifeTime: 60 * 60,
  refreshTokenLifeTime: 60 * 60 * 24 * 30,
  jwtLifeTime: 60 * 60,
  sessionLeftTime: 60 * 60 * 24,
  authIss: 'https://auth.wittyna.com',
  adminIss: 'https://admin.wittyna.com',
  jwtPrivateKey: fs.readFileSync(require.resolve('./pem/private.pem')),
  jwtPublicKey: fs.readFileSync(require.resolve('./pem/public.pem')),
  authStaticRoot: dirname(new URL(import.meta.url).pathname) + '/authStatic',
};

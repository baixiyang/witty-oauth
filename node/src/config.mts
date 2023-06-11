import fs from 'node:fs';
import { createRequire } from 'module';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
import process from 'node:process';
const ENV = process.env.ENV;
export const CONFIG = {
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
  port: ENV === 'development' ? 5554 : 5555,
  iss:
    ENV === 'development'
      ? `http://192.168.8.21:5555`
      : 'https://auth.wittyna.com',
  jwtPrivateKey: fs.readFileSync(require.resolve('./pem/private.pem')),
  jwtPublicKey: fs.readFileSync(require.resolve('./pem/public.pem')),
  uiRoot: dirname(new URL(import.meta.url).pathname) + '/ui',
};

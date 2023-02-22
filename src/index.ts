import {
  bodyMiddleWare,
  mongodbWare,
  responseMiddleWare,
  startServer,
} from 'witty-koa/src';
export function startOauth2Server({
  mongodbUrl,
  port = 5180,
  rootUser = { username: 'root', password: '123456' },
}: {
  port: number;
  mongodbUrl: string;
  rootUser: { username: string; password: string };
}) {
  startServer({
    port,
    controllers: [],
    middlewares: [
      responseMiddleWare(),
      bodyMiddleWare(),
      mongodbWare({
        url: mongodbUrl,
        dbName: 'witty-oauth',
      }),
    ],
  });
}

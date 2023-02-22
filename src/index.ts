import {
  bodyMiddleWare,
  mongodbMiddleWare,
  responseMiddleWare,
  startServer,
} from 'witty-koa';
export function startOauthServer({
  // mongodbUrl,
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
      // mongodbMiddleWare({
      //   url: mongodbUrl,
      //   dbName: 'witty-oauth',
      // }),
    ],
  });
}

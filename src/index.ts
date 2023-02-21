import {bodyMiddleWare, mongodbWare, responseMiddleWare, startServer} from "witty-koa/src";
startServer({
    port: 5180,
    controllers: [],
    middlewares: [
        responseMiddleWare(),
        bodyMiddleWare(),
        mongodbWare({
            url: 'xxx',
            dbName: 'test',
        }),
    ],
});
# wittyna-auth
## 简介
wittyna-auth 可以用于启动一个符合 oauth2.1 规范的授权认证服务。

## 启动项目
* 1、确保有 postgresql 服务，数据库配置地址在 node/.env中配置
* 2、确保有 redis 服务，redis配置地址在 node/config.mts 中配置
* 3、安装依赖
```shell
npm install
```
* 4、启动项目
```shell
npm run dev
```
* 5、访问
  http://localhost:5555/

该服务最好和 wittyna-admin 一起使用，

## 接口文档
https://typical-trumpet-963.notion.site/Auth-Server-8aa1489a7cd24e34b3201f0ed1a7f5c3
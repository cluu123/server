#### client-server

##### 启动

```
yarn
yarn dev
```

##### 前置

-   tot.sql
    -   mysql 结构文件
    -   项目在 app.js 入口文件引入 socket.io， 里面有 mysql 的连接配置， 所以要配置 mysql， 或者注释引入

##### 功能

-   聊天
-   视频
-   邮件
-   登录
-   文件上传
-   ...

##### 依赖

[socket.io](https://www.npmjs.com/package/socket.io)
[koa](https://www.npmjs.com/package/koa?activeTab=readme)
[mysql](https://www.npmjs.com/package/mysql)

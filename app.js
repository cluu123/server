const chalk = require('chalk');
const koaStatic = require('koa-static');
const path = require('path');
const fs = require('fs-extra');
const dayjs = require('dayjs');
const cors = require('koa2-cors');
const { koaBody } = require('koa-body');
const Koa = require('koa');

const app = new Koa();
const { IPAdress } = require('./src/utils/ipAddress');

const router = require('./src/index');
const handleError = require('./src/utils/handleRequest');

const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app.callback());

const socketIo = require('./src/socket/index');
const validCookies = require('./src/utils/validCookies');

const io = new Server(httpServer, {
    cors: '*'
});

socketIo(io);

app.use(cors());

app.use(koaStatic(path.resolve(__dirname, './public'), {
    index: false, // 默认为true  访问的文件为index.html  可以修改为别的文件名或者false
    hidden: false, // 是否同意传输隐藏文件
    defer: true // 如果为true，则在返回next()之后进行服务，从而允许后续中间件先进行响应
}));

app.use(koaBody({
    multipart: true, // 支持文件上传
    // encoding: 'gzip',
    formidable: {
        uploadDir: path.join(__dirname, 'public/upload/'), // 设置文件上传目录
        keepExtensions: true, // 保持文件的后缀
        maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
        onFileBegin: (name, file) => { // 文件上传前的设置
            if (!file.originalFilename.includes('.')) {
                const dir = path.join(__dirname, `public/upload/${file.originalFilename}`);
                file.filepath = `${dir}`;
            }
        }
    }
}));

app.use(async (ctx, next) => {
    if (ctx.url.match(/\.(gif|jpg|jpeg|png|mp3|bmp|swf)$/)) {
        // ctx.set('Content-Range', `bytes ${0}-${10000}/20000}`);
        // ctx.set('Accept-Range', 'bytes');
        ctx.set('Cache-Control', 'public, max-age=604800'); // 设置缓存时间为一周
    }
    const start = new Date().getTime();
    try {
        await validCookies(ctx);
        await next();
        const end = `${new Date().getTime() - start}ms`;
        const contain = `method: ${ctx.method} path: ${ctx.request.url} consuming: ${end}  time: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}\n`;
        fs.outputFileSync('./log/success.txt', contain, { flag: 'a+' });
    }
    catch (err) {
        const end = `${new Date().getTime() - start}ms`;
        const contain = `method: ${ctx.method} path: ${ctx.request.url} consuming: ${end} time: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}\n`;
        fs.outputFileSync('./log/error.txt', `${contain}        error: ${err.message} \n`, { flag: 'a+' });
        ctx.body = handleError(err.data || null, err.code || 999, err.message);
    }
});

app.use(router.routes(), router.allowedMethods());

process.env.PORT = process.env.PORT || '6868';

httpServer.listen(process.env.PORT, () => {
    console.log(`server is running ${chalk.green(IPAdress)}:${chalk.green(process.env.PORT)}`);
});

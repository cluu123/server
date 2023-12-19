const fs = require('fs');
const KoaRouter = require('koa-router');
const path = require('path');

const router = new KoaRouter({
    prefix: '/tot'
});

const testRouter = require('./test/index');
const userRouter = require('./login/index');
const messRouter = require('./message/index');
const findRouter = require('./find/index');
const myRouter = require('./my/index');
const groupRouter = require('./group/index');
const infoRouter = require('./info/index');

const cccRouter = require('./ccc/index');

// const { connectSQL } = require('./utils/mysql/index');
const handleMes = require('./utils/handleRequest');
// const { IPAdress } = require('./utils/ipAddress');

router.post('/test', ctx => {
    // get params  ctx.request.query
    // post query  ctx.request.body
    // file        ctx.request.files
    //             ctx.req.on
    // insert into table() values()
    // update table set name = 1 where id = 8;
    ctx.body = '';
});

router.get('/', async ctx => {
    // const sql = await connectSQL({
    //     host: '127.0.0.1',
    //     port: 3306,
    //     user: 'root',
    //     password: 'aSd123..',
    //     database: 'tot'
    // });
    // await sql.exec('insert into my_info(name) value(232)');
    ctx.body = {
        code: 1,
        message: 'success',
        data: null
    };
});

router.get('/get/testVideo', async ctx => {
    // ctx.body = handleMes(`//${IPAdress}:${process.env.PORT}/upload/${ctx.request.files.file.newFilename}`);
    // ctx.set('Cache-Control', 'max-age=23424243243');
    // ctx.set('Content-Type', 'a');
    // ctx.body = handleMes('http://10.19.84.155:6868/upload/xue.mp3');
    const a = fs.readFileSync(path.resolve(__dirname, '../public/upload/xue.mp3'));
    ctx.body = a;
});

router.get('/get/testVideo1', async ctx => {
    ctx.set('Accept-Range', 'bytes');
    const ad = fs.readFileSync(path.resolve(__dirname, '../public/upload/video.mov'));
    ctx.body = handleMes(ad);
});

router.post('/img', async ctx => {
    console.log(ctx.request.files);
    // ctx.body = handleMes(`//${IPAdress}:${process.env.PORT}/upload/${ctx.request.files.file.newFilename}`);
    ctx.body = handleMes(`/upload/${ctx.request.files.file.newFilename}`);
});

router.use(testRouter.routes(), testRouter.allowedMethods());
router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(messRouter.routes(), messRouter.allowedMethods());
router.use(findRouter.routes(), findRouter.allowedMethods());
router.use(myRouter.routes(), myRouter.allowedMethods());
router.use(groupRouter.routes(), groupRouter.allowedMethods());
router.use(infoRouter.routes(), infoRouter.allowedMethods());
router.use(cccRouter.routes(), cccRouter.allowedMethods());

module.exports = router;


const KoaRouter = require('koa-router');

const router = new KoaRouter();

const fs = require('fs'); // flag: w a
// const fsExtra = require('fs-extra'); // flag: w a
const path = require('path');

const file = {};

const handleRes = require('../utils/handleRequest');

router.post('/test/file', async ctx => {
    // console.log('', ctx.req.body);

    // const a = new FileReader()
    // a.onload = e => {
    //     const data = e.target.result
    //     console.log(data, data.maxByteLength);
    //     for(let i = 0; i <= data.maxByteLength / 10000; i++) {
    //         this.params.push(data.slice(i * 10000, 10000 * (i + 1)));
    //     }
    // }
    // a.readAsArrayBuffer(file.raw);
    ctx.req.on('data', aa => {
        fs.writeFileSync(path.resolve(__dirname, '../../public/img/3.jpg'), aa, { flag: 'a' });
    });
    // const r = fs.createReadStream(path.resolve(__dirname, '../../public/upload/1.jpeg'))
    // const w = fs.createWriteStream(path.resolve(__dirname, '../../public/img/1.jpeg'))
    // r.pipe(w);
    // let params = []
    // ctx.req.on('data', (chunk) => {
    //     params.push(chunk);
    // })
    // ctx.req.on('end', (chunk) => {
    //     let buffer = Buffer.concat(params);
    //     fs.writeFileSync(`./public/img/111.jpg`, buffer);
    // })
    ctx.body = 111;
});

router.post('/test/file1', async ctx => {
    // for(let i = 0; i < ctx.request.files.f1.length; i++) {
    //     fs.writeFileSync(path.resolve(__dirname, '../../public/img/13.jpg'), ctx.request.files.f1[i], { flag: 'a' });
    // }
    ctx.body = {
        code: 0,
        data: null,
        message: 'success'
    };
});

router.post('/test/file1/res', async ctx => {
    const data = ctx.request.body.fileArr;
    const type = ctx.request.body.type;
    for (let i = 0; i < data.length; i++) {
        const r = fs.readFileSync(path.resolve(__dirname, `../../public/upload/${data[i]}`));
        fs.writeFileSync(path.resolve(__dirname, `../../public/img/${data[0].slice(0, 3)}${type}`), r, { flag: 'a' });
    }
    for (let i = 0; i < data.length; i++) {
        fs.unlink(path.resolve(__dirname, `../../public/upload/${data[i]}`), () => {});
    }
    ctx.body = handleRes();
});

router.get('/test/file/end', ctx => {
    const res = Object.keys(file);
    for (let i = 0; i < res.length; i++) {
        // const read = fs.createReadStream(file[res[i]].file);
        fs.outputFileSync(path.resolve(__dirname, '../../public/img/1.jpg'), file[res[i]].file, { flag: 'a' });
    }
    ctx.body = file;
});

router.get('/test/del', ctx => {
    // fs.writeFileSync('./1.txt', 'aaa', { flag: 'a', encoding: 'binary' })
    // fsExtra.outputFileSync('./2.txt', 'bbb', { flag: 'a' });
    ctx.body = handleRes();
});

module.exports = router;

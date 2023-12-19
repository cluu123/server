const KoaRouter = require('koa-router');

const router = new KoaRouter();

const smsUserInfo = new Map();
const fs = require('fs-extra');
const path = require('path');
const sms = require('../utils/sms');
const getNum = require('../utils/random');

const sqlBaseConfig = require('../../config/index');
const validFile = require('./valid');
const validator = require('../utils/validator');
const jwt = require('jsonwebtoken');

const privateKey = 'chenqi_uu_key';
const handleRequest = require('../utils/handleRequest');
const { bcryptPwd, compilePwd } = require('../utils/bcrypt');
const { connectSQL } = require('../utils/mysql');

router.post('/login', async ctx => {
    const {
        pwd, uid, iphone, signIdx, type
    } = ctx.request.body;
    let valid = validFile.loginUid;
    if (type === 1) {
        valid = validFile.loginIhone;
    }
    const validResult = await validator(valid, ctx.request.body);
    const connect = await connectSQL(sqlBaseConfig);
    let getPwd = null;
    if (validResult.errors) {
        ctx.body = handleRequest(null, 999, validResult.errors);
        return;
    }
    if ((type === 1) && smsUserInfo.get(iphone)) {
        const date = smsUserInfo.get(iphone).sendData;
        const num = smsUserInfo.get(iphone).signIdx;
        if ((new Date() - date >= 60000) || (num !== signIdx)) {
            ctx.body = handleRequest(null, 999, '请校验输入!');
            return;
        }
        getPwd = await connect.exec(`select u_id, u_loginId, u_password from user where u_telephone = '${iphone}'`);
        const token = jwt.sign({ uid, type }, privateKey);
        ctx.cookies.set('tot', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false
        });
        ctx.cookies.set('tot_uid', uid || getPwd[0].u_loginId, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false
        });
        ctx.body = handleRequest();
        return;
    }
    if (uid) {
        getPwd = await connect.exec(`select u_id, u_password from user where u_loginId = '${uid}'`);
        if (getPwd.length && compilePwd(pwd, `${getPwd[0].u_password}`)) {
            const token = jwt.sign({ uid, type }, privateKey);
            ctx.cookies.set('tot', token, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false
            });
            ctx.cookies.set('tot_uid', uid, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false
            });
            ctx.body = handleRequest();
            return;
        }
    }
    ctx.body = handleRequest(null, 999, '账号或密码错误!');
});

router.post('/sign', async ctx => {
    const {
        uid, pwd, iphone, signIdx, type, imgUrl
    } = ctx.request.body;
    let valid = validFile.signUid;
    if (type === 1) {
        valid = validFile.signIphone;
    }
    const validResult = await validator(valid, ctx.request.body);
    if (validResult.errors) {
        ctx.body = handleRequest(null, 999, validResult.errors);
    }
    const connect = await connectSQL(sqlBaseConfig);
    const existUser = await connect.exec(`select * from user where u_loginId = '${uid}' or u_telephone = ${iphone}`);
    if (existUser.length) {
        ctx.body = handleRequest(null, 999, '用户已存在!');
        return;
    }
    if ((type === 1) && (smsUserInfo.get(iphone))) {
        const date = smsUserInfo.get(iphone).sendData;
        const num = smsUserInfo.get(iphone).signIdx;
        if ((new Date() - date >= 60000) || (num !== signIdx)) {
            ctx.body = handleRequest(null, 999, '请校验输入!');
            return;
        }
        await connect.exec(`insert into user(u_loginId, u_name, u_telephone, u_headImg) values('${uid || iphone}', '${uid || iphone}', '${iphone}', '${imgUrl || '/img/default.jpeg'}')`);
    }
    else {
        const bcryptRes = bcryptPwd(pwd);
        await connect.exec(`insert into user(u_loginId, u_name, u_password, u_headImg) values('${uid}', '${uid}', '${bcryptRes}', '${imgUrl || '/img/default.jpeg'}')`);
    }
    const token = jwt.sign({ uid, type }, privateKey);
    ctx.cookies.set('tot', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false
    });
    ctx.cookies.set('tot_uid', uid, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false
    });
    ctx.body = handleRequest();
});

router.get('/sms', async ctx => {
    const { iphone } = ctx.request.query;
    smsUserInfo.set(iphone, {
        sendData: new Date(),
        receiveDate: null,
        signIdx: await getNum(0, 9, 6)
    });
    const data = await sms(iphone, smsUserInfo.get(iphone).signIdx).catch(err => err);
    if (data.Code === 'OK') {
        ctx.body = handleRequest();
        return;
    }
    smsUserInfo.delete(iphone);
    ctx.body = handleRequest(null, 999, data.data.Message);
});

router.get('/user/info', async ctx => {
    const { uid } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(
        `
            select
                u_loginId as uid, u_name as name, u_headImg as img, u_signaTure as signaTure, u_telephone as phone, bgColor, color
            from user
            where u_loginId = '${uid}'
        `
    );
    const imgFile = path.resolve(__dirname, `../../public${data[0].img}`);
    let baseImg = null;
    if (fs.existsSync(imgFile)) {
        baseImg = fs.readFileSync(imgFile, 'base64');
    }
    else {
        baseImg = fs.readFileSync(path.resolve(__dirname, '../../public/img/default.jpeg'), 'base64');
    }
    const result = {
        ...data[0],
        img: baseImg
    };
    ctx.body = handleRequest(result);
});

module.exports = router;

const KoaRouter = require('koa-router');

const router = new KoaRouter();

const smsUserInfo = new Map();
const sms = require('../utils/sms');
const getNum = require('../utils/random');

const handleRequest = require('../utils/handleRequest');
const sqlBaseConfig = require('../../config/index');
const { connectSQL } = require('../utils/mysql');
const { bcryptPwd, compilePwd } = require('../utils/bcrypt');

router.post('/alter/info', async ctx => {
    const {
        uid, img, name, signaTure
    } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    const exist = await connect.exec(
        `
            select * from user where u_loginId = '${uid}'
        `
    );
    if (!exist.length) {
        ctx.body = handleRequest(null, 999, '用户不存在');
        return;
    }

    await connect.exec(
        `
            update user set u_headImg = '${img}', u_name = '${name}', u_signaTure = '${signaTure}'
            where u_loginId = '${uid}'
        `
    );
    ctx.body = handleRequest();
});

// 修改密码
router.post('/alter/pass', async ctx => {
    const {
        uid, oldPass, newPass
    } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);

    const data = await connect.exec(`
        select * from user
        where u_loginId = '${uid}'
    `);
    if (data.length && compilePwd(oldPass, `${data[0].u_password}`)) {
        await connect.exec(`
            update user set u_password = '${bcryptPwd(newPass)}'
            where u_loginId = '${uid}'
        `);
        ctx.body = handleRequest();
        return;
    }
    ctx.body = handleRequest(null, 999, '密码错误!');
});

router.post('/alter/phone', async ctx => {
    const {
        uid, phone, alterPhone, signIdx
    } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    if (smsUserInfo.get(phone)) {
        const date = smsUserInfo.get(phone).sendData;
        const num = smsUserInfo.get(phone).signIdx;
        if ((new Date() - date >= 60000) || (num !== signIdx)) {
            ctx.body = handleRequest(null, 999, '验证码错误!');
            return;
        }
        await connect.exec(`
            update user set u_telephone = ${alterPhone}
            where u_loginId = '${uid}'
        `);
        smsUserInfo.delete(phone);
        ctx.body = handleRequest();
        return;
    }
    ctx.body = handleRequest(null, 999, '验证码错误');
});

router.post('/bind/phone', async ctx => {
    const {
        uid, phone, signIdx
    } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    if (smsUserInfo.get(phone)) {
        const date = smsUserInfo.get(phone).sendData;
        const num = smsUserInfo.get(phone).signIdx;
        if ((new Date() - date >= 60000) || (num !== signIdx)) {
            ctx.body = handleRequest(null, 999, '验证码错误!');
            return;
        }
        await connect.exec(`
            update user set u_telephone = ${phone}
            where u_loginId = '${uid}'
        `);
        smsUserInfo.delete(phone);
        ctx.body = handleRequest();
        return;
    }
    ctx.body = handleRequest(null, 999, '验证码错误');
});

router.get('/my/sms', async ctx => {
    const { phone } = ctx.request.query;
    smsUserInfo.set(phone, {
        sendData: new Date(),
        receiveDate: null,
        signIdx: await getNum(0, 9, 6)
    });
    const data = await sms(phone, smsUserInfo.get(phone).signIdx).catch(err => err);
    if (data.Code === 'OK') {
        ctx.body = handleRequest();
        return;
    }
    smsUserInfo.delete(phone);
    ctx.body = handleRequest(null, 999, data.data.Message);
});

router.post('/set/color', async ctx => {
    const {
        uid, bgColor, color
    } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);

    await connect.exec(`
        update user set bgColor = '${bgColor}', color = '${color}'
        where u_loginId = '${uid}';
    `);
    ctx.body = handleRequest();
});

module.exports = router;

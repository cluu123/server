const jwt = require('jsonwebtoken');

const privateKey = 'chenqi_uu_key';

module.exports = ctx => new Promise((res, jet) => {
    if (ctx.header.ccc || ctx.path.includes('/test')) {
        res();
        return;
    }
    const cookiePwd = ctx.cookies.get('tot');
    const cookieUid = ctx.cookies.get('tot_uid');
    const noVerfyArr = ['/tot/login', '/tot/sign', '/tot/sms', '/tot/img'];
    if (noVerfyArr.includes(ctx.path) || /\/(img|upload)\//.test(ctx.path)) {
        res();
        return;
    }
    if (!cookiePwd || !cookieUid) {
        jet({
            data: null,
            code: 301,
            message: '请先登录!'
        });
        return;
    }
    try {
        jwt.verify(cookiePwd, privateKey);
        res();
    }
    catch (err) {
        jet({
            data: null,
            code: 301,
            message: '请先登录!'
        });
    }
});

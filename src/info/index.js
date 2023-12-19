const KoaRouter = require('koa-router');

const router = new KoaRouter();

const handleRequest = require('../utils/handleRequest');
const sqlBaseConfig = require('../../config/index');
const { connectSQL } = require('../utils/mysql');

router.get('/friend/info', async ctx => {
    const { uid, fid } = ctx.request.query;

    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(`
        select u.u_name as name, u.u_headImg as img, f.f_name as nickname, u.u_signaTure as signaTure from user as u
        join friend as f
        on f.f_friendId = '${fid}' and f.f_userId = '${uid}' and f.f_friendType
        where u_loginId = '${fid}'
    `);
    ctx.body = handleRequest(data[0]);
});

module.exports = router;

const KoaRouter = require('koa-router');

const router = new KoaRouter();

const handleRequest = require('../utils/handleRequest');
const sqlBaseConfig = require('../../config/index');
const { connectSQL } = require('../utils/mysql');

router.get('/allApply', async ctx => {
    const { uid } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const fidIsExist = await connect.exec(
        `
            select f.f_friendId, u.u_name, u.u_loginId, f.f_friendType from friend as f join user as u
            on f.f_friendId = u.u_loginId
            where f.f_userId = '${uid}' and f.f_friendType != 2 and (f.f_friendType = 1 or f.f_friendType = 3);
        `
    );
    if (fidIsExist.length) {
        const data = fidIsExist.map(ele => ({
            name: ele.u_name,
            fid: ele.f_friendId,
            uid,
            type: ele.f_friendType,
            text: '',
            img: ''
        }));
        ctx.body = handleRequest(data);
        return;
    }
    ctx.body = handleRequest([]);
});

router.get('/queryUser', async ctx => {
    const { keys, uid } = ctx.request.query;
    if (!keys) {
        return;
    }
    const connect = await connectSQL(sqlBaseConfig);
    const fidIsExist = await connect.exec(
        `
            select u.u_id, u.u_loginId, u.u_name, f.f_friendType from user as u left join friend as f
            on u.u_loginId = f.f_friendId and f.f_userId = '${uid}'
            where u.u_loginId like '%${keys}%' and u.u_loginId != '${uid}'
        `
    );
    if (fidIsExist.length) {
        const data = fidIsExist.map(ele => ({
            name: ele.u_name,
            fid: ele.u_loginId,
            type: ele.f_friendType || 0,
            uid
        }));
        ctx.body = handleRequest(data);
        return;
    }
    ctx.body = handleRequest([]);
});

router.post('/appendFriend', async ctx => {
    const { uid, fid, type } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    const recodExist = await connect.exec(`select f_id from friend where f_userId = '${uid}' and f_friendId = '${fid}'`);
    const fidType = (type === 1) ? 3 : type;
    if (recodExist.length) {
        await connect.exec(`update friend set f_friendType = '${type}' where f_userId = '${uid}' and f_friendId = '${fid}'`);
        await connect.exec(`update friend set f_friendType = '${fidType}' where f_userId = '${fid}' and f_friendId = '${uid}'`);
    }
    else {
        await connect.exec(`insert into friend(f_friendId, f_userId, f_friendType) values('${fid}', '${uid}', '${type}')`);
        await connect.exec(`insert into friend(f_friendId, f_userId, f_friendType) values('${uid}', '${fid}', '${fidType}')`);
    }
    // 同意好友打招呼数据
    if (type === 2) {
        await connect.exec(`
            insert into message(m_postMessage, m_status, m_time, m_messType, m_formUserId, m_toUserId)
            values('以上是打招呼信息!', 0, ${new Date().getTime()}, -2, '${fid}', '${uid}')
        `);
    }
    ctx.body = handleRequest();
});

router.post('/getFriendData', async ctx => {
    const { uid } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    const frientData = await connect.exec(
        `
            select u.u_loginId as fid, u.u_name as name, u.u_headImg as img, f_onceMessage as once from friend as f join user as u
            on f.f_friendId = u.u_loginId
            where f.f_userId = '${uid}' and f.f_friendType = 2
        `
    );
    ctx.body = handleRequest(frientData);
});

router.get('/is/friend', async ctx => {
    const { uid, fid } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(`
        select * from friend
        where f_friendId = '${fid}' and f_userId = '${uid}' and f_friendType = 2
    `);
    if (data.length) {
        ctx.body = handleRequest(data);
        return;
    }
    ctx.body = handleRequest(0);
});

router.get('/is/group', async ctx => {
    const { userId, groupId } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(`
        select * from group_user
        where uid = '${userId}' and group_id = '${groupId}' and (status = 0 || status is null)
    `);
    if (data.length) {
        ctx.body = handleRequest(data);
        return;
    }
    ctx.body = handleRequest(0);
});

module.exports = router;

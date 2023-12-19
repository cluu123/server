const KoaRouter = require('koa-router');

const router = new KoaRouter();

const handleRequest = require('../utils/handleRequest');
const sqlBaseConfig = require('../../config/index');
const { connectSQL } = require('../utils/mysql');

router.get('/indexMessage', async ctx => {
    const {
        uid
    } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(
        `
            select
                m.m_postMessage as message, m.m_status as status, m.m_time as time,
                m.m_messType as type, m.m_formUserId as fid, m.m_toUserId as uid, u.u_headImg as img, u.u_name as name
            from message as m join user as u
            on
                (case
                    when m.m_formUserId = '${uid}' then m.m_toUserId = u.u_loginId
                    else m.m_formUserId = u.u_loginId
                    end
                )
            where (m.m_formUserId, m.m_toUserId, m.m_time) in
                (
                    SELECT m_formUserId , m_toUserId, MAX(m_time) AS m_time
                    FROM message
                    WHERE m_formUserId = '${uid}' or m_toUserId = '${uid}'
                    GROUP BY m_formUserId, m_toUserId
                )
        `
    );
    const result = {};
    data.forEach(ele => {
        const id = ele.uid === uid ? ele.fid : ele.uid;
        if (!result[id]) {
            result[id] = {
                ...ele,
                uid: uid === ele.uid ? ele.uid : ele.fid,
                fid: uid === ele.uid ? ele.fid : ele.uid
            };
        }
        else if (result[id] && result[id].time < ele.time) {
            result[id] = {
                ...ele,
                uid: uid === ele.uid ? ele.uid : ele.fid,
                fid: uid === ele.uid ? ele.fid : ele.uid
            };
        }
    });
    ctx.body = handleRequest(Object.values(result).sort((a, b) => b.time - a.time));
});

router.get('/otoMessage', async ctx => {
    const {
        uid, fid
    } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(
        `
            select
                m_formUserId as uid, m_toUserId as fid, m_postMessage as message, m_status as status, m_time as time,
                m_messType as type
            from message
            where ((m_formUserId = '${fid}' and m_toUserId = '${uid}') or (m_formUserId = '${uid}' and m_toUserId = '${fid}')) and m_messType != -1
        `
    );
    ctx.body = handleRequest(data);
});

// router.post('/setOnceMes', async ctx => {
//     const {
//         uid, fid, once
//     } = ctx.request.query;
//     const connect = await connectSQL(sqlBaseConfig);
//     if (once) {
//         await connect.exec(
//             `
//                 update into friend
//                 f_onceMessage = 1
//                 where (f_friendId = '${fid}' and f_userId = '${uid}') or (f_friendId = '${uid}' and f_userId = '${fid}' )
//             `
//         );
//     }
//     ctx.body = handleRequest();
// });

router.get('/group/message', async ctx => {
    const {
        groupId
    } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(
        `
            select * from group_mes where group_id = '${groupId}'
        `
    );
    ctx.body = handleRequest(data);
});

router.get('/group/all/message', async ctx => {
    const {
        uid
    } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(
        `
            select * from group_id as a
            join (
                select z.group_id, z.time, z.message, z.uid, i.img, z.status, z.type from (
                    select group_id, MAX(time) as time
                    from group_mes
                    where group_id in (
                        select group_id from group_user
                        where uid = '${uid}' and (status = 0 || status is null)
                        group by group_id
                    )
                    group by group_id
                ) as y
                join group_mes as z
                on y.group_id = z.group_id and y.time = z.time
                join group_id as i
                on i.group_id = y.group_id
            ) as b
            on a.group_id = b.group_id
        `
    );
    data.forEach(ele => {
        ele.groupId = ele.group_id;
    });
    ctx.body = handleRequest(data);
});

router.post('/status', async ctx => {
    const { fid } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    await connect.exec(`
        update message set m_status = 1
        where m_formUserId = '${fid}'
    `);
    ctx.body = handleRequest();
});

module.exports = router;

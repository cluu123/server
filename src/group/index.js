const KoaRouter = require('koa-router');

const router = new KoaRouter();

const handleRequest = require('../utils/handleRequest');
const sqlBaseConfig = require('../../config/index');
const { connectSQL } = require('../utils/mysql');

router.post('/creat/group', async ctx => {
    const { group, name, uid } = ctx.request.body;
    if (!group || !group.length || !name) {
        ctx.body = handleRequest(null, 999, '输入信息错误!');
        return;
    }
    const connect = await connectSQL(sqlBaseConfig);
    const existGroup = await connect.exec(`
        select * from Group_Id
        where name = '${name}';
    `);
    if (existGroup.length) {
        ctx.body = handleRequest(null, 999, '群组名已存在');
        return;
    }

    const groupId = await connect.exec(`
        insert into Group_Id(name, admin_id, img) values('${name}', '${uid}', '/img/default.jpeg);
    `);
    let value = '';
    group.forEach((ele, index) => {
        if (!index) {
            value += `('${uid}', '${name}', '${groupId.insertId}', '${uid}', 0),`;
        }
        value += `('${ele}', '${name}', '${groupId.insertId}', '${uid}', 0),`;
    });
    await connect.exec(`
        insert into Group_User(uid, group_name, group_id, admin_id, status) values${value.slice(0, -1)}
    `);
    await connect.exec(`
        insert into group_mes(group_id, message, type, time) values(${groupId.insertId}, '以上是打招呼信息', -2, '${new Date().getTime()}')
    `);
    ctx.body = handleRequest(groupId.insertId);
});

router.get('/get/group', async ctx => {
    const { uid } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(`
        select * from group_id as g
        where g.group_id in (
            select group_id from group_user
            where uid = '${uid}' and (status = 0 || status is null)
            group by group_id
        );
    `);
    ctx.body = handleRequest(data);
});

router.get('/get/group/user', async ctx => {
    const { groupId } = ctx.request.query;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(`
        select u.u_headImg as img, u.u_name as uname, g.uid as uid, g.name as name, g.adminId as adminId from user as u
        join (
            select u.uid as uid, g.name as name, g.admin_id as adminId from group_id as g
            join (
                select uid from group_user
                where group_id = '${groupId}' and (status = 0 || status is null)
                group by uid
            ) as u
            where group_id = '${groupId}'
        ) as g 
        on u.u_loginId = g.uid
    `);
    ctx.body = handleRequest(data);
});

router.post('/group/invite', async ctx => {
    const {
        groupId, checkList, name, uid
    } = ctx.request.body;
    if (!checkList.length) {
        ctx.body = handleRequest(null, 999, '参数错误');
        return;
    }
    let insertValue = '';
    checkList.forEach(ele => {
        insertValue += `('${ele}', '${groupId}', '${name}'),`;
    });
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(`
        select uid from group_user
        where uid = '${uid}'
    `);
    if (data && data.length) {
        if (data[0].status === 0) {
            return;
        }
        await connect.exec(`
            update group_user set status = 0
            where uid = '${uid}' and group_id = '${groupId};
        `);
        ctx.body = handleRequest();
        return;
    }
    await connect.exec(`
        insert into group_user(uid, group_id, group_name)
        values${insertValue.slice(0, -1)}
    `);
    ctx.body = handleRequest();
});

router.post('/group/quit', async ctx => {
    const {
        groupId,
        uid
    } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    const data = await connect.exec(`
        select uid from group_user
        where uid = '${uid}' and group_id = '${groupId}' and (status = 0 || status is null)
    `);
    if (data && data.length) {
        await connect.exec(`
            update group_user set status = 1
            where uid = '${uid}' and group_id = '${groupId}';
        `);
        ctx.body = handleRequest();
    }
});

router.post('/group/dissolve', async ctx => {
    const {
        groupId
    } = ctx.request.body;
    const connect = await connectSQL(sqlBaseConfig);
    await connect.exec(`
        update group_user set status = 1
        where group_id = '${groupId}' and (status = 0 || status is null)
    `);
    ctx.body = handleRequest();
});

module.exports = router;

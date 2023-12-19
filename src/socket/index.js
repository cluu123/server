// socket.broadcast.to(id).emit('testid', 22);
// io.sockets.in('aa').emit('iotestroom', 555);
const rooms = new Map();
const user = new Map();
const sqlBaseConfig = require('../../config/index');
const { connectSQL } = require('../utils/mysql');
const { sqlSaveInfo, sqlSaveGroupInfo } = require('./util');

module.exports = async io => {
    const connect = await connectSQL(sqlBaseConfig);
    io.on('connection', socket => {
        if (!user.has(socket.id)) {
            user.set(socket.id, {
                id: socket.id,
                name: socket.handshake.auth.username,
                info: [],
                statusMap: {},
                releSocketId: null,
                uid: null,
                fid: null
            });
        }
        // 用户登陆
        socket.emit('login', socket.id);
        // 交换一对一聊天的socketId
        socket.on('one exchange socket id', data => {
            user.get(socket.id).uid = data.uid;
            user.get(socket.id).fid = data.fid;
            for (const i of user) {
                if (user.get(socket.id).uid === i[1].fid && user.get(socket.id).fid === i[1].uid) {
                    i[1].releSocketId = socket.id;
                    user.get(socket.id).releSocketId = i[0];
                }
            }
        });
        // 用户一对一聊天
        socket.on('o-o message', data => {
            io.sockets.emit('o-o message', data);
            data.status = data.releSocketId ? 1 : 0;

            //  处理视频报错重复调用
            if (data.type === 5) {
                const mess = user.get(socket.id).info;
                if (mess && !mess.length) {
                    user.get(socket.id).info.push(data);
                    return;
                }
                if ((data.time - mess[mess.length - 1].time) > 1000) {
                    user.get(socket.id).info.push(data);
                }
                return;
            }
            // 整体发送的消息, 退出连接存mysql
            user.get(socket.id).info.push(data);
        });
        socket.on('o-o message save info', async () => {
            const recordData = [];
            for (const item of user) {
                const info = item[1].info;
                recordData.push(...info);
                item[1].info = [];
            }
            // 存 1v1 聊天信息
            if (recordData.length) {
                await sqlSaveInfo(recordData, connect);
            }
            // 存 群组聊天信息
            const roomsData = [];
            for (const item of rooms) {
                const info = item[1].messData;
                recordData.push(...info);
                item[1].info = [];
            }
            if (roomsData.length) {
                await sqlSaveGroupInfo(roomsData, connect);
            }
        });

        // 每次页面初始化 存数据
        socket.on('back message', async () => {
            let recordData = user.get(socket.id).info.concat(user.get(user.get(socket.id).releSocketId) ? user.get(user.get(socket.id).releSocketId).info : []).sort();
            // 重置对应的聊天记录 info
            if (user.get(socket.id).releSocketId) {
                user.get(user.get(socket.id).releSocketId).info = [];
                user.get(user.get(socket.id).releSocketId).releSocketId = null;
            }
            user.get(socket.id).info = [];
            user.get(socket.id).releSocketId = null;

            // 新加好友时获取聊天数据
            const initFriendData = [];
            for (const [key, value] of user) {
                if (value.uid || value.fid) {
                    initFriendData.push(...value.info);
                    user.get(key).info = [];
                }
            }
            recordData = recordData.concat(initFriendData).sort();
            // 在当前用户退出1vs1聊天时存mysql
            if (recordData.length) {
                await sqlSaveInfo(recordData, connect);
            }

            socket.emit('back message ready');
        });

        // 好友申请
        socket.on('friend apply', data => {
            io.sockets.emit('friend apply', data);
        });
        // 消息撤回
        socket.on('reacll o-o message', data => {
            data.type = -1;
            user.get(socket.id).info.find(ele => {
                if (ele.time === data.time && ele.uid === data.uid && ele.fid === data.fid) {
                    ele.type = data.type;
                    return true;
                }
                return false;
            });
            io.sockets.emit('o-o message', data);
        });

        // 群聊
        socket.on('join room', async data => {
            const { groupId, uid } = data;
            if (!rooms.has(groupId)) {
                rooms.set(groupId, {
                    idData: new Map(),
                    messData: []
                });
            }
            const recordGroupData = rooms.get(data.groupId).messData;
            if (recordGroupData.length) {
                await sqlSaveGroupInfo(recordGroupData, connect);
            }
            uid.forEach(ele => {
                const joinInfo = {
                    ...data,
                    type: -3,
                    message: data.joinType ? `${ele}加入群聊` : `${ele}已上线`
                };
                rooms.get(groupId).messData.push(joinInfo);
                rooms.get(groupId).idData.set(ele, ele);
                socket.join(groupId);
                io.to(groupId).emit('emit room message', joinInfo);
                io.sockets.emit('info g-g message', joinInfo);
            });
            // if (!rooms.get(groupId).idData.has(uid)) {
            //     rooms.get(groupId).idData.set(uid, uid);
            //     socket.join(groupId);
            //     io.to(groupId).emit('emit room message', data);
            // }
        });
        // 有人退出刷新群聊
        socket.on('refer group', data => {
            io.socket.emit('refer group', data);
        });
        socket.on('g-g message', data => {
            const { groupId } = data;
            rooms.get(groupId).messData.push(data);
            io.to(groupId).emit(groupId, data);
            io.sockets.emit('info g-g message', data);
        });
        socket.on('leave current room', async data => {
            if (rooms.has(data.groupId) && rooms.get(data.groupId).idData.has(data.uid)) {
                rooms.get(data.groupId).messData.push(data);
                const recordGroupData = rooms.get(data.groupId).messData;
                if (recordGroupData.length) {
                    await sqlSaveGroupInfo(recordGroupData, connect);
                }
                io.to(data.groupId).emit('leave current room to client', data);
                io.sockets.emit('info g-g message', data);
                rooms.get(data.groupId).idData.delete(data.uid);
                rooms.get(data.groupId).messData = [];
            }
        });

        // 1v1视频
        socket.on('offer', data => {
            io.sockets.emit('offer', data);
        });
        socket.on('answer', data => {
            io.sockets.emit('answer', data);
        });
        socket.on('remote ice', data => {
            io.sockets.emit('remote ice', data);
        });
        socket.on('local ice', data => {
            io.sockets.emit('local ice', data);
        });
        socket.on('dropped', data => {
            io.sockets.emit('dropped', data);
        });
        socket.on('askAgree', data => {
            io.sockets.emit('askAgree', data);
        });
        socket.on('agree', data => {
            io.sockets.emit('agree', data);
        });
        socket.on('busy', data => {
            io.sockets.emit('busy', data);
        });
        socket.on('user input', data => {
            io.sockets.emit('user input', data);
        });
        socket.on('user blur', data => {
            io.sockets.emit('user blur', data);
        });
        socket.on('close track', data => {
            io.sockets.emit('close track', data);
        });

        socket.on('disconnecting', async () => {
            const recordData = user.get(socket.id).info.concat(user.get(user.get(socket.id).releSocketId) ? user.get(user.get(socket.id).releSocketId).info : []).sort();
            // 在当前用户退出1vs1聊天时存mysql
            if (recordData.length) {
                sqlSaveInfo(recordData, connect);
            }
            // 重置对应的聊天记录 info
            if (user.get(socket.id).releSocketId) {
                user.get(user.get(socket.id).releSocketId).info = [];
                user.get(user.get(socket.id).releSocketId).releSocketId = null;
            }
            // 删除退出的用户socket连接
            user.delete(socket.id);

            const auth = socket.handshake.auth.username;
            const resultData = [];
            for (const i of rooms) {
                const checkAuth = i[1].idData;
                const messDate = i[1].messData;
                if (checkAuth.has(auth)) {
                    resultData.push(...messDate);
                }
                checkAuth.delete(auth);
                i[1].messData = [];
            }
            if (resultData.length) {
                sqlSaveGroupInfo(resultData, connect);
            }
        });
    });
};

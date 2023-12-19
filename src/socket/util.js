exports.sqlSaveInfo = (recordData, connect) => new Promise(res => {
    let recordStr = '';
    recordData.sort().forEach(ele => {
        const {
            message, status, time, type, fid, uid
        } = ele;
        recordStr += `('${message}', '${status}', '${time}', '${type}', '${uid}', '${fid}'),`;
    });
    connect.exec(
        `
            insert into message(m_postMessage, m_status, m_time, m_messType, m_formUserId, m_toUserId)
            values${recordStr.slice(0, -1)}
        `
    ).then(() => {
        res();
    });
});

exports.sqlSaveGroupInfo = (recordGroupData, connect) => new Promise(res => {
    let recordStr = '';
    recordGroupData.sort().forEach(ele => {
        const {
            groupId, message, uid, status, type, time
        } = ele;
        recordStr += `('${groupId}', '${message}', '${uid}', '${status}', '${type}', '${time}'),`;
    });
    connect.exec(
        `
            insert into group_mes(group_id, message, uid, status, type, time)
            values${recordStr.slice(0, -1)}
        `
    ).then(() => {
        res();
    });
});

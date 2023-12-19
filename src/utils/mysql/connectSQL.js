const mysql = require('mysql');
const SqlCore = require('./sqlCore');

const poolCluster = mysql.createPoolCluster();
const poolClusterQueue = new Set();
const connectionQueue = new Map();

function getConnectionCache(poolClusterName, connectionLimit) {
    const connectionMap = connectionQueue.get(poolClusterName);
    const connectionMapSize = connectionMap.size;
    if (connectionMapSize >= connectionLimit - 1) {
        const queueIndex = Math.floor(Math.random() * connectionMapSize);
        const threadId = [...connectionMap.keys()][queueIndex];
        const connection = connectionMap.get(threadId);
        return new Promise(resolve => {
            connection.ping(err => {
                if (err) {
                    connectionMap.delete(threadId);
                    connection.release();
                    getConnectionCache(poolClusterName, connectionLimit).then(resolve);
                }
                else {
                    resolve(new SqlCore(connection));
                }
            });
        });
    }
    return new Promise((resolve, reject) => {
        poolCluster.getConnection(poolClusterName, (err, _connection) => {
            if (err) {
                reject(err);
                return;
            }
            connectionMap.set(_connection.threadId, _connection);
            resolve(new SqlCore(_connection));
        });
    });
}

poolCluster.on('remove', nodeId => {
    poolClusterQueue.delete(nodeId);
    connectionQueue.delete(nodeId);
});

exports.sqlController = () => new SqlCore();

exports.init = ({
    // host地址
    host = '127.0.0.1',
    // 端口
    port = 3306,
    // 用户名
    user = 'root',
    // 数据库密码
    password = 'root',
    // 使用的数据库
    database = 'test',
    // 是否等待链接(连接池时使用)
    waitForConnections = true,
    // 连接池大小
    connectionLimit = 20,
    // 排队限制
    queueLimit = 0,
    charset = 'utf8mb4'
}) => {
    const dbBaseConfig = {
        host, port, user, password, database, charset
    };
    const dbPoolConfig = { waitForConnections, connectionLimit, queueLimit };
    const poolClusterName = `${host}:${port}:${database}:${user}:${password}`;

    if (!poolClusterQueue.has(poolClusterName)) {
        // 连接池队列
        poolClusterQueue.add(poolClusterName);
        // 连接队列
        connectionQueue.set(poolClusterName, new Map());
        poolCluster.add(poolClusterName, {
            ...dbBaseConfig,
            ...dbPoolConfig
        });
    }
    return getConnectionCache(poolClusterName, connectionLimit);
};

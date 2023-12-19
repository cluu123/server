const { init, sqlController } = require('./connectSQL');

exports.sqlController = sqlController;

exports.connectSQL = dataBase => init({
    host: dataBase.host,
    port: dataBase.port,
    user: dataBase.user,
    password: dataBase.password,
    database: dataBase.database,
    ispool: !!dataBase.ispool,
    connectionLimit: dataBase.connectionLimit || 20
});

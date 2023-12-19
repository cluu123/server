const mysql = require('mysql');
const {
    getOptToString,
    checkOptType,
    // checkOptObjType,
    // expressionQuery,
    sortSelectSql,
    handleInsertData
} = require('./sqlUtil');

module.exports = class {
    constructor(connection) {
        this.connection = connection;
        this.sqlObj = {};
    }

    table(opt) {
        if (opt && opt.indexOf('SELECT') !== -1) {
            opt = `(${opt})`;
        }
        if (opt) {
            this.sqlObj.table = opt;
        }
        return this;
    }

    where(opt) {
        let result = '';
        if (typeof (opt) === 'string') {
            result = opt;
        }
        else {
            result = getOptToString(opt);
        }
        if (result) {
            this.sqlObj.where = result;
        }
        return this;
    }

    field(opt) {
        if (typeof (opt) === 'object') {
            opt = opt.join(',');
        }
        this.sqlObj.field = opt;
        return this;
    }

    alias(opt) {
        this.sqlObj.alias = opt;
        return this;
    }

    data(opt) {
        let newopt = {};
        if (typeof (opt) === 'string') {
            const arr = opt.split('&');
            arr.forEach(item => {
                const itemarr = item.split('=');
                newopt[itemarr[0]] = itemarr[1];
            });
        }
        else {
            newopt = opt;
        }
        this.sqlObj.data = newopt;
        return this;
    }

    order(opt) {
        const orderby = 'ORDER BY';

        if (typeof (opt) === 'object') {
            opt = opt.join(',');
        }

        this.sqlObj.order = `${orderby} ${opt}`;
        return this;
    }

    limit() {
        // eslint-disable-next-line
        this.sqlObj.limit = `LIMIT ${Array.prototype.slice.apply(arguments)}`;
        return this;
    }

    page(option) {
        let opt = [];
        if (arguments.length === 1) {
            opt = option.split(',');
        }
        else {
            // eslint-disable-next-line
            opt = Array.prototype.slice.apply(arguments);
        }
        if (opt.length === 2) {
            const begin = parseInt(opt[0] - 1) * parseInt(opt[1]);
            const end = parseInt(opt[1]);
            this.sqlObj.limit = `LIMIT ${begin},${end}`;
        }
        return this;
    }

    group(opt) {
        this.sqlObj.group = `GROUP BY ${opt}`;
        return this;
    }

    having(opt) {
        this.sqlObj.having = `HAVING ${opt}`;
        return this;
    }

    union(opt, type = false) {
        if (typeof (opt) === 'string') {
            if (this.sqlObj.union) {
                this.sqlObj.union = `${this.sqlObj.union} (${opt}) ${type ? 'UNION ALL' : 'UNION'}`;
            }
            else {
                this.sqlObj.union = `(${opt}) ${type ? 'UNION ALL' : 'UNION'} `;
            }
        }
        else if (typeof (opt) === 'object') {
            if (this.sqlObj.union) {
                this.sqlObj.union = `${this.sqlObj.union} (${opt.join(type ? ') UNION ALL (' : ') UNION (')})  ${type ? 'UNION ALL' : 'UNION'} `;
            }
            else {
                this.sqlObj.union = `(${opt.join(type ? ') UNION ALL (' : ') UNION (')}) ${type ? 'UNION ALL' : 'UNION'} `;
            }
        }
        return this;
    }

    distinct(opt) {
        if (opt) {
            this.sqlObj.distinct = 'DISTINCT';
        }
        return this;
    }

    lock(opt) {
        if (opt) {
            this.sqlObj.lock = 'FOR UPDATE';
        }
        return this;
    }

    comment(opt) {
        if (opt) {
            this.sqlObj.comment = `/* ${opt} */`;
        }
        return this;
    }

    count(opt) {
        const optvalue = opt || 1;
        this.sqlObj.count = `COUNT(${optvalue})`;
        return this;
    }

    max(opt) {
        if (opt) {
            this.sqlObj.max = `MAX(${opt})`;
        }
        return this;
    }

    min(opt) {
        if (opt) {
            this.sqlObj.min = `MIN(${opt})`;
        }
        return this;
    }

    avg(opt) {
        if (opt) {
            this.sqlObj.avg = `AVG(${opt})`;
        }
        return this;
    }

    sum(opt) {
        if (opt) {
            this.sqlObj.sum = `SUM(${opt})`;
        }
        return this;
    }

    select(type = false) {
        let result = '';
        if (this.sqlObj.union) {
            result = this.sqlObj.union;
            if (result.substr(-10).indexOf('ALL') !== -1) {
                result = result.replace(/\sUNION\sALL\s*$/, '');
            }
            else {
                result = result.replace(/\sUNION\s*$/, '');
            }
            this.sqlObj = {};
            return result;
        }

        const newSqlObj = sortSelectSql(this.sqlObj);
        newSqlObj.sortkeys.forEach(item => {
            if (newSqlObj.result[item]) {
                result = `${result} ${newSqlObj.result[item]}`;
            }
        });
        const sqlStr = `SELECT ${result.replace(/'/g, '\'').replace(/`/g, '\'')} `;
        if (type) {
            this.sqlObj.sqlStr = sqlStr; return this;
        }
        this.sqlObj = {}; return sqlStr;
    }

    update(type = false, bol = false) {
        let result = '';
        let datastr = '';
        const newopt = this.sqlObj.data;

        const keys = Object.keys(newopt);

        keys.forEach((item, index) => {
            datastr = index === keys.length - 1
                ? `${datastr}${item}=${checkOptType(newopt[item], item, type, bol)}`
                : `${datastr}${item}=${checkOptType(newopt[item], item, type, bol)},`;
        });
        result = this.sqlObj.where
            ? `UPDATE ${this.sqlObj.table} SET ${datastr} WHERE ${this.sqlObj.where}`
            : `UPDATE ${this.sqlObj.table} SET ${datastr}`;
        const sqlStr = result.replace(/'/g, '\'').replace(/`/g, '\'');
        if (type && !bol) {
            this.sqlObj.sqlStr = sqlStr; return this;
        }
        this.sqlObj = {}; return sqlStr;
    }

    /**
     * @批量插入
     * @data方法包含where
     * @batchUpdate 传入true可链式调用exec
     * connectSQL(env.dataBase)
            .table('staff')
            .data({
                where: { id: ['1', '2', '3'], test_order_id: [1111, 222, 33], abc: [1111, 222, 33] },
                data: {
                    op_object: ['aaa', 'bbb', 'ccc']
                }
            })
            .batchUpdate();
    * 生成语句
    * UPDATE table
        SET op_object = (
            CASE
                WHEN id=1 AND test_order_id=11 AND abc=111 THEN `aaa`
                WHEN id=2 AND test_order_id=22 AND abc=222 THEN `bbb`
                WHEN id=3 AND test_order_id=33 AND abc=333 THEN `ccc`
            END
        ) WHERE id IN (1,2,3) AND test_order_id IN (11,22,33) AND abc IN (111,222,333);
    */
    batchUpdate(type = false) {
        const { where, data } = this.sqlObj.data;
        const setKey = Object.keys(data)[0];
        const setValues = data[setKey];
        const whereStr = Object.keys(where).reduce((pre, cur, index) => {
            const value = where[cur].reduce((_pre, _cur, _index) => `${_pre}${_index ? ',' : ''}${typeof _cur === 'string' ? `'${_cur}'` : _cur}`, '');
            return `${pre}${index ? ' AND' : ''} ${cur} IN (${value})`;
        }, 'WHERE');
        const [first, ...other] = Object.keys(where).reduce((pre, cur) => {
            pre.push(where[cur].reduce((_pre, _cur) => {
                _pre.push(`${cur}=${typeof _cur === 'string' ? `'${_cur}'` : _cur}`);
                return _pre;
            }, []));
            return pre;
        }, []);
        const whenStrList = first.map((item, index) => {
            const b = other.reduce((pre, cur) => `${pre} AND ${cur[index]}`, '');
            return `WHEN ${item}${b}`;
        }).map((item, index) => `${item} THEN ${typeof setValues[index] === 'string' ? `'${setValues[index]}'` : setValues[index]}`);
        const sqlStr = `UPDATE ${this.sqlObj.table}\n`
            + `SET ${Object.keys(data)[0]} = (\n`
            + 'CASE\n'
            + `${whenStrList.join('\n')}\n`
            + 'END\n'
            + `) ${whereStr};`;
        console.log(sqlStr);
        if (type) {
            this.sqlObj.sqlStr = sqlStr; return this;
        }
        this.sqlObj = {}; return sqlStr;
    }

    insert(type = false) {
        const newopt = this.sqlObj.data;
        const datastr = handleInsertData(newopt);
        const result = `INSERT INTO ${this.sqlObj.table} ${datastr}`;
        const sqlStr = result.replace(/'/g, '\'').replace(/`/g, '\'');
        if (type) {
            this.sqlObj.sqlStr = sqlStr; return this;
        }
        this.sqlObj = {}; return sqlStr;
    }

    insertBySet(type = false) {
        const newopt = this.sqlObj.data;
        const sqlStr = mysql.format(`INSERT INTO ${this.sqlObj.table} SET ?`, newopt);
        if (type) {
            this.sqlObj.sqlStr = sqlStr;
            return this;
        }
        this.sqlObj = {};
        return sqlStr;
    }

    delet(type = false) {
        const result = this.sqlObj.where
            ? `DELETE FROM ${this.sqlObj.table} WHERE ${this.sqlObj.where}`
            : `DELETE FROM ${this.sqlObj.table}`;
        const sqlStr = result.replace(/'/g, '\'').replace(/`/g, '\'');
        if (type) {
            this.sqlObj.sqlStr = sqlStr; return this;
        }
        this.sqlObj = {}; return sqlStr;
    }

    query(opt, type = false) {
        opt = opt || '';
        if (type) {
            this.sqlObj.sqlStr = opt; return this;
        }
        return opt;
    }

    exec(sqlstring = this.sqlObj.sqlStr) {
        if (!this.connection) {
            console.error('该SQL实例无数据库链接实例');
            return Promise.reject();
        }
        this.sqlObj = {};
        return new Promise((resolve, reject) => {
            this.connection.query(sqlstring, (error, results) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
};

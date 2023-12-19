const sqlstring = require('sqlstring');

function checkOptType(opt, key, type, bol) {
    let result;
    switch (Object.prototype.toString.call(opt)) {
        case '[object String]':
            opt = opt.trim();
            opt = sqlstring.escape(opt);
            result = type && bol && opt.indexOf(key) > -1 && opt.match(/\+|-|\*|\/|%/) ? opt.slice(1, -1) : `${opt}`;
            break;
        case '[object Boolean]': case '[object Number]':
            result = opt;
            break;
        default:
            result = sqlstring.escape(opt);
    }

    return result;
}
function expressionQuery(parKey, chiKey, value, _type, isLastOne) {
    let result = '';
    switch (chiKey.toUpperCase()) {
        case 'EQ':
            result = `(${parKey}=${checkOptType(value)})`;
            break;
        case 'NEQ':
            result = `(${parKey}<>${checkOptType(value)})`;
            break;
        case 'GT':
            result = `(${parKey}>${checkOptType(value)})`;
            break;
        case 'EGT':
            result = `(${parKey}>=${checkOptType(value)})`;
            break;
        case 'LT':
            result = `(${parKey}<${checkOptType(value)})`;
            break;
        case 'ELT':
            result = `(${parKey}<=${checkOptType(value)})`;
            break;
        case 'LIKE':
            result = `(${parKey} LIKE ${checkOptType(value)})`;
            break;
        case 'NOTLIKE':
            result = `(${parKey} NOT LIKE ${checkOptType(value)})`;
            break;
        case 'BETWEEN':
            result = `(${parKey} BETWEEN ${value.replace(',', ' AND ')})`;
            break;
        case 'NOTBETWEEN':
            result = `(${parKey} NOT BETWEEN ${value.replace(',', ' AND ')})`;
            break;
        case 'IN':
            result = `(${parKey} IN (${value}))`;
            break;
        case 'NOTIN':
            result = `(${parKey} NOT IN (${value}))`;
            break;
        default:
            result = `(${parKey}=${checkOptType(value)})`;
    }
    return isLastOne ? `${result} ` : `${result} ${_type} `;
}
function checkOptObjType(preKey, val) {
    let result = '';
    const type = Object.prototype.toString.call(val);

    if (type === '[object Object]') {
        const keys = Object.keys(val);
        const number = val._type && val._type.trim() ? 1 : 0;

        keys.forEach((item, index) => {
            if (item === '_type') {
                return;
            }

            const _type = val._type || 'AND';
            result += expressionQuery(
                preKey,
                item,
                val[item],
                _type.toUpperCase(),
                index === keys.length - 1 - number
            );
        });
    }
    else {
        result = `${preKey}=${val}`;
    }
    return `(${result}) `;
}
function getOptToString(opt) {
    let result = '';
    const optType = Object.prototype.toString.call(opt);

    if (optType === '[object Object]') {
        const _type = opt._type && opt._type.toUpperCase() || 'AND';
        const number = opt._type && opt._type.trim() ? 1 : 0;

        const keys = Object.keys(opt);
        keys.forEach((item, index) => {
            if (item === '_type') {
                return;
            }
            if (typeof (opt[item]) === 'object') {
                if (index === keys.length - 1 - number) {
                    result += `${checkOptObjType(item, opt[item])}`;
                }
                else {
                    result += `${checkOptObjType(item, opt[item])} ${_type} `;
                }
            }
            else if (index === keys.length - 1 - number) {
                result = `${result}${item}=${checkOptType(opt[item])}`;
            }
            else {
                result = `${result}${item}=${checkOptType(opt[item])} ${_type} `;
            }
        });
    }
    else if (optType === '[object Array]') {
        opt.forEach((item, index) => {
            let result1 = '';
            let number = 0;
            const _type = item._type && item._type.toUpperCase() || 'AND';
            const _nexttype = item._nexttype || 'AND';
            number = item._type && item._type.trim() ? number + 1 : number;
            number = item._nexttype && item._nexttype.trim() ? number + 1 : number;

            const keys = Object.keys(item);
            keys.forEach((chi_item, index) => {
                if (chi_item === '_type' || chi_item === '_nexttype') {
                    return;
                }
                if (result1) {
                    if (typeof (item[chi_item]) === 'object') {
                        result1 += `${_type} ${checkOptObjType(chi_item, item[chi_item])}`;
                    }
                    else {
                        result1 += `${_type} ${chi_item}=${checkOptType(item[chi_item])} `;
                    }
                }
                else if (typeof (item[chi_item]) === 'object') {
                    result1 = `${checkOptObjType(chi_item, item[chi_item])}`;
                }
                else {
                    result1 = `${chi_item}=${checkOptType(item[chi_item])} `;
                }
            });

            index === opt.length - 1
                ? result1 = `(${result1})`
                : result1 = `(${result1}) ${_nexttype.toUpperCase()}`;

            result = `${result} ${result1}`;
        });
    }
    return result;
}
function sortSelectSql(json) {
    const result = json || {};
    if (result.count || result.max || result.min || result.avg || result.sum) {
        const concatstr = (result.count ? `,${result.count}` : '')
            + (result.max ? `,${result.max}` : '')
            + (result.min ? `,${result.min}` : '')
            + (result.avg ? `,${result.avg}` : '')
            + (result.sum ? `,${result.sum}` : '');
        result.count = result.max = result.min = result.avg = result.sum = '';
        result.field ? result.field += concatstr : result.field = concatstr.substring(1);
    }
    if (!result.field) {
        result.field = '*';
    }
    if (result.table) {
        result.table = `FROM ${result.table}`;
    }
    if (result.where) {
        result.where = `WHERE ${result.where}`;
    }

    const keys = Object.keys(result);
    const keysresult = [];
    // 查询默认排序数组
    const searchSort = ['union', 'distinct', 'field', 'count', 'max', 'min', 'avg', 'sum', 'table',
        'alias', 'where', 'group', 'having', 'order', 'limit', 'page', 'comment'];
    // 排序
    keys.forEach(item1 => {
        searchSort.forEach((item2, index2) => {
            if (item1 === item2) {
                keysresult[index2] = item1;
            }
        });
    });
    return {
        sortkeys: keysresult,
        result
    };
}
function handleInsertData(data) {
    if (!data) {
        return '';
    }
    if (Array.isArray(data) && data.length === 1) {
        data = data[0];
    }

    let keys = '';
    let values = '';
    let datastr = '';

    if (Array.isArray(data)) {
        // array
        data = sortArray(data);
        keys = Object.keys(data[0]).toString();
        for (let i = 0; i < data.length; i++) {
            let items = '';
            for (const key in data[i]) {
                items = items ? `${items},${checkOptType(data[i][key])}` : checkOptType(data[i][key]);
            }
            values += `(${items}),`;
        }
        values = values.slice(0, -1);
    }
    else {
        // object
        for (const key in data) {
            keys = keys ? `${keys},${key}` : key;
            values = values !== '' ? `${values},${checkOptType(data[key])}` : checkOptType(data[key]);
        }
        values = `(${values})`;
    }
    datastr = `(${keys}) VALUES ${values}`;
    return datastr;
}
function sortArray(data) {
    const result = [];
    const item = Object.keys(data[0]);
    for (let i = 1; i < data.length; i++) {
        for (let j = 0; j < item.length; j++) {
            if (!Object.keys(data[i]).includes(item[j])) {
                item.splice(j, 1);
            }
        }
    }
    for (let i = 0; i < data.length; i++) {
        const json = {};
        for (let j = 0; j < item.length; j++) {
            json[[item[j]]] = data[i][item[j]];
        }
        result.push(json);
    }
    return result;
}
// 把查询参数转换为strng
exports.getOptToString = getOptToString;

// 检查值类型返回相应值
exports.checkOptType = checkOptType;

// 检查object值类型 返回相应值
exports.checkOptObjType = checkOptObjType;

// 表达式匹配查询
exports.expressionQuery = expressionQuery;

// 排序 生成 sql 字符串
exports.sortSelectSql = sortSelectSql;

// 处理insert批量插入data参数
exports.handleInsertData = handleInsertData;

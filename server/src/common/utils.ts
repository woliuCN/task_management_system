// 格式化id函数的第一个参数的类型的类型别名
type objInfo = {
    userId: string,
    userName?: string
}

//  格式化id函数约束接口
interface formatFn {
    (ob: objInfo, ct: number): string
}

/**
    * @description: 格式化id的形式  工号+日期
    * @param {any} params 传入的body数据
    * @return: 
**/
const formatId: formatFn = (obj: objInfo, createTime: number) => {
    let time: Date = new Date(createTime);
    let year: string = time.getFullYear().toString();
    let month: string = time.getMonth() > 8
        ? `${time.getMonth() + 1}`
        : `0${time.getMonth() + 1}`;
    let day: string = time.getDate() > 9
        ? `${time.getDate()}`
        : `0${time.getDate()}`;
    let jobNo: string = obj.userId;
    return `${jobNo}${year}${month}${day}`;
}

/*-----------------------------------------------------------------*/

// 分页查询返回sql语句函数返回值的类型别名
type pagingQueryObj = {
    condition: string, //where 查询条件语句
    constraint: string  //额外的查询约束语句
}
// 分页查询返回sql语句函数约束接口
interface pagingQueryFn {
    (args: any): pagingQueryObj
}
/**
    * @description: 分页查询返回sql语句函数(查询条件语句，额外的查询约束语句)
    * @param {any} args 
    * {
    *     startTime: 开始时间(可选),
    *     endTime: 结束时间(可选),
    *     pageSize: 每页条数,
    *     pageIndex: 页号,
    *     keyWordsFields: 关键字查询的字段,
    *     keyWords: 关键字,
    *     sortField: 排序的字段
    *     associated: 关联的条件(可选)  
    * }
    * @return: {condition:查询条件语句,constraint:额外的查询约束语句}
**/
const pagingQuery: pagingQueryFn = (args: any) => {
    let condition: string = '';
    let constraint: string = '';
    let keys: Array<string> = Object.keys(args);
    let { startTime, endTime, pageSize, pageIndex, keyWordsFields, keyWords, sortField, associated } = args;
    startTime = parseInt(startTime) || 0;
    endTime = parseInt(endTime) || null;
    pageSize = parseInt(pageSize) || 10;
    pageIndex = parseInt(pageIndex) || 1;
    keyWordsFields = keyWordsFields && keyWordsFields.map((field: string) => {
        return `${field} like "%${keyWords}%"`;
    })
    if (keys.includes('startTime') && keys.includes('endTime')) {
        condition = ` startTime >= ${startTime} `;
        if (endTime) {
            condition += ` and endTime <= ${endTime} `;
        }
        if (keyWords) {
            condition += ` and (${keyWordsFields.join(" or ")}) `;
        }
    } else {
        if (keyWords) {
            condition += ` (${keyWordsFields.join(" or ")}) `;
        }
    }
    if (associated) {  //如果有额外的关联的查询条件的话，因为表与表之间不仅有唯一id，还涉及到相关的内容，所以只能用 like来查询其id
        associated = associated.map((item: any) => {
            let newItem: string = "";
            for (const key in item) {
                newItem = `${key} = '${item[key]}'`
            }
            return newItem
        })
        condition += ` ${keyWords || startTime >= 0 ? 'and' : ''} ${associated.join("and")} `;
    }
    constraint = ` order by ${sortField} desc limit ${(pageIndex - 1) * pageSize},${pageSize} `;
    return {
        condition,
        constraint
    }
}


/*-----------------------------------------------------------------*/


/**
    * @description: session 中间件函数
    * @param {any} ctx 
    * @param {any} next
**/
const sessionMiddleWare = async (ctx: any, next: any) => {
    // 对/favicon.ico网站图标请求忽略
    if (ctx.path === '/favicon.ico') return;
    if (!ctx.session.Logining && (ctx.path.indexOf('loginValidation') === -1)) { //如果登录状态不存在或者未false,则对应未登录
        ctx.session.Logining = null; //默认设置为false,验证账号后再确认是否为true
        ctx.body = {
            retCode: 1001,
            message: '登录状态失效,请重新登录'
        }
    } else {
        await next();
    }
}


export {
    formatId,
    sessionMiddleWare,
    pagingQuery,
}
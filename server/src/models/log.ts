/*
 * @Description: 日志表对应字段
 */

//表名
const tbName = "logs";


interface Log {
    logId: string, //日志id
    content: string,   //日志内容
    createTime: number, //创建时间
    operator: string, //操作者
    sufferer: string //被操作者
}

export { tbName, Log }
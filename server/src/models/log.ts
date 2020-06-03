/*
 * @Description: 日志表对应字段
 */
//表名
const tbName = "Logs";


interface Log {
    id: string, //日志id
    content: string,   //日志内容
    createTime: string, //创建时间
}

export { tbName, Log }
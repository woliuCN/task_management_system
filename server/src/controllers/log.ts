/*
 * @Description: log表业务逻辑函数
 */
import server from '../common/index';
import { Log, tbName } from '../models/log';
import { pagingQuery } from '../common/utils';
const config = require('../config/index');
const ISDELETE_FLAG = config.ISDELETE_FLAG;
export default {
    routerName: 'log',

    /**
    * @description: 插入log表数据
    * @param content{string}   内容
    * @param operator{string}  操作者 
    * @param sufferer{string}  被操作者
    */
    async addLog(content: string, operator: string, sufferer: string = '') {
        let obj: Log = {
            content,
            operator,
            sufferer,
            createTime: new Date().getTime()
        } as Log;
        let res: object = await server.db.Insert(obj, tbName);
        // console.log(res);
    },
    /**
    * @description: get请求获取log表数据
    * @param {any} request 可能有的参数(携带在url后面的或者用?xxx='xx'&的)
    */
    async getLogList(request: any, ctx: any){
        let { field, pageSize, pageIndex,keyWords} = request.query;
        let { condition, constraint } = pagingQuery({pageSize, pageIndex, keyWords, keyWordsFields: ["content"], sortField: "logId" });
        let res: object = {};
        await server.db.Find(['count(*) as totalCount'], tbName, condition,ISDELETE_FLAG.BOTH).then(data => {
            res = {
                totalCount: data[0].totalCount,
            }
        });
        await server.db.Find(field, tbName, condition, ISDELETE_FLAG.BOTH, constraint).then(data => {
            res = {
                retCode: 200,
                data: data,
                ...res
            }
        }).catch(err => {
            res = {
                retCode: -1
            }
        })
        return res;
    }


}
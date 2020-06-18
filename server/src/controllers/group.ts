/*
 * @Description: group表业务逻辑函数
 */
import server from '../common/index';
import { Group, tbName } from '../models/group';
export default {
    routerName: 'group',
    /**
    * @description: get请求查询group表数据
    * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
    * @return:promise
    */
    async getGroupList(request: any, next: any) {
        let field: string[] = [];
        let res: object = {};
        if (request.url.indexOf('options') > 0) {
            field = ['groupId', 'groupName']
        }
        await server.db.Find(field, tbName).then((data: any) => {
            res = {
                retCoude: 200,
                data: data,
                totalCount: data.length,
            }
        }).catch((err: Error) => {
            res = {
                retCoude: -1,
            }
        });
        return res;
    },
}
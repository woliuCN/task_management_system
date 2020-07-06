/*
 * @Description: group表业务逻辑函数
 */
import server from '../common/index';
import { Group, tbName } from '../models/group';
import { User, tbName as userTbName } from '../models/user';
import { tbName as DeptTbName } from '../models/department';
const config = require('../config/index');
const PERMISSION = config.PERMISSION;
export default {
    routerName: 'group',
    /**
    * @description: get请求查询所属部门group表数据
    * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
    * @return:promise
    */
    async getGroupListByDept(request: any, next: any) {
        let deptId: number = parseInt(request.query.deptId);
        let field: string[] = ['groupId', 'groupName'];
        let condition: string = ` deptId = ${deptId} `;
        let res: object = {};
        await server.db.Find(field, tbName, condition).then((data: any) => {
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
    /**
     * @description: get 分页请求查询Group表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getPaginGroup(request: any, ctx: any) {
        let groupFields: string[] = ["groupId", "groupName", "createTime", "updateTime", "deptId", "remarks"];
        let deptFileds: string[] = ["deptName"];
        let joinType: string = "inner";
        let joinFiled: string = "deptId";
        let res: object = {};
        let { pageSize, pageIndex, keyWords } = request.query;
        pageIndex = parseInt(pageIndex) ? parseInt(pageIndex) : 1;
        pageSize = parseInt(pageSize) ? parseInt(pageSize) : 10;
        //查询条件，其他约束 
        let condition: string = "";
        let keyWordsFields: Array<string> = [`${tbName}.groupName`, `${DeptTbName}.deptName`]; //关键字的查询字段
        if (keyWords) {
            condition = keyWordsFields.map(item => {
                return `${item} like "%${keyWords}%"`;
            }).join(" or ");
        }
        let constraint: string = `limit ${(pageIndex - 1) * pageSize},${pageSize} `;
        await server.db.JoinFind(tbName, DeptTbName, groupFields, deptFileds, joinType, joinFiled, condition)
            .then(data => {
                res = {
                    totalCount: data.length,
                }
            });
        await server.db.JoinFind(tbName, DeptTbName, groupFields, deptFileds, joinType, joinFiled, condition, constraint)
            .then(data => {
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
    },

    /**
    * @description: post请求插入group表数据
    * @param {any} params 传入的body数据
    * @return: 
    **/
    async addGroup(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let group: Group = params.group;
        group = Object.assign(
            {
                ...group
            },
            {
                createTime: new Date().getTime(),
                updateTime: new Date().getTime(),
            }
        );
        return await server.db.Insert<Group>(group, tbName);
    },

    /**
    * @description: post请求修改group表数据
    * @param {any} params 传入的body数据
    * @return: 
    **/
    async updateGroup(params: any, ctx: any) {
        // let userName: string = ctx.session.user.userName;
        let userInfo:User = ctx.session.user;
        let userGroupId: number = ctx.session.user.groupId; //自己的id
        let group: Group = params.group;
        let condition: object = { groupId: group.groupId }; //更新条件 
        if (userGroupId !== group.groupId && userInfo.permission === PERMISSION.GROUP_LEADER) {
            return {
                retCode: -1,
                message: "您不能修改其他组的信息!"
            }
        }
        delete group.groupId;
        group = Object.assign(
            {
                ...group
            },
            {
                updateTime: new Date().getTime(),
            }
        );
        return await server.db.Update(group, tbName, condition);
    },

    /**
    * @description: post请求删除group表某一条数据
    * @param params 传入的body数据 
    * @return:promise
   */
    async deleteGroup(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let group: Group = params.group;
        let groupId: number = group.groupId;
        let res: object = {};
        let condition: string = ` groupId = ${groupId} `;
        let userArray: Array<User> = await server.db.Find([], userTbName, condition);
        if (userArray.length > 0) {
            res = {
                retCode: -1,
                message: '请先移除分组里面的所有成员才能删除!'
            }
        } else {
            res = await server.db.Delete(tbName, condition)
        }
        return res
    },
    /**
   * @description: get 请求根据部门id查找user
   * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
   * @return:promise
  **/
    async getUserListByGroup(request: any, ctx: any) {
        let groupId: number = parseInt(request.query.groupId);
        let res: object = {};
        let userFileds: Array<string> = ["userId", "userName", "permission"];
        let userCondition: string = ` groupId = ${groupId} `;
        await server.db.Find(userFileds, userTbName, userCondition)
            .then((data: any) => {
                res = {
                    retCode: 200,
                    data: data,
                    totalCount: data.length,
                }
            }).catch((err: Error) => {
                res = {
                    retCode: -1,
                }
            });
        return res;
    },



}
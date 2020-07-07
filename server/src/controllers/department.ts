/*
 * @Description: group表业务逻辑函数
 */
import server from '../common/index';
import { DepartMent, tbName } from '../models/department';
import { Group, tbName as groupTbName } from '../models/group';
import { tbName as userTbName, User } from '../models/user';
import { pagingQuery } from '../common/utils';
import Log from '../controllers/log';
const config = require('../config/index');
const ISDELETE_FLAG = config.ISDELETE_FLAG;
const PERMISSION = config.PERMISSION;

export default {
    routerName: 'department',
    /**
    * @description: get请求查询department表数据
    * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
    * @return:promise
    */
    async getDepartMentList(request: any, next: any) {
        let field: string[] = ['deptId', 'deptName'];
        let res: object = {};
        await server.db.Find(field, tbName).then((data: any) => {
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


    /**
     * @description: get 请求根据部门id查找user
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getUserListByDept(request: any, ctx: any) {
        let deptId: number = parseInt(request.query.deptId);
        // let groupCondition: string = ` deptId = ${deptId} `;
        let res: object = {};
        // let groups: Array<Group> = await server.db.Find([], groupTbName, groupCondition);
        // let groupIds: string = groups.map((group: Group) => {
        //     return group.groupId;
        // }).join(",");
        let userFileds: Array<string> = ["userId", "userName", "permission"];
        let userCondition: string = ` deptId = ${deptId} `;
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

    /**
     * @description: get 分页请求查询dept表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getPaginDept(request: any, ctx: any) {
        let field: string[] = [];
        let res: object = {};
        let { pageSize, pageIndex, keyWords } = request.query;
        //查询条件，其他约束
        let { condition, constraint } = pagingQuery({ pageSize, pageIndex, keyWords, keyWordsFields: ["deptName"], sortField: "deptId" });

        await server.db.Find(['count(*) as totalCount'], tbName, condition).then(data => {
            res = {
                totalCount: data[0].totalCount,
            }
        });
        await server.db.Find(field, tbName, condition, ISDELETE_FLAG.UNDELETED, constraint).then(data => {
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
     * @description: post请求插入department表数据
     * @param {any} params 传入的body数据
     * @return: 
    **/
    async addDepartMent(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let department: DepartMent = params.department;
        department = Object.assign(
            {
                ...department
            },
            {
                createTime: new Date().getTime(),
                updateTime: new Date().getTime(),
            }
        );
        await Log.addLog(`${userName}添加了部门${department.deptName}`, userName);
        return await server.db.Insert<DepartMent>(department, tbName);
    },


    /**
    * @description: post请求修改department表数据
    * @param params 传入的body数据 
    * @return:promise
    */
    async updateDepartMent(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let userInfo: User = ctx.session.user;
        let department: DepartMent = params.department;
        let condition: object = { deptId: department.deptId }; //更新条件 
        if (userInfo.deptId !== department.deptId && userInfo.permission === PERMISSION.DEPT_LEADER) {  //排除admin
            return {
                retCode: -1,
                message: "您不能修改其他部门的信息!"
            }
        }
        delete department.deptId;
        department = Object.assign(
            {
                ...department
            },
            {
                updateTime: new Date().getTime(),

            }
        );
        await Log.addLog(`${userName}修改了${department.deptName}的信息`, userName);
        return await server.db.Update(department, tbName, condition);
    },

    /**
     * @description: post请求删除department表某一条数据
     * @param params 传入的body数据 
     * @return:promise
    */
    async deleteDepartMent(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let department: DepartMent = params.department;
        let deptId: number = department.deptId;
        let res: object = {};
        let condition: string = ` deptId = ${deptId} `;
        let groupArray: Array<Group> = await server.db.Find([], groupTbName, condition);
        if (groupArray.length > 0) {
            res = {
                retCode: -1,
                message: '请先移除部门所有的分组才能删除!'
            }
        } else {
            res = await server.db.Delete(tbName, condition)
        }
        await Log.addLog(`${userName}删除了${department.deptName}`, userName);
        return res
    }
}
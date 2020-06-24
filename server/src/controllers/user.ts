/*
 * @Description: user表业务逻辑函数
 */
import server from '../common/index';
import { User, tbName } from '../models/user';
import { pagingQuery } from '../common/utils';
import Log from '../controllers/log';
const config = require('../config/index');
const ISDELETE_FLAG = config.ISDELETE_FLAG;
export default {
    routerName: 'user',
    /**
     * @description: post请求登录验证
     * @param {any} params 传入的body数据
     * @return: 
    **/
    async loginValidation(params: any, ctx: any) {
        let userId: string = params.userId;
        let password: string = params.password;
        let res: object = {};
        await server.db.Find(["userName", "passwords","permission"], tbName, `userId = "${userId}"`)
            .then((data) => {
                if (data.length > 0) {
                    if (data[0].passwords === password) {
                        res = {
                            retCode: 200,
                            message: '登录成功'
                        };
                        ctx.session.Logining = true;
                        ctx.session.userId = userId;
                        ctx.session.userName = data[0].userName;
                        ctx.session.permission = data[0].permission;
                        Log.addLog(`${data[0].userName}登录成功`, data[0].userName);
                    } else {
                        res = {
                            retCode: -1,
                            message: '密码错误'
                        }
                    }
                } else {
                    res = {
                        retCode: -1,
                        message: '用户未注册'
                    }
                }
            })
        return res;
    },

    /**
     * @description: get请求退出登录
     * @param {any} request 
     * @return: 
    **/
    async logOut(request: any, ctx: any) {
        let userName: string = ctx.session.userName;
        ctx.session.Logining = null;
        ctx.session.userId = null;
        ctx.session.userName = null;
        ctx.session.permission  = null;
        await Log.addLog(`${userName}退出登录`, userName);
        return {
            retCode: 200,
            message: '退出成功'
        }
    },
    /**
     * @description: post请求修改密码
     * @param {any} params 传入的body数据 
     * @return: 
    **/
    async changePassword(params: any, ctx: any) {
        let { oldPassword, newPassword } = params;
        let userId: string = ctx.session.userId;
        let userName: string = ctx.session.userName;
        let res: object = {};
        let data = await server.db.Find(["passwords"], tbName, `userId = "${userId}"`);
        if (data.length > 0 && data[0].passwords === oldPassword) {
            await server.db.Update({ passwords: newPassword }, tbName, { userId: userId })
                .then(data => {
                    res = data;
                })
        } else {
            res = {
                retCode: -1,
                message: '修改失败,原密码错误'
            }
        }
        await Log.addLog(`${userName}修改密码`, userName);
        return res;

    },


    /**
     * @description: post请求插入user表数据
     * @param {any} params 传入的body数据
     * @return: 
    **/
    async addUser(params: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let user: User = params.user;
        user = Object.assign(
            {
                ...user
            },
            {
                passwords: user.userId,
                userGroup: JSON.stringify(user.userGroup),
                createTime: new Date().getTime(),
                updateTime: new Date().getTime(),
                state: 1
            }
        );
        await Log.addLog(`${userName}添加了新用户${user.userName}`, userName, user.userName)
        return await server.db.Insert<User>(user, tbName);
    },
    /**
     * @description: get请求查询user表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getTotalUser(request: any, ctx: any) {
        let field: string[] = ["userId", "userName", "userGroup", "state", "createTime", "updateTime", "remarks", "deleteTime"];
        let res: object = {};
        let condition: string = "permission <2"; //排除admin 
        let isDeleteFlag: number = ISDELETE_FLAG.BOTH;
        //如果user/getUserList/options的话，则是请求两个数据段，否则请求所有数据
        if (request.url.indexOf('options') > 0) {
            field = ['userId', 'userName'];
            isDeleteFlag = ISDELETE_FLAG.UNDELETED;
        }
        await server.db.Find(field, tbName, condition, isDeleteFlag).then(data => {
            res = {
                retCode: 200,
                data: data,
                totalCount: data.length
            }
        }).catch(err => {
            res = {
                retCode: -1
            }
        })
        return res;
    },

    /**
     * @description: get 分页请求查询user表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getPaginUser(request: any, ctx: any) {
        let field: string[] = ["userId", "userName", "userGroup", "state", "createTime", "updateTime", "remarks"];
        let res: object = {};
        let { pageSize, pageIndex, keyWords } = request.query;

        //查询条件，其他约束
        let { condition, constraint } = pagingQuery({ pageSize, pageIndex, keyWords, keyWordsFields: ["userName", "userId"], sortField: "userId" })

        //要排除admin权限的人。
        if (keyWords) {
            condition += " and permission <2 ";
        } else {
            condition += " permission <2 ";
        }
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
     * @description: 更新user表某一条的数据
     * @param {any} params 传入的body数据
     * @return: promise
     */
    async updateUser(params: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let user: User = params.user;
        let condition: object = { userId: user.userId }; //更新条件 
        delete user.userId;
        user = Object.assign(
            {
                ...user
            },
            {
                userGroup: JSON.stringify(user.userGroup),
                updateTime: new Date().getTime(),
            }
        );
        await Log.addLog(`${userName}更新了用户${user.userName}的数据`, userName, user.userName);
        return await server.db.Update(user, tbName, condition);

    },

    /**
     * @description: 修改一/多条user数据的状态
     * @param {object} params 传入的{list:[xxx],data:[{state:1}]}
     * @return: promise
    **/
    async updateState(params: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let userList: Array<User> = params.list;
        let dataArray: Array<any> = params.data;
        let sufferStr: string = userList.map(user => {
            return user.userName
        }).join(','); //批量更新的人群
        await Log.addLog(`${userName}更新了用户${sufferStr}的状态为${dataArray[0].state === 0 ? "离职" : "在职"}`, userName, sufferStr);
        return await server.db.BatchUpdate<User>(tbName, userList, dataArray);
    },


    /**
     * @description: 删除一条/多条user数据
     * @param {object} params 传入的{list:{xxx}}
     * @return: promise
     */
    async deleteUser(params: { list: Array<User> }, ctx: any) {
        let userName: string = ctx.session.userName;
        let userList: Array<User> = params.list;
        let dataArray: Array<object> = [{ isDelete: 1 }, { deleteTime: new Date().getTime() }, { state: 0 }];
        let sufferStr: string = userList.map(user => {
            return user.userName
        }).join(','); //批量更新的人群
        await Log.addLog(`${userName}删除了用户${sufferStr}`, userName, sufferStr);
        return await server.db.BatchUpdate(tbName, userList, dataArray);
    },

}
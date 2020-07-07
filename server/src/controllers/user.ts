/*
 * @Description: user表业务逻辑函数
 */
import server from '../common/index';
import { User, tbName } from '../models/user';
import { tbName as groupTbName } from '../models/group';
import Log from '../controllers/log';
const config = require('../config/index');
const ISDELETE_FLAG = config.ISDELETE_FLAG;
const PERMISSION = config.PERMISSION;
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
        await server.db.Find([], tbName, `userId = "${userId}"`)
            .then((data) => {
                if (data.length > 0) {
                    if (data[0].passwords === password) {
                        res = {
                            retCode: 200,
                            message: '登录成功',
                            data: {
                                userName: data[0].userName,
                                permission: data[0].permission
                            }
                        };
                        ctx.session.user = data[0];
                        ctx.session.Logining = true;
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
        ctx.session.user = null;
        await Log.addLog(`${userName}退出登录`, userName);
        return {
            retCode: 200,
            message: '退出成功'
        }
    },

    /**
     * @description: get请求获取用户信息
     * @param {any} request 
     * @return: 
    **/
    async getUserInfo(request: any, ctx: any) {
        const userInfo: User = ctx.session.user;
        return {
            retCode: 200,
            data: {
                userId: userInfo.userId,
                userName: userInfo.userName,
                permission: userInfo.permission,
                deptId: userInfo.deptId
            },
            message: '获取成功'
        }
    },


    /**
     * @description: post请求修改密码
     * @param {any} params 传入的body数据 
     * @return: 
    **/
    async changePassword(params: any, ctx: any) {
        let { oldPassword, newPassword } = params;
        let userId: string = ctx.session.user.userId;
        let userName: string = ctx.session.user.userName;
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
        let userName: string = ctx.session.user.userName;
        let user: User = params.user;
        console.log(user);
        user = Object.assign(
            {
                ...user
            },
            {
                passwords: user.userId,
                createTime: new Date().getTime(),
                updateTime: new Date().getTime()
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
        let field: string[] = ["userId", "userName", "groupId", "state", "createTime", "updateTime", "remarks", "deleteTime"];
        let res: object = {};
        let condition: string = `permission <${PERMISSION.ADMIN}`; //排除admin 
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
        let userFileds: string[] = ["userId", "userName", "groupId", "state", "createTime", "updateTime", "remarks", "permission", "deptId"];
        let groupFileds: string[] = ["groupName"];
        let joinType: string = "left"; //连接类型
        let joinFiled: string = "groupId";  //连接字段
        let res: object = {};
        let { pageSize, pageIndex, keyWords } = request.query;
        pageIndex = parseInt(pageIndex) ? parseInt(pageIndex) : 1;
        pageSize = parseInt(pageSize) ? parseInt(pageSize) : 10;
        //查询条件，其他约束
        let condition: string = "";
        let keyWordsFields: Array<string> = [`${tbName}.userName`, `${groupTbName}.groupName`]; //关键字的查询字段
        if (keyWords) {
            keyWordsFields = keyWordsFields.map(item => {
                return `${item} like "%${keyWords}%"`;
            });
            condition = `(${keyWordsFields.join(" or ")})`;
        }
        let constraint: string = `limit ${(pageIndex - 1) * pageSize},${pageSize} `;
        //要排除admin权限的人。
        if (keyWords) {
            condition += ` and permission <${PERMISSION.ADMIN} and users.isDelete = ${ISDELETE_FLAG.UNDELETED} order by createTime desc`;
        } else {
            condition += ` permission <${PERMISSION.ADMIN} and users.isDelete = ${ISDELETE_FLAG.UNDELETED} order by createTime desc`;
        }
        await server.db.JoinFind(tbName, groupTbName, userFileds, groupFileds, joinType, joinFiled, condition)
            .then(data => {
                res = {
                    totalCount: data.length,
                }
            });
        await server.db.JoinFind(tbName, groupTbName, userFileds, groupFileds, joinType, joinFiled, condition, constraint)
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
     * @description: 更新user表某一条的数据
     * @param {any} params 传入的body数据
     * @return: promise
    **/
    async updateUser(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let user: User = params.user;
        let condition: object = { userId: user.userId }; //更新条件 
        delete user.userId;
        user = Object.assign(
            {
                ...user
            },
            {
                updateTime: new Date().getTime(),
            }
        );
        await Log.addLog(`${userName}更新了用户${user.userName}的数据`, userName, user.userName);
        return await server.db.Update(user, tbName, condition);

    },

    /**
     * @description: 同时修改一/多条user数据
     * @param {object} params 传入的{list:[xxx],data:[{state:1}]}
     * @return: promise
    **/
    async updateState(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
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
        let userName: string = ctx.session.user.userName;
        let userList: Array<User> = params.list;
        // let dataArray: Array<object> = [{ isDelete: 1 }, { deleteTime: new Date().getTime() }, { state: 0 }];
        let sufferStr: string = userList.map(user => {
            return user.userName
        }).join(','); //批量更新的人群
        let userIds: string = userList.map(user => {
            return `'${user.userId}'`
        }).join(',');
        await Log.addLog(`${userName}删除了用户${sufferStr}`, userName, sufferStr);
        return await server.db.Delete(tbName, `userId in (${userIds})`);
    },


    /**
     * @description: post 重置用户密码
     * @param {object} params 传入的{list:[xxx]}
     * @return: promise
     */
    async resetPassword(params: { list: Array<User> }, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let userList: Array<User> = params.list;
        let dataArray: Array<object> = [{ passwords: '123456' }];
        let sufferStr: string = userList.map(user => {
            return user.userName;
        }).join(','); //批量更新的人群
        await Log.addLog(`${userName}重置了用户${sufferStr}的密码`, userName, sufferStr);
        let res: any = await server.db.BatchUpdate(tbName, userList, dataArray);
        res.message = '重置成功,密码为123456';
        return res;
    }

}
/*
 * @Description: user表业务逻辑函数
 */
import server from '../common/index';
import { User, tbName } from '../models/user';
import { pagingQuery } from '../common/utils';
// const path = require('path');
// const fs = require('fs');
const config = require('../config/index');
const ISDELETE_FLAG = config.ISDELETE_FLAG;
export default {
    routerName: 'user',
    /**
     * @description: post请求登录验证
     * @param {any} params 传入的body数据
     * @return: 
     */
    async loginValidation(params: any, ctx: any) {
        let userId = params.userId;
        let password = params.password;
        let res: object = {};
        await server.db.Find(["passwords"], tbName, `userId = "${userId}"`)
            .then((data) => {
                if (data.length > 0) {
                    if (data[0].passwords === password) {
                        res = {
                            retCode: 200,
                            message: '登录成功'
                        };
                        ctx.session.Logining = true;
                        ctx.session.userId = userId;
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
     * @description: post请求插入user表数据
     * @param {any} params 传入的body数据
     * @return: 
     */
    async addUser(params: any, next: any) {
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
        return await server.db.Insert<User>(user, tbName);
    },
    /**
     * @description: get请求查询user表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getTotalUser(request: any, next: any) {
        let field: string[] = ["userId","userName","userGroup","state","createTime","updateTime","remarks"];
        let res: object = {};

        //如果user/getUserList/options的话，则是请求两个数据段，否则请求所有数据
        if (request.url.indexOf('options') > 0) {
            field = ['userId', 'userName'];
        }
        await server.db.Find(field, tbName).then(data => {
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
    async getPaginUser(request: any, next: any) {
        let field: string[] = ["userId","userName","userGroup","state","createTime","updateTime","remarks"];
        let res: object = {};
        let { pageSize, pageIndex, keyWords } = request.query;

        //查询条件，其他约束
        let { condition, constraint } = pagingQuery({ pageSize, pageIndex, keyWords, keyWordsFields: ["userName", "userId"], sortField: "userId" })
        await server.db.Find(['count(*) as totalCount'], tbName, condition).then(data => {
            res = {
                totalCount: data[0].totalCount,
            }
        });
        await server.db.Find(field, tbName, condition, ISDELETE_FLAG.UNDELETED, constraint).then(data => {
            // data = data.filter((user:User)=>{
            //     return user.userName !== 'admin'
            // })
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
    async updateUser(params: any, next: any) {
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
        return await server.db.Update(user, tbName, condition);

    },

    /**
     * @description: 修改一/多条user数据的状态
     * @param {object} params 传入的{list:{xxx},data:[{state:1}]}
     * @return: promise
    **/
    async updateState(params: any, next: any) {
        let taskList: Array<User> = params.list;
        let dataArray: Array<object> = params.data;
        return await server.db.BatchUpdate<User>(tbName, taskList, dataArray);
    },


    /**
     * @description: 删除一条/多条user数据
     * @param {object} params 传入的{list:{xxx}}
     * @return: promise
     */
    async deleteUser(params: { list: Array<User> }, next: any) {
        let userList: Array<User> = params.list;
        let dataArray: Array<object> = [{ isDelete: 1 }];
        return await server.db.BatchUpdate(tbName, userList, dataArray);
    },

    // async addTest(params: any) {
    //     let user: User = {} as User;
    //     user = Object.assign(
    //         {
    //             ...params,
    //         },
    //         {
    //             userGroup: JSON.stringify(params.userGroup),
    //         }
    //     );
    //     return await server.db.Insert<User>(user, tbName);
    // },
    // async search(params: any, next: any) {
    //     let fsPath = path.resolve(__dirname, '../../../data/userInfo.json');
    //     await new Promise((resolve, reject) => {
    //         fs.readFile(fsPath, 'utf8', (err: any, data: any) => {
    //             if (err) throw err;
    //             resolve(data);
    //         });
    //     }).then((data: any) => {
    //         JSON.parse(data).map((item: any)=>{
    //             this.addTest(item).then(res=>{
    //                 console.log(res);
    //             })
    //         })
    //     })
    // }

}
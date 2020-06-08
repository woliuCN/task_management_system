/*
 * @Description: user表业务逻辑函数
 */
import server from '../common/index';
import { User, tbName } from '../models/user';
const fs = require('fs');
const path = require('path');
export default {
    routerName: 'user',

    /**
     * @description: 插入user表数据
     * @param {any} params 传入的body数据
     * @return: 
     */
    async add(params: any, ctx: any) {
        let user: User = params.user;
        return await server.db.Insert<User>(user, tbName);
    },

    /**
     * @description: 查询user表数据
     * @param {any} params 传入的body数据
     * @return: 
     */
    async find(params: any, ctx: any) {
        let field: string[] = params.field; //查询字段
        let condition: string = params.condition; //查询条件 
        return await server.db.Find(field, tbName, condition);
    },

    /**
     * @description: 更新user表数据
     * @param {any} params 传入的body数据
     * @return: 
     */
    async update(params: any, ctx: any) {
        let updateFieldObj: object = params.updateFieldObj; //更新的字段对象
        let condition: string = params.condition; //更新条件 
        return await server.db.Update(updateFieldObj, tbName, condition);
    },


    async search(params: any,ctx: any){
        let fsPath = path.resolve(__dirname,'../../../data/projectInfo.txt');
        let res :any;
        await new Promise((resolve, reject) => {
            fs.readFile(fsPath,'utf8',(err: any,data: any)=>{     
                if(err) throw err;
                resolve(data);
            });
        }).then((data: any) => {
            res = data
        })
        return res;
    }

}
/*
 * @Description: 数据库操作封装
 */
import mysql from 'mysql';
const config = require('../config/index');
const pool = mysql.createPool(config.MYSQL);//建立数据连接池
const ISDELETE_FLAG = config.ISDELETE_FLAG;
export default {

    /**
     * @description: 查询操作
     * @param {string[]} arr 查询字段 
     * @param {string} tbName 查询表 
     * @param {string} where 查询条件  
     * @param {number} isDelete 查询是否删除的记录，（0：查未删除，1：查删除，2：两者都查）
     * @param {string} constrain 其他约束，如order by, limit 操作
     * @return: promise
     */
    async Find(arr: string[] = [], tbName: string, where: string = '', isDelete: number = ISDELETE_FLAG.UNDELETED, constrain: string = '') {
        let field: string = "";
        let sqlStr: string = "";
        let res: any;
        if (arr.length == 0) {
            field = "*";
        } else {
            field = arr.join(",");
        }
        if (where !== '') {
            sqlStr = ` select ${field} from ${tbName} where ${where} `;
            switch (isDelete) {
                case ISDELETE_FLAG.UNDELETED:
                case ISDELETE_FLAG.DELETED:
                    sqlStr += ` and isDelete = ${isDelete} `;
                    break;
                case ISDELETE_FLAG.BOTH:
                default:
                    break;
            }
            sqlStr += constrain;
        } else {
            sqlStr = `select ${field} from ${tbName} `;
            switch (isDelete) {
                case ISDELETE_FLAG.UNDELETED:
                case ISDELETE_FLAG.DELETED:
                    sqlStr += ` where isDelete = ${isDelete} `;
                    break;
                case ISDELETE_FLAG.BOTH:
                default:
                    break;
            }
            sqlStr += constrain;
        }
        // return await this.sql(sqlStr);
        await this.sql(sqlStr).then((data: any) => {
            res = data;
        }).catch((err: Error) => {
            console.log(err);
        })
        return res;
    },

    /**
     * @description: 插入操作
     * @param {T} obj 插入的数据结构 
     * @param {T} tbName  表名
     * @return: {retCode:xx,message:'xx'}
     * @example: 
     */
    async Insert<T>(obj: T, tbName: string) {
        let keys: string = "";
        let values: string = "";
        let res: object = {};
        for (let key in obj) {
            keys += "," + key;
            values += typeof (obj[key]) === 'string' ? ",'" + obj[key] + "'" : "," + obj[key];
        }
        let sqlStr = `insert into ${tbName} (${keys.slice(1)}) values (${values.slice(1)})`;
        await this.sql(sqlStr)
            .then((data: object) => {
                res = {
                    retCode: 200,
                    message: '插入成功'
                }
            }).catch((err: Error) => {
                res = {
                    retCode: -1,
                    message: '插入失败'
                }
            })
        return res;
    },

    /**
    * @description: 批量插入操作
    * @param {T} arr 插入的数据结构 
    * @param {T} tbName  表名
    * @return: {retCode:xx,message:'xx'}
    * @example: 
    */
    async BatchInsert<T>(arr: Array<T>, tbName: string) {
        let keys: string = "";
        let valuesArr: Array<string> = [];
        let res: object = {};
        for (let key in arr[0]) {
            keys += "," + key;
        }
        arr.map(item => {
            let values: string = "";
            for (let key in item) {
                values += typeof (item[key]) === 'string' ? ",'" + item[key] + "'" : "," + item[key];
            }
            valuesArr.push(`(${values.slice(1)})`);
        })
        let sqlStr = `insert into ${tbName} (${keys.slice(1)}) values ${valuesArr.join(',')}`;
        await this.sql(sqlStr)
            .then((data: object) => {
                res = {
                    retCode: 200,
                    message: '插入成功'
                }
            }).catch((err: Error) => {
                res = {
                    retCode: -1,
                    message: '插入失败'
                }
            })
        console.log(res);
        return res;
    },


    /**
     * @description: 更新操作
     * @param {any} obj 更新的对象{key,value}
     * @param {string} tbName 表名
     * @param {string} conditions 条件
     */

    async Update(obj: any, tbName: string, conditions: any) {
        let values: string = "";
        let conditionStr: string = "";
        let res: object = {};
        for (let key in obj) {
            values += "," + `${key}=${typeof obj[key] === 'string' ? "'" + obj[key] + "'" : obj[key]}`;
        }
        for (let key in conditions) {
            conditionStr += `${key} = "${conditions[key]}" ;`;
        }
        let sqlStr = `update ${tbName} set ${values.slice(1)} where ${conditionStr}`;
        await this.sql(sqlStr).then((data: any) => {
            res = {
                retCode: 200,
                message: '更新成功'
            }
        }).catch((err: Error) => {
            res = {
                retCode: -1,
                message: '更新失败'
            }
        });

        return res;
    },


    /**
    * @description: 批量更新某个/某些相同的字段的相同值
    * @param {string} tbName 表名
    * @param {Array<T>} conditions 待更新的列表数据
    * @param {any} dataArray 更新的字段及其数据
    */
    async BatchUpdate<T>(tbName: string, conditions: Array<T>, dataArray: any) {
        let conditionStr: string = "";  //条件字符串
        let conditionArr: Array<string | number> = [];
        let dataObjStr: string = "";  //更新的数据对象字符串
        let field: string = Object.keys(conditions[0]).find(item => { return item.indexOf('id') }) as string;
        let res: object = {};
        let message: string = "更新";
        for (let item of conditions) {
            if (typeof item[field] === 'string') {
                conditionArr.push(`"${item[field]}"`);
            } else {
                conditionArr.push(item[field]);
            }
        }
        conditionStr = conditionArr.join(',');
        dataArray = dataArray.map((data: any) => {
            let str: string = "";
            for (let key in data) {
                str = `${key} = ${data[key]}`
                if (key === 'isDelete') {
                    message = "删除"
                }
            }
            return str;
        })
        dataObjStr = dataArray.join(',');
        let sqlStr = `update ${tbName} set ${dataObjStr} , updateTime = ${new Date().getTime()} where ${field} in (${conditionStr})`;
        await this.sql(sqlStr).then((data: any) => {
            res = {
                retCode: 200,
                message: `${message}成功`
            }
        }).catch((err: Error) => {
            res = {
                retCode: -1,
                message: `${message}失败`
            }
        });
        return res;
    },
    /**
    * @description: 删除操作
    * @param {string} tbName 表名
    * @param {string} where 条件
    * @return: true/false
    * @example delete('User',"id=21") 删除单条记录
    *          delete('Users',"id in(1,2,3)") 删除多条记录
    */
    async Delete(tbName: string, conditions: string) {
        let sqlStr = `delete from  ${tbName} where ${conditions}`;
        let res: object = {};
        await this.sql(sqlStr).then((data: any) => {
            res = {
                retCode: 200,
                message: '删除成功'
            }
        }).catch((err: Error) => {
            res = {
                retCode: -1,
                message: '删除失败'
            }
        });
        return res;
    },

    /**
     * @description: 执行sql语句
     * @param {string} sql
     * @return: 
     * @example: sql('select * from xxxx')
     */
    async sql(sql: string, args: any = '') {
        let res: any //返回值
        await new Promise((resolve, reject) => {
            pool.getConnection((err: any, connection: any) => {
                if (err) {
                    reject("连接错误" + err);
                } else {
                    connection.query(sql, args, (err: any, result: any) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                        connection.release()  //释放当前操作的连接
                    });
                }
            })
        }).then((data: any) => {
            res = data;
        }).catch((err: string) => {
            throw new Error(err);
        })
        return res
    }

}
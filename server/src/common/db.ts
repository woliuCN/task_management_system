/*
 * @Description: 数据库操作封装
 */
import mysql from 'mysql';
const config = require('../config/index');
const pool = mysql.createPool(config.MYSQL);//建立数据连接池

export default{

    /**
     * @description: 查询操作
     * @param {string[]} arr 查询字段 
     * @param {string} tbName 查询表 
     * @param {string} where 查询条件  
     * @return: []
     * @example: Find([],User);
     */    
    async Find(arr:string[],tbName:string,where:string = ''){
        let field:string = "";
        if(arr.length==0){
            field = "*";
        }else{
            field = arr.join(" ");
        }
        let sqlStr = `select ${field} from ${tbName} where ${where}`;
        return await this.sql(sqlStr);
    },

    /**
     * @description: 插入操作
     * @param {T} obj 插入的数据结构 
     * @param {T} tbName  表名
     * @return: true / false
     * @example: 
     */    
    async Insert<T>(obj:T,tbName:string){
        let keys :string = "";
        let values : string = "";
        for (let  key in obj) {
            keys += ","+key;
            values += typeof (obj[key]) ==='string'? ",'"+obj[key]+"'": ","+obj[key]; 
        }
        let sqlStr = `insert into ${tbName} (${keys.slice(1)}) values (${values.slice(1)})`;
        console.log(sqlStr);
        let res:any = await this.sql(sqlStr);
        return res;
    },    

    /**
     * @description: 更新操作
     * @param {any} obj 更新的对象{key,value}
     * @param {string} tbName 表名
     * @param {string} conditions 条件
     * @return: true/false
     * @example: 
     */    

    async Update(obj:any,tbName:string,conditions:string){
        let values = "";
        for(let key in obj){
           values +=","+`${key}=${typeof obj[key]==='string' ?"'"+obj[key]+"'" :obj[key]}`; 
        }
        
        let sqlStr = `update ${tbName} set ${values.slice(1)} where ${conditions}`;
        let res :any = await this.sql(sqlStr);
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
    async Delete(tbName:string,conditions:string){
        let sqlStr = `delete from  ${tbName} where ${conditions}`;
        let res :any = await this.sql(sqlStr);
        return res;
    },

    
    /**
     * @description: 执行sql语句
     * @param {string} sql
     * @return: 
     * @example: sql('select * from xxxx')
     */     
    async sql (sql:string,args:any=''){
        let res :any //返回值
        await new Promise((resolve,reject)=>{
            pool.getConnection((err:any,connection:any)=>{
                 if(err){
                    reject("连接错误"+err);
                }else{
                    connection.query(sql,args,(err:any,result:any)=>{
                        if(err){
                            reject("执行sql语句出错"+err)
                        }else{
                            resolve(result)
                        }
                        connection.release()  //释放当前操作的连接
                    });
                }   
            })
        }).then((data:any)=>{
            res = data    
        })
        return res  
    }

}
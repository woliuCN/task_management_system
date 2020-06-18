/*
 * @Description: task表业务逻辑函数
 */
import { formatId, pagingQuery } from '../common/utils';
import server from '../common/index';
import { Task, tbName } from '../models/task';
const config = require('../config/index');
// const path = require('path');
// const fs = require('fs');
const ISDELETE_FLAG = config.ISDELETE_FLAG;

export default {
    routerName: 'task',

    /**
     * @description: post请求插入task表数据
     * @param {any} params 传入的body数据
     * @return: 
     */
    async addTask(params: any, next: any) {
        let task: Task = {} as Task;
        let taskId: string = '';
        let createTime: number = new Date().getTime(); //创建时间
        let updateTime: number = new Date().getTime(); //修改时间
        taskId = formatId(params.task.belonger, params.task.startTime);
        let duplicateLength: number = 0;
        await server.db.Find(['taskId'], tbName, `taskId like "%${taskId}%"`, ISDELETE_FLAG.BOTH).then((data: Array<string>) => {
            duplicateLength = data.length;
        });
        taskId = duplicateLength === 0 ? taskId : `${taskId}${duplicateLength - 1}`;
        task = Object.assign(
            {
                taskId,
                ...params.task,
                createTime,
                updateTime
            },
            {
                belonger: JSON.stringify(params.task.belonger),
                project: JSON.stringify(params.task.project)
            }
        );
        return await server.db.Insert<Task>(task, tbName);
    },
    // async addTest(params: any) {
    //     let task: Task = {} as Task;
    //     task = Object.assign(
    //         {
    //             ...params,
    //         },
    //         {
    //             belonger: JSON.stringify(params.belonger),
    //             project: JSON.stringify(params.project)
    //         }
    //     );
    //     return await server.db.Insert<Task>(task, tbName);
    // },
    /**
     * @description: get请求查询task表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getTotalTask(request: any, next: any) {
        let field: string[] = [];
        let res: object = {};
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
     * @description: get 请求分页查询task表数据
     * @param {any} request 可能有的参数(携带在url后面的或者用?xxx='xx'&的)
     * @return: 
     */
    async getPaginTask(request: any, next: any) {
        let res: object = {};
        let { field, startTime, endTime, pageSize, pageIndex, keyWords } = request.query;;

        //查询条件，其他约束
        let { condition, constraint } = pagingQuery({ startTime, endTime, pageSize, pageIndex, keyWords, keyWordsFields: ["belonger", "project", "content"], sortField: "taskId" });
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
     * @description: 更新task表数据
     * @param {any} params 传入的整个task对象
     * @return: promise
     */
    async updateTask(params: any, next: any) {
        let task: Task = params.task;
        let condition: object = { taskId: task.taskId }; //更新条件 
        delete task.taskId;
        task = Object.assign(
            {
                ...task
            },
            {
                updateTime: new Date().getTime(),
                belonger: JSON.stringify(params.task.belonger),
                project: JSON.stringify(params.task.project)
            }
        );
        return await server.db.Update(task, tbName, condition);
    },

    /**
     * @description: 修改一/多条task数据的状态
     * @param {object} params 传入的{list:[{xxx},data:[{state:1}]]}
     * @return: promise
    **/
    async updateState(params: any, next: any) {
        let taskList: Array<Task> = params.list;
        let dataArray: Array<object> = params.data;
        return await server.db.BatchUpdate<Task>(tbName, taskList, dataArray);
    },

    /**
     * @description: 删除一条/多条task数据
     * @param {object} params 传入的{list:[{xxx}]}
     * @return: promise
    **/
    async deleteTask(params: { list: Array<Task> }, next: any) {
        let taskList: Array<Task> = params.list;
        let dataArray: Array<object> = [{ isDelete: 1 }];
        return await server.db.BatchUpdate<Task>(tbName, taskList, dataArray);
    },


    // async search(params: any, next: any) {
    //     let fsPath = path.resolve(__dirname, '../../../data/taskInfo.json');
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
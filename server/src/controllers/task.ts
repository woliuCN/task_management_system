/*
 * @Description: task表业务逻辑函数
 */
import { formatId, pagingQuery } from '../common/utils';
import { exportPerformanceExcel, getWeeksByTime, exportWeeklyExcel, importTaskExcel } from '../common/excel';
import server from '../common/index';
import { Task, tbName } from '../models/task';
import Log from '../controllers/log';
const config = require('../config/index');
const path = require('path');
const fs = require('fs');
const ISDELETE_FLAG = config.ISDELETE_FLAG;

export default {
    routerName: 'task',

    /**
     * @description: post请求插入task表数据
     * @param {any} params 传入的body数据
     * @return: 
     */
    async addTask(params: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let sufferer: string = params.task.belonger.userName;
        let task: Task = {} as Task;
        let taskId: string = '';
        let createTime: number = new Date().getTime(); //创建时间
        let updateTime: number = new Date().getTime(); //修改时间
        taskId = formatId(params.task.belonger, params.task.startTime);
        let duplicateLength: number = 0; //重复的数据的长度
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
        await Log.addLog(`${userName}添加了${sufferer}的新的任务,任务ID是${taskId}`, userName, sufferer);
        return await server.db.Insert<Task>(task, tbName);
    },
  
    /**
     * @description: get请求查询task表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getTotalTask(request: any, ctx: any) {
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
     * @return: promise
     */
    async getPaginTask(request: any, ctx: any) {
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
    async updateTask(params: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let sufferer: string = params.task.belonger.userName;
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
        await Log.addLog(`${userName}修改了${sufferer}的任务相关信息,任务ID是${params.task.taskId}`, userName, sufferer);
        return await server.db.Update(task, tbName, condition);
    },

    /**
     * @description: 修改一/多条task数据的状态
     * @param {object} params 传入的{list:[{xxx}],data:[{state:1}]]}
     * @return: promise
    **/
    async updateState(params: any, ctx: any) {
        const stateMap = { 0: '未启动', 1: '进行中', 2: '完成', 3: '挂起' };
        let userName: string = ctx.session.userName;
        let taskList: Array<Task> = params.list;
        let dataArray: Array<any> = params.data;
        let sufferNameStr: string = taskList.map((task: any) => {
            return task.belonger.userName
        }).join(','); //批量更新的人群
        let sufferIdStr: string = taskList.map((task: any) => {
            return task.userId
        }).join(',');
        await Log.addLog(`${userName}修改了${sufferNameStr}的任务的状态为${stateMap[dataArray[0].state]},任务ID是${sufferIdStr}`, userName, sufferNameStr);
        return await server.db.BatchUpdate<Task>(tbName, taskList, dataArray);
    },

    /**
     * @description: 删除一条/多条task数据
     * @param {object} params 传入的{list:[{xxx}]}
     * @return: promise
    **/
    async deleteTask(params: { list: Array<Task> }, ctx: any) {
        let userName: string = ctx.session.userName;
        let taskList: Array<Task> = params.list;
        // let dataArray: Array<object> = [{ isDelete: 1 }];
        let sufferNameStr: string = taskList.map((task: any) => {
            return task.belonger.userName
        }).join(','); //批量更新的人群
        let sufferIdStr: string = taskList.map((task: any) => {
            return `"${task.taskId}"`;
        }).join(',');
        await Log.addLog(`${userName}删除了${sufferNameStr}的任务,任务ID是${sufferIdStr}`, userName, sufferNameStr);
        // return await server.db.BatchUpdate<Task>(tbName, taskList, dataArray);
        return await server.db.Delete(tbName,`taskId in (${sufferIdStr})`);
    },

    /**
     * @description: get请求导出个人绩效表
     * @param {object} request 参数
     * @return: promise
    **/
    async personalPerformanceDownload(request: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let { startTime, endTime } = request.query;
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);
        let fields: Array<string> = ["belonger as 'name'", "sum(state = 2) as 'completed_task_num'", "sum(taskType = 0) as 'plan_task_num'", "sum(taskType = 1) as 'add_task_num'"];
        let constrain: string = "group by belonger";
        let duration: string = `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`;//时间间隔
        let weeks: any = getWeeksByTime(startTime, endTime);
        let sheetName: string = '个人绩效';
        let promiseAll: any;
        let data: Array<any> = []; //处理后的数据
        let res: any; //返回的数据
        let columns = [
            { header: '周', key: 'weeks', width: 25 },
            { header: '姓名', key: 'name', width: 10 },
            { header: '完成任务数', key: 'completed_task_num', width: 10 },
            { header: '计划任务数', key: 'plan_task_num', width: 10 },
            { header: '新增任务数', key: 'add_task_num', width: 10 }
        ];

        //分组获取每段时间的任务
        promiseAll = weeks.map((week: any) => {
            //要处理结束时间是当天的23:59:59
            let condition: string = `(startTime >= ${new Date(week.startTime).getTime()} and endTime <= ${new Date(week.endTime + ' 23:59:59').getTime()})`;
            return server.db.Find(fields, tbName, condition, ISDELETE_FLAG.UNDELETED, constrain);
        })
        await Promise.all(promiseAll).then((res: any) => {
            for (let i = 0; i < weeks.length; i++) {
                res[i] = res[i].map((item: any) => {
                    item.name = JSON.parse(item.name).userName;
                    item.weeks = `${weeks[i].startTime} 至 ${weeks[i].endTime}`;
                    return item;
                })
                data = [...data, ...res[i]];
            }
        })

        //导出excel表
        await exportPerformanceExcel(sheetName, columns, data).then(() => {
            let fileName: string = `${sheetName}(${duration}).xlsx`;
            ctx.attachment(fileName);
            res = fs.readFileSync(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`));
            fs.unlink(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`), (err: Error) => {
                if (err) throw err;
                console.log(`${sheetName}文件已删除`);
            });

        });
        await Log.addLog(`${userName}导出了个人绩效表,时间范围是${duration}`, userName);
        return res;
    },


    /**
     * @description: get请求导出月绩效表
     * @param {object} request 参数
     * @return: promise
    **/
    async monthPerformanceDownload(request: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let { startTime, endTime } = request.query;
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);
        let fields: Array<string> = ["project as 'projectName'", "content", "state", "belonger as 'userName'"];
        let constrain: string = "order by belonger asc";
        let condition: string = `(startTime >= ${startTime} and endTime <= ${endTime})`;
        let sheetName: string = '月绩效';
        let duration: string = `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`;//时间间隔
        let data: Array<any> = []; //处理后的数据
        let res: any; //返回的数据
        let columns = [
            { header: '序号', key: 'index', width: 10 },
            { header: '项目名称', key: 'projectName', width: 30 },
            { header: '任务内容', key: 'content', width: 70 },
            { header: '完成状况', key: 'state', width: 10 },
            { header: '任务负责人', key: 'userName', width: 10 }
        ]
        await server.db.Find(fields, tbName, condition, ISDELETE_FLAG.UNDELETED, constrain).then((res: any) => {
            data = res.map((item: any, index: number) => {
                item.index = index + 1;
                item.projectName = JSON.parse(item.projectName).projectName;
                item.userName = JSON.parse(item.userName).userName;
                item.state = item.state == 2 ? '完成' : '未完成'
                return item;
            })
        })
        await exportPerformanceExcel(sheetName, columns, data).then(() => {
            let fileName: string = `${sheetName}(${duration}).xlsx`;
            ctx.attachment(fileName);
            res = fs.readFileSync(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`));
            fs.unlink(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`), (err: Error) => {
                if (err) throw err;
                console.log(`${sheetName}文件已删除`);
            });

        });
        await Log.addLog(`${userName}导出了月绩效表,时间范围是${duration}`, userName);
        return res;
    },

    /**
     * @description: get请求导出周报表
     * @param {object} request 参数
     * @return: promise
    **/
    async weeklyDownload(request: any, ctx: any) {
        let userName: string = ctx.session.userName;
        let { startTime, endTime } = request.query;
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);
        let constrain: string = "order by taskId asc";
        let condition: string = `(startTime >= ${startTime} and endTime <= ${endTime})`;
        let sheetName: string = '周报';
        let duration: string = `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`; //时间间隔
        let data: Array<any> = []; //处理后的数据
        let res: any; //返回的数据
        await server.db.Find([], tbName, condition, ISDELETE_FLAG.UNDELETED, constrain).then((res: any) => {
            data = res;
        })
        await exportWeeklyExcel(sheetName, data, startTime, endTime).then(() => {
            let fileName: string = `${sheetName}(${duration}).xlsx`;
            ctx.attachment(fileName);
            ctx.type = '.xlsx';
            res = fs.readFileSync(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`));
            fs.unlink(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`), (err: Error) => {
                if (err) throw err;
                console.log(`${sheetName}文件已删除`);
            });

        });
        await Log.addLog(`${userName}导出了周报表,时间范围是${duration}`, userName);
        return res;
    },

    /**
     * @description: get请求下载模板
     * @param {object} request 参数
     * @return: promise
    **/
    async templateDownload(request: any, ctx: any) {
        let fileName = '模板.xlsx';
        let res: any; //返回的数据
        ctx.attachment(fileName);
        ctx.type = '.xlsx';
        res = fs.readFileSync(path.resolve(__dirname, "../attachement/template.xlsx"));
        return res;
    },

    /**
     * @description: post请求导入文件批量增加
     * @param {object} request 参数
     * @return: promise
    **/
    async uploadFile(params: any, ctx: any) {
        let userName: string = ctx.session.userName;
        const file: any = ctx.request.files.file;
        const fileds: Array<string> = ['taskId', 'project', 'content'];
        const userMap: Array<object> = await server.db.Find(["userId", "userName"], "users");
        const projectMap: Array<object> = await server.db.Find(["projectId", "projectName"], "projects");
        const data: Array<any> = await importTaskExcel(file.path, fileds, userMap, projectMap);
        console.log(userName)
        await Log.addLog(`${userName}批量导入了任务表`, userName);
        return await server.db.BatchInsert(data, tbName);
    }
 
}
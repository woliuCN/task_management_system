/*
 * @Description: task表业务逻辑函数
 */
import { formatId, pagingQuery } from '../common/utils';
import { exportPerformanceExcel, getWeeksByTime, exportWeeklyExcel, exportWeekPlanExcel, importTaskExcel } from '../common/excel';
import server from '../common/index';
import { Task, tbName } from '../models/task';
import { User, tbName as userTbName } from '../models/user';
import { Group, tbName as groupTbName } from '../models/group';
import { tbName as projectTbName } from '../models/project';
import Log from '../controllers/log';
const config = require('../config/index');
const path = require('path');
const fs = require('fs');
const ISDELETE_FLAG = config.ISDELETE_FLAG;
const TASK_STATE = config.TASK_STATE;
const PERMISSION = config.PERMISSION;
export default {
    routerName: 'task',
    

    /**
     * @description: 根据deptId查询部门成员
     * @param {Number} deptId 部门id 
     * @return: 
     */
    async getUserIdListByDeptId(deptId: number){
        let users: Array<User>;
        let userIdList: Array<string>
        // let groups: Array<Group>;
        // let groupIdList: Array<number>;
        // groups = await server.db.Find([], groupTbName, ` deptId = ${deptId} `);
        // groupIdList = groups.map((group: Group) => {
        //     return group.groupId;
        // })
        users = await server.db.Find([], userTbName, ` deptId = ${deptId}`);
        userIdList = users.map((user: User) => {
            return `'${user.userId}'`;
        })
        return userIdList;
    },

    /**
     * @description: post请求插入task表数据
     * @param {any} params 传入的body数据
     * @return: 
     */
    async addTask(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let sufferer: string = params.task.belongerName;
        let task: Task = {} as Task;
        let taskId: string = '';
        let createTime: number = new Date().getTime(); //创建时间
        let updateTime: number = new Date().getTime(); //修改时间
        taskId = formatId(params.task.belongerId, params.task.startTime)
        // let duplicateLength: number = 0; //重复的数据的长度
        // await server.db.Find(['taskId'], tbName, `taskId like "%${taskId}%"`, ISDELETE_FLAG.BOTH).then((data: Array<string>) => {
        //     duplicateLength = data.length;
        // });
        // taskId = duplicateLength === 0 ? taskId : `${taskId}${duplicateLength - 1}`;
        task = Object.assign(
            {
                taskId,
                ...params.task,
                createTime,
                updateTime
            },
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
        let userInfo: User = ctx.session.user; //获取登录的用户信息
        let users: Array<User>; //如果不是成员的话查询旗下的用户数组
        let userIdList: Array<string> //用户id集合
        let res: object = {};
        let { field, startTime, endTime, pageSize, pageIndex, keyWords } = request.query;

        //查询条件，其他约束
        let { condition, constraint } = pagingQuery({ startTime, endTime, pageSize, pageIndex, keyWords, keyWordsFields: ["belongerName", "projectName", "content"], sortField: "taskId" });

        switch (userInfo.permission) {
            case PERMISSION.MEMBER:  //如果登录的用户是普通成员的话
                condition += ` and belongerId = '${userInfo.userId}' `;
                break;
            case PERMISSION.GROUP_LEADER: //如果是组长的话，需要查询到旗下所有成员的任务
                users = await server.db.Find([], userTbName, ` groupId = ${userInfo.groupId} `);
                userIdList = users.map((user: User) => {
                    return `'${user.userId}'`;
                })
                condition += ` and belongerId in (${userIdList.join(",")}) `;
                break;
            case PERMISSION.DEPT_LEADER: //如果是部门管理员的话,需要查询到旗下所有小组的所有成员的任务
                // let groups: Array<Group> = await server.db.Find([], groupTbName, ` groupId = ${userInfo.groupId} `);
                // let deptId: number = groups[0].deptId;
                let deptId: number = userInfo.deptId;
                // let groupIdList: Array<number>;
                // groups = await server.db.Find([], groupTbName, ` deptId = ${deptId} `);
                // groupIdList = groups.map((group: Group) => {
                //     return group.groupId;
                // })
                // users = await server.db.Find([], userTbName, ` groupId in (${groupIdList.join(",")})`);
                // userIdList = users.map((user: User) => {
                //     return `'${user.userId}'`;
                // })
                userIdList = await this.getUserIdListByDeptId(deptId);
                condition += ` and belongerId in (${userIdList.join(",")}) `;
                break;
            default:
                break;
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
     * @description: 更新task表数据
     * @param {any} params 传入的整个task对象
     * @return: promise
     */
    async updateTask(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let sufferer: string = params.task.belongerName;
        let task: Task = params.task;
        let condition: object = { taskId: task.taskId }; //更新条件 
        delete task.taskId;
        task = Object.assign(
            {
                ...task
            },
            {
                updateTime: new Date().getTime(),
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
        const stateMap = { 0: '进行中', 1: '完成', 2: '挂起' };
        let userName: string = ctx.session.user.userName;
        let taskList: Array<Task> = params.list;
        let dataArray: Array<any> = params.data;
        let sufferNameStr: string = taskList.map((task: any) => {
            return task.belongerName
        }).join(','); //批量更新的人群
        let sufferIdStr: string = taskList.map((task: any) => {
            return task.taskId
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
        let userName: string = ctx.session.user.userName;
        let taskList: Array<Task> = params.list;
        let sufferNameStr: string = taskList.map((task: any) => {
            return task.belongerName
        }).join(','); //批量更新的人群
        let sufferIdStr: string = taskList.map((task: any) => {
            return `"${task.taskId}"`;
        }).join(',');
        await Log.addLog(`${userName}删除了${sufferNameStr}的任务,任务ID是${sufferIdStr}`, userName, sufferNameStr);
        return await server.db.Delete(tbName, `taskId in (${sufferIdStr})`);
    },

    /**
     * @description: get请求导出个人绩效表
     * @param {object} request 参数
     * @return: promise
    **/
    async personalPerformanceDownload(request: any, ctx: any) {
        let { startTime, endTime ,deptId} = request.query;
        let userName: string = ctx.session.user.userName;
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);

        let res: any; //返回的数据
        let sheetName: string = '个人绩效';
        let constrain: string = "group by belongerId";
        let weeks: any = getWeeksByTime(startTime, endTime);
        let duration: string = `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`;//时间间隔
        let fields: Array<string> = ["belongerName as 'name'", `sum(state = ${TASK_STATE.COMPLETE}) as 'completed_task_num'`, "sum(taskType = 0) as 'plan_task_num'", "sum(taskType = 1) as 'add_task_num'"];
        let userIdList: Array<string>;
        let promiseAll: any;
        let data: Array<any> = []; //处理后的数据
        let columns = [
            { header: '周', key: 'weeks', width: 25 },
            { header: '姓名', key: 'name', width: 10 },
            { header: '完成任务数', key: 'completed_task_num', width: 10 },
            { header: '计划任务数', key: 'plan_task_num', width: 10 },
            { header: '新增任务数', key: 'add_task_num', width: 10 },
            { header: '任务分数', key: 'task_score', width: 10 },
        ];

        userIdList = await this.getUserIdListByDeptId(deptId);
        //分组获取每段时间的任务
        promiseAll = weeks.map((week: any) => {
            //要处理结束时间是当天的23:59:59
            let condition: string = `belongerId in (${userIdList.join(",")}) and (startTime >= ${new Date(week.startTime).getTime()} and endTime <= ${new Date(week.endTime + ' 23:59:59').getTime()})`;
            return server.db.Find(fields, tbName, condition, ISDELETE_FLAG.UNDELETED, constrain);
        })
        await Promise.all(promiseAll).then((res: any) => {
            for (let i = 0; i < weeks.length; i++) {
                res[i] = res[i].map((item: any) => {
                    let commonScore: number = 0 //常规分数,如果计划的任务数目为0的话,需要判空处理，一般不会
                    if (item.plan_task_num !== 0) {
                        commonScore = Math.floor((item.completed_task_num / item.plan_task_num) * 100)
                    }
                    item.task_score = commonScore + item.add_task_num * 10;
                    item.weeks = weeks[i].weeks
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
        let userName: string = ctx.session.user.userName;
        let { startTime, endTime } = request.query;
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);
        let fields: Array<string> = ["projectName", "content", "state", "belonger as 'userName'"];
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
                item.userName =item.userName;
                item.state = item.state == TASK_STATE.COMPLETE ? '完成' : '未完成'
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
        let userName: string = ctx.session.user.userName;
        let { startTime, endTime } = request.query;
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);
        let constrain: string = "order by taskId asc";
        let condition: string = `(startTime >= ${startTime} and endTime <= ${endTime})`;
        let sheetName: string = '周报';
        let duration: string = `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`; //时间间隔
        let data: Array<any> = []; //处理后的数据
        let res: any; //返回的数据
        data = await server.db.Find([], tbName, condition, ISDELETE_FLAG.UNDELETED, constrain);
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
        let userName: string = ctx.session.user.userName;
        const file: any = ctx.request.files.file;
        const fileds: Array<string> = ['taskId', 'projectName', 'content'];
        const userMap: Array<object> = await server.db.Find(["userId", "userName"], userTbName);
        const projectMap: Array<object> = await server.db.Find(["projectId", "projectName"], projectTbName);
        const data: Array<any> = await importTaskExcel(file.path, fileds, userMap, projectMap);
        await Log.addLog(`${userName}批量导入了任务表`, userName);
        return await server.db.BatchInsert(data, tbName);
    },

    /**
     * @description: get请求导出周计划表
     * @param {object} request 参数
     * @return: promise
    **/
    async weekPlanDownload(request: any, ctx: any) {
        let { startTime, endTime, deptId, deptName } = request.query;
        let userName: string = ctx.session.user.userName;
        let userIdList: Array<string>
        let tasks: Array<Task>
    
        let res: any; //返回的数据
        let condition: string = "";
        let sheetName: string = '周计划';
        let constrain: string = "order by taskId asc";

        startTime = parseInt(startTime);
        endTime = parseInt(endTime);
        deptId = parseInt(deptId);

      
        userIdList = await this.getUserIdListByDeptId(deptId);
        condition = ` (startTime >= ${startTime} and endTime <= ${endTime}) and belongerId in (${userIdList.join(",")}) `;

        tasks = await server.db.Find([], tbName, condition, ISDELETE_FLAG.UNDELETED, constrain);
        await exportWeekPlanExcel(sheetName, deptName, tasks, startTime, endTime).then(() => {
            let fileName: string = `${sheetName}.xlsx`;
            ctx.attachment(fileName);
            ctx.type = '.xlsx';
            res = fs.readFileSync(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`));
            fs.unlink(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`), (err: Error) => {
                if (err) throw err;
                console.log(`${sheetName}文件已删除`);
            });
        });
        return res
    }

}
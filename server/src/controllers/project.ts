/*
 * @Description: project表业务逻辑函数
 */
import server from '../common/index';
import { Project, tbName } from '../models/project';
import { tbName as TaskTbName } from '../models/task';
import { pagingQuery } from '../common/utils';
import Log from '../controllers/log';
const config = require('../config/index');
const ISDELETE_FLAG = config.ISDELETE_FLAG;
export default {
    routerName: 'project',

    /**
     * @description:post请求插入project表数据
     * @param {any} params 传入的body数据
     * @return: 
    **/
    async addProject(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let project: Project = {} as Project;
        project = Object.assign(
            { ...params.project },
            {
                createTime: new Date().getTime(),
                updateTime: new Date().getTime()
            }
        );

        await Log.addLog(`${userName}添加了项目${params.project.projectName}`, userName);
        return await server.db.Insert<Project>(project, tbName);
    },

    /**
     * @description: get请求查询project表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getTotalProject(request: any, ctx: any) {
        let field: string[] = [];
        let res: object = {};
        if (request.url.indexOf('options') > 0) {
            field = ['projectId', 'projectName'];
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
     * @description: get请求分页查询project表数据
     * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
     * @return:promise
    **/
    async getPaginProject(request: any, ctx: any) {
        let field: string[] = [];
        let res: object = {};
        let { pageSize, pageIndex, keyWords } = request.query;

        //查询条件，其他约束
        let { condition, constraint } = pagingQuery({ pageSize, pageIndex, keyWords, keyWordsFields: ["projectName", "remarks"], sortField: "projectId" });
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
    * @description: get请求分页查询project相关的task表数据
    * @param request{object}: 可能有的参数(携带在url后面的或者用?xxx='xx'&的) 
    * @return:promise
    **/
    async getTaskByProject(request: any, ctx: any) {
        let field: string[] = [];
        let res: object = {};
        let project: any;
        let { startTime, endTime, pageSize, pageIndex, keyWords, projectId, projectName } = request.query;
        project = {
            projectId: parseInt(projectId),
            projectName
        }
        let keyWordsFields: Array<string> = ["belongerName", "projectName", "content"];

        //查询条件，其他约束
        let { condition, constraint } = pagingQuery({ startTime, endTime, pageSize, pageIndex, keyWords, keyWordsFields, sortField: "taskId", associated: [{ ...project }] });
        await server.db.Find(['count(*) as totalCount'], TaskTbName, condition).then(data => {
            res = {
                totalCount: data[0].totalCount,
            }
        });
        await server.db.Find(field, TaskTbName, condition, ISDELETE_FLAG.UNDELETED, constraint).then(data => {
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
     * @description: 更新project表一条的整体数据
     * @param {any} params 传入的整个project对象
     * @return: promise
     */
    async updateProject(params: any, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let project: Project = params.project;
        let condition: object = { projectId: project.projectId }; //更新条件 
        delete project.projectId;
        project = Object.assign(
            {
                ...project
            },
            {
                updateTime: new Date().getTime(),

            }
        );

        await Log.addLog(`${userName}修改了项目${params.project.projectName}的信息`, userName);
        return await server.db.Update(project, tbName, condition);
    },

    /**
     * @description: 修改一/多条project数据的状态
     * @param {object} params 传入的{list:{xxx},data:[{state:1}]}
     * @return: promise
    **/
    async updateState(params: any, ctx: any) {
        const stateMap = { 0: '运行', 1: '挂起', 2: '完成' };
        let userName: string = ctx.session.user.userName;
        let projectList: Array<Project> = params.list;
        let dataArray: Array<any> = params.data;
        let projectNameStr: string = projectList.map((project: any) => {
            return project.projectName
        }).join(',');

        await Log.addLog(`${userName}修改了项目${projectNameStr}状态为${stateMap[dataArray[0].state]}`, userName);
        return await server.db.BatchUpdate<Project>(tbName, projectList, dataArray);
    },




    /**
     * @description: 删除一条/多条project数据
     * @param {object} params 传入的{list:{xxx}}
     * @return: promise
    **/
    async deleteProject(params: { list: Array<Project> }, ctx: any) {
        let userName: string = ctx.session.user.userName;
        let projectList: Array<Project> = params.list;
        let dataArray: Array<object> = [{ isDelete: 1 }];
        let projectNameStr: string = projectList.map((project: any) => {
            return project.userName
        }).join(',');

        await Log.addLog(`${userName}删除了项目${projectNameStr}`, userName);
        return await server.db.BatchUpdate(tbName, projectList, dataArray);
    },

}
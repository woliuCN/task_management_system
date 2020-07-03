/*
 * @Description: 任务表对应字段
 */

//表名
const tbName = "tasks";


interface Task {
    taskId: string, //任务id
    content: string,   //任务内容
    belongerId: string, //负责人id
    belongerName: string,//负责人名称 
    projectId:number,   //所属项目id
    projectName:string, //所属项目名称
    state: number,  //状态 ps(0-进行中, 1-完成, 2-挂起)
    workingHours: number, //工时
    taskType: number ,// 任务类型   (0 计划，1新增)
    startTime: number, // 计划开始时间
    endTime: number, //计划结束时间
    createTime: number, //创建时间
    updateTime: number, //修改时间
    remarks: string ,//备注
    isDelete: number, //存在情况
}

export { tbName, Task }
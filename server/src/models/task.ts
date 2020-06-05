/*
 * @Description: 任务表对应字段
 */

//表名
const tbName = "Tasks";


interface Task {
    id: string, //任务id
    name: string,   //任务名
    projectInfo: string, //所属项目id+部门名称
    belonger: string, //负责人id+负责人名称  
    state: number,  //状态 ps(1-未启动, 2-进行中, 3-挂起, 4-完成, 5-取消)
    workingHours: string, //工时
    startTime: string, // 计划开始时间
    endTime: string, //计划结束时间
    createTime: string, //创建时间
    updateTime: string, //修改时间
    remarks: string //备注
}

export { tbName, Task }
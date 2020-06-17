/*
 * @Description: 项目表对应字段
 */

//表名
const tbName = "projects";


interface Project {
    projectId: number, //项目id
    projectName: string,   //项目名称
    state: number,  //项目状态 ps (1:允许, 2-挂起, 3-完成, 4-取消)
    createTime: number, //创建时间
    updateTime: number, //修改时间
    remarks: string, //备注
    isDelete: number //存在情况
}

export { tbName, Project }
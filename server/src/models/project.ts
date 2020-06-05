/*
 * @Description: 项目表对应字段
 */

//表名
const tbName = "Projects";


interface Project {
    id: string, //项目id
    name: string,   //项目姓名
    state: number,  //项目状态 ps (1:允许, 2-挂起, 3-完成, 4-取消)
    apartment: string,  //负责的项目+id
    createTime: string, //创建时间
    updateTime: string, //修改时间
    remarks: string //备注
}

export { tbName, Project }
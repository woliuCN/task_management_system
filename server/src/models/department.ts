/*
 * @Description:  部门表对应字段
 */

//表名
const tbName = "depts";


interface DepartMent {
    deptName: string //部门名称
    deptId: number, // 部门id
    createTime: number, //创建时间
    updateTime: number, //修改时间
    isDelete: number //存在情况
}

export { tbName, DepartMent }
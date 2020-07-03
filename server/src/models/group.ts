/*
 * @Description:  小组表对应字段
 */

//表名
const tbName = "groups";


interface Group {
    groupId: number, // 小组id
    groupName: string,   // 小组名
    createTime: number, //创建时间
    updateTime: number, //修改时间
    remarks: string, //备注
    deptId: number, // 所属部门id
    isDelete: number //存在情况
}

export { tbName, Group }
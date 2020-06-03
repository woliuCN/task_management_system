/*
 * @Description:  部门表对应字段
 */
//表名
const tbName = "Apartments";


interface Apartment {
    id: string, // 部门id
    name: string,   // 部门名
    createTime: string, //创建时间
    updateTime: string, //修改时间
    remarks: string //备注
}

export { tbName, Apartment }
/*
 * @Description: 用户表对应字段
 */

//表名
const tbName = "users";


interface User {
    userId: string,  //账号/工号
    passwords: string, //密码
    permission: number, //用户权限
    userGroup: string,  //分组id+分组名称
    userName: string,   //姓名  
    state: number,  //状态 ps:1-在职 0-离职
    createTime: number, //创建时间
    updateTime: number, //修改时间
    remarks: string, //备注
    deleteTime: number, //删除时间
    isDelete: number //该用户账号是否被删除 1是 0否
}

export { tbName, User }
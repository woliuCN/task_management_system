/*
 * @Description: 用户表对应字段
 */

//表名
const tbName = "Users";


interface User {
    id: string, //用户id
    jobNo: string,  //工号
    apartment: string,  //分组id+分组名称
    name: string,   //姓名
    sex: string,    //性别
    state: number,  //状态 ps:1-在职 2-离职
    createTime: string, //创建时间
    updateTime: string, //修改时间
    remarks: string //备注
}

export { tbName, User }
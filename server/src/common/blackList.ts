//权限白名单
const blackList = {
    0: [
        //user表权限
        "loginValidation",
        "logOut",
        "changePassword",
        "getTotalUser",
        "getPaginUser",
        "getUserInfo",
        "updateUser",

        //task表权限
        "getTotalTask",
        "getPaginTask",
        "updateTask",
        "deleteTask",
        "personalPerformanceDownload",
        "monthPerformanceDownload",
        "weeklyDownload",
        "weekPlanDownload",
        "templateDownload",

        //project表权限
        "getTotalProject",
        "getPaginProject",
        "getTaskByProject",

        //group、dept表权限
        "getPaginGroup",
        "getDepartMentList",
        "getPaginDept",
    ],
    1: [
        //user表权限
        "loginValidation",
        "logOut",
        "changePassword",
        "addUser",
        "getUserInfo",
        "getTotalUser",
        "getPaginUser",
        "updateUser",
        "updateState",
        "deleteUser",
        "resetPassword",

        //task表权限
        "addTask",
        "getTotalTask",
        "getPaginTask",
        "updateTask",
        "deleteTask",
        "personalPerformanceDownload",
        "monthPerformanceDownload",
        "weeklyDownload",
        "weekPlanDownload",
        "templateDownload",
        "uploadFile",

        //project表权限
        "addProject",
        "getTotalProject",
        "getPaginProject",
        "getTaskByProject",
        "updateProject",
        "updateState",
        "deleteProject",

        //group、dept表权限
        "getPaginGroup",
        "getGroupListByDept",
        "updateGroup",
        "getUserListByGroup",
        "getDepartMentList",
        "getPaginDept",


    ],
    2: [

        //user表权限
        "loginValidation",
        "logOut",
        "changePassword",
        "addUser",
        "getUserInfo",
        "getTotalUser",
        "getPaginUser",
        "updateUser",
        "updateState",
        "deleteUser",
        "resetPassword",

        //task表权限
        "addTask",
        "getTotalTask",
        "getPaginTask",
        "updateTask",
        "deleteTask",
        "personalPerformanceDownload",
        "monthPerformanceDownload",
        "weeklyDownload",
        "weekPlanDownload",
        "templateDownload",
        "uploadFile",

        //project表权限
        "addProject",
        "getTotalProject",
        "getPaginProject",
        "getTaskByProject",
        "updateProject",
        "updateState",
        "deleteProject",

        //group、dept表权限
        "getPaginGroup",
        "getGroupListByDept",
        "addGroup",
        "updateGroup",
        "deleteGroup",
        "getUserListByGroup",
        "getDepartMentList",
        "getPaginDept",
        "getUserListByDept",
        "updateDepartMent",
    ],
    3: [
        "loginValidation",
        "logOut",
        "changePassword",
        "addUser",
        "getUserInfo",
        "getTotalUser",
        "getPaginUser",
        "updateUser",
        "updateState",
        "deleteUser",
        "resetPassword",
        "addTask",
        "getTotalTask",
        "getPaginTask",
        "updateTask",
        "deleteTask",
        "personalPerformanceDownload",
        "monthPerformanceDownload",
        "weeklyDownload",
        "weekPlanDownload",
        "templateDownload",
        "uploadFile",
        "addProject",
        "getTotalProject",
        "getPaginProject",
        "getTaskByProject",
        "updateProject",
        "updateState",
        "deleteProject",
        "getPaginGroup",
        "getGroupListByDept",
        "addGroup",
        "updateGroup",
        "deleteGroup",
        "getUserListByGroup",
        "getDepartMentList",
        "getPaginDept",
        "getUserListByDept",
        "addDepartMent",
        "updateDepartMent",
        "deleteDepartMent",
        "getLogList"
    ],
}

/**
    * @description: 权限拦截 中间件函数
    * @param {any} ctx 
    * @param {any} next
**/
const permissionIntercept = async (ctx: any, next: any) => {
    if (ctx.path === '/favicon.ico') return;
    let fn: string = ctx.url.split("/")[3].split("?")[0]; //获取请求的方法
    let permission = ctx.session.user ? ctx.session.user.permission : 0;
    //没有权限的请求方法
    if (fn !== 'loginValidation' && !blackList[permission].includes(fn)) {
        ctx.body = {
            retCode: 1002,
            message: '您没有权限,请联系管理员升级权限'
        }
    } else {
        await next();
    }
}
export { permissionIntercept }
//权限白名单
const blackList = {
    0: [
        "loginValidation",
        "logOut",
        "changePassword",
        "getTotalUser",
        "getPaginUser",
        "getTotalTask",
        "getPaginTask",
        "personalPerformanceDownload",
        "monthPerformanceDownload",
        "weeklyDownload",
        "templateDownload",
        "getTotalProject",
        "getPaginProject",
        "getTaskByProject",
        "getGroupList"
    ],
    1: [
        "loginValidation",
        "logOut",
        "changePassword",
        "addUser",
        "getTotalUser",
        "getPaginUser",
        "updateUser",
        "updateState",
        "deleteUser",
        "addTask",
        "getTotalTask",
        "getPaginTask",
        "updateTask",
        "deleteTask",
        "personalPerformanceDownload",
        "monthPerformanceDownload",
        "weeklyDownload",
        "templateDownload",
        "uploadFile",
        "addProject",
        "getTotalProject",
        "getPaginProject",
        "getTaskByProject",
        "updateProject",
        "updateState",
        "deleteProject",
        "getGroupList"
    ],
    2: [
        "loginValidation",
        "logOut",
        "changePassword",
        "addUser",
        "getTotalUser",
        "getPaginUser",
        "updateUser",
        "updateState",
        "deleteUser",
        "addTask",
        "getTotalTask",
        "getPaginTask",
        "updateTask",
        "deleteTask",
        "personalPerformanceDownload",
        "monthPerformanceDownload",
        "weeklyDownload",
        "templateDownload",
        "uploadFile",
        "addProject",
        "getTotalProject",
        "getPaginProject",
        "getTaskByProject",
        "updateProject",
        "updateState",
        "deleteProject",
        "getGroupList",
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
    let permission = ctx.session.permission;
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
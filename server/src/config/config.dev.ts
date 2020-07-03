/*
 * @Description: 开发环境配置
 */
const development = {
    SERVER_PORT: 30,
    MYSQL: {
        host: '127.0.0.1',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'task_manage'
    },
    SESSION_SIGNED_KET: ["task_manage"],
    SESSION_CONFIG: {
        key: 'LOGIN_TOKEN', /**  cookie的key。 (默认是 koa:sess) */
        maxAge: 30 * 60 * 1000, /**  session 过期时间，以毫秒ms为单位计算 。*/
        autoCommit: true, /** 自动提交到响应头。(默认是 true) */
        overwrite: true, /** 是否允许重写 。(默认是 true) */
        httpOnly: true, /** 是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true) */
        signed: true, /** 是否签名。(默认是 true) */
        rolling: false, /** 是否每次响应时刷新Session的有效期。(默认是 false) */
        renew: false, /** 是否在Session快过期时刷新Session的有效期。(默认是 false) */
    },
    ISDELETE_FLAG: {
        UNDELETED: 0, //未删除
        DELETED: 1,  //已删除
        BOTH: 2     //全部
    },
    TASK_STATE: {
        ONGOING: 0, //进行中
        COMPLETE: 1, //完成
        HANG: 2 //挂起
    },
    PERMISSION: {
        MEMBER: 0,
        GROUP_LEADER: 1,
        DEPT_LEADER: 2,
        ADMIN: 3
    }

}

module.exports = development
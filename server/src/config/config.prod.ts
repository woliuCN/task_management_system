/*
 * @Description: 生产环境配置文件
 */
const product = {
    SERVER_PORT :3000,
    MYSQL:{
        host:'127.0.0.1',
        user:'root',
        password:'123456',
        port:'3306',
        database:'manage_server'
    }
}

module.exports = product;
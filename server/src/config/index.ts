/*
 * @Description: 入口配置文件
 * @Autor: cn
 * @Date: 2019-12-22 16:01:30
 * @LastEditors  : cn
 * @LastEditTime : 2019-12-22 16:03:28
 */
module.exports = process.env.NODE_ENV ==='dev'? require('./config.dev'):require('./config.prod');
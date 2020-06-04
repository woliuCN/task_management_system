/*
 * @Description: 入口配置文件
 */
module.exports = process.env.NODE_ENV === 'dev' ? require('./config.dev') : require('./config.prod');
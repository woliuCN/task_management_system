const path = require('path');

module.exports = {
  publicPath: './',
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/assets/css/common-variables.scss";' // 配置sass-resources定义全局css变量
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    devtool: 'source-map'
  }
};

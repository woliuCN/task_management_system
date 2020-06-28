## 简介
项目使用`typescript`为基础语言，结合`koa2`、`mysql`搭建而成的，其他三方库可以结合`package.json`查看。

## 目录结构
```javascript
|--src                                          //主目录
|   |--attachement                              //文件上传与下载的目录
|   |   |--template                             //上传模板
|   |--common                                   //通用模块
|   |   |--blackList                            //白名单中间件  
|   |   |--db                                   //数据库操作封装
|   |   |--excel                                //excel操作封装
|   |   |--index                                //common入口
|   |   |--utils                                //工具函数
|   |--config                                   //配置
|   |   |--config.dev                           //开发环境配置
|   |   |--config.prod                          //生产环境配置
|   |   |--index                                //配置入口
|   |--controllers                              //控制器模块
|   |   |--group                                //group相关请求处理
|   |   |--index                                //controllers入口
|   |   |--log                                  //log相关请求处理
|   |   |--project                              //project相关请求处理
|   |   |--task                                 //task相关请求处理
|   |   |--user                                 //user相关请求处理
|   |--mode                                     //数据模型模块
|   |   |--group                                //group数据模型
|   |   |--log                                  //log数据模型
|   |   |--project                              //project数据模型
|   |   |--task                                 //task数据模型
|   |   |--user                                 //user数据模型
|   |--routers                                  //路由配置
|   |--app                                      //项目配置
|   |--index                                    //多线程配置与入口文件  
|   |--www                                      //编译为js后的文件目录
|   |--tsconfig.json                            //ts配置文件
```


## 说明

### 运行
1. 第一次: 进入项目目录，执行`npm install`下载相关依赖
2. 运行: 执行`npm run dev` 运行项目
3. 编译:  `npm run build` 看到`www`目录生成相关文件

### 其他说明
1. 编译完成后，需要在新的目录下`npm init -y`生成相应的`package.json`文件,将原来目录下的`package.json`依赖复制过去,再出去所有相关的`@types`类型定义文件依赖，ts依赖即可。
2. 编译完成时，不会在生成的目录下将`attachement`目录一并生成过去，需要将其复制在对应的位置。
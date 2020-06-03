## 任务管理系统



### 功能分析

```js
1. 用户功能
1.1 用户登录
  根据账号密码进行登录，默认管理员账号为admin/admin。

2. 系统功能
2.1 首页
  周任务完成情况/进度、月/季/年总结（以图表形式展示）
2.2 项目管理
  项目的增删改查操作，项目工作细分（负责人、负责内容、工时等）。
2.3 周任务管理（用于周会展示）
  跟根据算法计算出某一周的时间戳范围，在数据库检索该范围内的所有任务并生成列表。


3. 后台管理
3.1 成员管理
3.2 操作日志
  用户操作（包括但不限于登录操作、任务操作等），可记录操作者ip、操作时间、操作内容等。

表：
部门 apartment
用户表 users
项目 projects
任务 task
日志 log


apartment:
id  -- 部门id type:String
name -- 部门名称 type:String
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String

users：
id -- 用户id type:String
jobNo -- 工号 type:String
apartmentId	-- 分组id type:String
name -- 姓名 type:String
sex -- 性别 type:String
state -- 状态 1-在职 2-离职 type:String
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String

projects:
id -- 项目id type:String
name -- 项目名称 type:String
state -- 状态 1-运行 2-挂起 3-完成 4-取消 type:String
apartment -- 负责的部门 type:String
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String
 
task:
id -- 任务id兼编号 type:String
name -- 任务名 type:String
projectId -- 所属项目（项目的id） type:String
belongerId -- 负责人员(负责人的id) type:String
state -- 1-未启动 2-进行中 3-挂起 4-完成 5-取消 type:String
workingHours -- 工时 type:String
startTime -- 计划开始时间 type:String（YYYY-MM-DD hh:mm:ss） (默认时间为本周一)
endTime -- 计划结束时间 type:String（YYYY-MM-DD hh:mm:ss） (默认时间为本周五)
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String


Log:
id -- 日志id type:String
content -- 日志内容 type: String
createTime -- 生成时间 type: String
```





### 数据库设计图

> 其中红色为主键、粉色为外键。

![](https://github.com/woliuCN/photos/blob/master/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20200603160342.png?raw=true)



### 用户活动图



![](https://github.com/woliuCN/photos/blob/master/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20200603160354.png?raw=true)


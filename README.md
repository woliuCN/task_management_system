## 任务管理系统

1. 用户功能
1.1 用户登录
    根据账号密码进行登录，默认管理员账号为admin/admin。
1.2 用户注册（可不做，只留一个管理员账号）

2. 系统功能
2.1 首页
    周任务完成情况/进度、月/季/年总结（以图表形式展示）
2.2 项目管理
    项目的增删改查操作，项目工作细分（负责人、负责内容、工时等）。
2.3 周任务管理（用于周会展示）
    跟根据算法计算出某一周的时间戳范围，在数据库检索该范围内的所有任务并生成列表。


3. 后台管理
3.1 用户管理（如不开放注册功能可不做）
3.2 操作日志
    用户操作（包括但不限于登录操作、任务操作等），可记录操作者ip、操作时间、操作内容等。




表：
部门 apartment
用户表 users
项目 projects
任务 task
日志 log


apartment:
_id  -- 部门id type:String
name -- 部门名称 type:String
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String

users：
_id -- 用户id type:String
jobNo -- 工号 type:String
apartmentId	-- 分组id type:String
name -- 姓名 type:String
sex -- 性别 type:String
state -- 状态 1-在职 2-离职 type:String
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String

projects:
_id -- 项目id type:String
name -- 项目名称 type:String
state -- 状态 1-运行 2-挂起 3-完成 4-取消 type:String
apartment -- 负责的部门 type:String
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String

task:
_id -- 任务id兼编号 type:String
Name -- 任务名 type:String
projectId -- 所属项目（项目的id） type:String
belonger -- 负责人员(负责人的id) type:String
state -- 1-未启动 2-进行中 3-挂起 4-完成 5-取消 type:String
workingHours -- 工时 type:String
interval -- 计划时间 type：JSON {startTime: YYYY-MM-DD hh:mm:ss, endTime: YYYY-MM-DD hh:mm:ss} (默认时间为本周一至本周五)
createTime -- 创建时间 type:String
updateTime -- 修改时间 type:String
remarks -- 备注 type:String


Log:
_id -- 日志id type:String
content -- 日志内容 type: String
createTime -- 生成时间 type: String
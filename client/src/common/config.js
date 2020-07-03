// 任务状态
export const STATUS = {
  // 运行中
  RUNNING: 0,

  // 完成
  ACCOMPLISH: 1,

  // 挂起
  PEND: 2
};

export const STATUS_CH = {
  0: '运行中',
  1: '完成',
  2: '挂起'
};

export const TASK_TYPE = {
  PLAN: 0,
  NEWLY: 1
};

export const TASK_TYPE_CH = {
  0: '计划',
  1: '新增'
};

export const PERMISSION = {
  // 普通用户
  ORDINARY_USER: 0,

  // 小组管理员
  TEAM_MANAGER: 1,

  // 部门管理员
  DEPT_MANAGER: 2,

  // 系统管理员
  SYS_ADMIN: 3
};

// 员工就职状态
export const USER_STATUS = {
  0: '离职',
  1: '在职'
};

// 员工职位
export const USER_PERMISSION = {
  0: '组员',
  1: '组长',
  2: '管理员',
  3: '超级管理员',
  组员: 0,
  组长: 1,
  管理员: 2,
  超级管理员: 3
};

export const REQUEST_URL = {
  // 获取任务数据
  TASK_GETPAGINTASK: '/task/getPaginTask',

  // 增加任务
  TASK_ADDTASK: '/task/addTask',

  // 修改任务
  TASK_UPDATETASK: '/task/updateTask',

  // 删除任务
  TASK_DELETETASK: '/task/deleteTask',

  // 更新任务状态
  TASK_UPDATESTATE: '/task/updateState',

  // 任务导入模板下载地址
  TASK_TEMPLATEDOWNLOAD: '/task/templateDownload',

  // 生成周报地址
  TASK_WEEKLYDOWNLOAD: '/task/weeklyDownload',

  // 生成个人绩效地址
  TASK_PERSONALPERFORMANCEDOWNLOAD: '/task/personalPerformanceDownload',

  // 生成月绩效地址
  TASK_MONTHPERFORMANCEDOWNLOAD: '/task/monthPerformanceDownload',

  // 获取项目数据
  PROJECT_GETPAGINPROJECT: '/project/getPaginProject',

  // 新增项目
  PROJECT_ADDPROJECT: '/project/addProject',

  // 修改项目
  PROJECT_UPDATEPROJECT: '/project/updateProject',

  // 删除项目
  PROJECT_DELETEPROJECT: '/project/deleteProject',

  // 修改项目状态
  PROJECT_UPDATESTATE: '/project/updateState',

  // 获取用户列表 - 只有username和userid，用于新增负责人时展示列表
  USER_GETTOTALUSER_OPTIONS: '/user/getTotalUser/options',

  // 获取项目列表 - 只有projectName和projectId，用于新增任务时展示列表
  PROJECT_GETTOTALPROJECT_OPTIONS: '/project/getTotalProject/options',

  // 获取项目子任务信息
  PROJECT_GETTASKBYPROJECT: '/project/getTaskByProject',

  // 获取用户信息
  USER_GETUSERINFO: '/user/getUserInfo',

  // 新增部门
  DEPARTMENT_ADDDEPT: '/department/addDepartMent',

  // 更新部门
  DEPARTMENT_UPDATEDEPT: '/department/updateDepartMent',

  // 删除部门
  DEPARTMENT_DELETEDEPARTMENT: '/department/deleteDepartMent',

  // 获取部门列表
  DEPARTMENT_GETDEPARTMENTLIST: '/department/getDepartMentList',

  // 获取部门所有员工
  DEPARTMENT_ALLUSER: '/department/getUserListByDept',

  // 添加小组
  GROUP_ADDGROUP: '/group/addGroup',

  // 修改小组
  GROUP_UPDATEGROUP: '/group/updateGroup',

  // 删除小组
  GROUP_DELETEGROUP: '/group/deleteGroup',

  // 获取部门内所有小组
  GROUP_GETGROUPBYDEPT: '/group/getGroupListByDept',

  // 获取小组内所有成员
  GROUP_ALLUSER: '/group/getUserListByGroup',

  // 添加员工
  USER_ADDUSER: '/user/addUser',

  // 修改员工
  USER_UPDATEUSER: '/user/updateUser',

  // 删除员工
  USER_DELETEUSER: '/user/deleteUser',

  // 更新员工就职状态
  USER_UPDATESTATE: '/user/updateState',

  // 初始化员工密码
  USER_RESETPASSWORD: '/user/resetPassword'
};

```markdown
.
├── README.md
├── babel.config.js
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── App.vue
│   ├── assets      // 静态资源
│   │   ├── css
│   │   │   ├── common-variables.scss   // 公共样式文件
│   │   │   └── reset.scss
│   │   ├── images
│   │   │   ├── avator.gif        // 头像
│   │   │   ├── background.jpg    // 登录页背景
│   │   │   ├── blindfold.png     // 登录页窗口图片 - 输入密码时显示
│   │   │   ├── greeting.png      // 登录页窗口图片 - 输入账号时显示
│   │   │   └── normal.png        // 登录页窗口图片 - 正常
│   │   ├── js
│   │   │   └── elementImport.js  // ElementUI引入配置
│   │   └── logo.png
│   ├── common                // 公共文件
│   │   └── config.js         // 公共常数声明
│   ├── components            // 自定义组件
│   │   ├── Cards.vue
│   │   ├── Chart.vue
│   │   ├── DataTable.vue     // 公共表格组件，用于展示任务、项目等数据
│   │   ├── HeaderSearch.vue  // Header中的搜索框
│   │   ├── MyDialog.vue
│   │   ├── NavBar.vue
│   │   ├── SideBar.vue
│   │   └── Tags.vue
│   ├── directives            // 自定义指令
│   │   ├── haspermission.js  // 判断组件是否用哟
│   │   └── index.js          // 配置自定义指令并引入
│   ├── filters
│   │   └── index.js
│   ├── lib
│   │   └── request.js        // 封装axios请求
│   ├── main.js
│   ├── router                // router配置
│   │   └── index.js
│   ├── store                 // Vuex配置
│   │   ├── index.js
│   │   └── modules
│   │       ├── menu.js
│   │       ├── tags.js
│   │       └── userInfo.js
│   ├── utils
│   │   ├── api.js          // 公用函数配置，如时间戳格式化等
│   │   ├── filtrateDateFromData.js
│   │   └── timePickerConfig.js   // timePicker配置文件
│   └── views         // 界面相关
│       ├── AbnormalLog.vue
│       ├── DashBoard.vue
│       ├── GroupManage.vue
│       ├── Home.vue
│       ├── Login.vue
│       ├── MemberManage.vue
│       ├── ProjectManage   // 项目管理界面
│       │   ├── Index.vue   // 入口
│       │   └── components
│       │       ├── AccomplishDialog.vue    // 完成任务时弹窗
│       │       ├── EditDialog.vue          // 新增/完成项目相关弹窗
│       │       └── ProjectDetail.vue       // 查看项目子任务弹窗
│       └── TaskList        // 任务展示界面
│           ├── Index.vue   // 入口
│           └── components
│               ├── AccomplishDialog.vue    // 完成任务时弹窗
│               ├── EditDialog.vue          // 新增/完成任务相关弹窗
│               └── ExportDialog.vue        // 导出文件弹窗
└── vue.config.js
```
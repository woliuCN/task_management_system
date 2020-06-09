const store = {
  state: {
    foldState: false, // 菜单栏是否展开状态
    menuLists: [
      {
        title: '首页',
        index: '0',
        icon: 'fa-home',
        children: []
      },
      {
        title: '人员管理',
        index: '1',
        icon: 'fa-group',
        children: [
          {
            title: '分组管理',
            path: '/group'
          },
          {
            title: '成员管理',
            path: '/member'
          }
        ]
      },
      {
        title: '项目管理',
        index: '2',
        icon: 'fa-file-text',
        children: [
          {
            title: '项目管理',
            path: '/project'
          },
          {
            title: '任务管理',
            path: '/task'
          }
        ]
      },
      {
        title: '系统管理',
        index: '3',
        icon: 'fa-gears',
        children: [
          {
            title: '异常日志',
            path: '/log'
          }
        ]
      }

    ]
  },

  mutations: {
    setFoldState(state, flag) {
      state.foldState = flag;
    }
  }
};

export default store;

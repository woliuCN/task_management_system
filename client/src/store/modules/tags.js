const store = {
  state: {
    cachedViews: [
      {
        path: '/dashboard',
        title: '首页'
      }
    ] // 浏览过的页面
  },

  mutations: {
    // 添加打开的页面标签
    addCachedViews(state, view) {
      let flag = true;
      state.cachedViews.map(item => {
        if (item.path === view.path) {
          flag = false;
        }
      });
      if (flag) {
        state.cachedViews = [...state.cachedViews, view];
      }
    },

    // 删除打开的页面标签
    delCachedViews(state, delView) {
      const newCachedViews = state.cachedViews.filter(view => {
        return view.path !== delView.path;
      });
      state.cachedViews = newCachedViews;
    }
  }
};

export default store;

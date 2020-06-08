const store = {
  state: {
    foldState: false // 菜单栏是否展开状态
  },

  mutations: {
    setFoldState(state, flag) {
      state.foldState = flag;
    }
  }
};

export default store;

import { getUserInfo } from '@/utils/api.js';

const store = {
  state: {
    userName: '',
    userId: '',
    permission: 0
  },

  mutations: {
    getUserInfo(state) {
      getUserInfo().then((res) => {
        const userInfo = res.data;
        const { userName, userId, permission } = userInfo;
        state.userName = userName;
        state.userId = userId;
        state.permission = permission;
      });
    }
  }
};

export default store;

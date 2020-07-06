import { getTasks, getProjects, getUsers } from '@/utils/api.js';

const store = {
  state: {
    tasks: [],
    projects: [],
    users: []
  },
  getters: {
    getTasks(state) {
      return state.tasks;
    },
    getProjects(state) {
      return state.projects;
    },
    getUsers(state) {
      return state.users;
    }
  },
  mutations: {
    setTasks(state, tasks) {
      state.tasks = tasks;
    },
    setProject(state, projects) {
      state.projects = projects;
    },
    setUsers(state, users) {
      state.users = users;
    }
  },
  actions: {
    asyncGetTasks({ commit }) {
      getTasks()
        .then((res) => {
          commit('setTasks', res);
        });
    },
    asyncGetProjects({ commit }) {
      getProjects()
        .then((res) => {
          commit('setProject', res);
        });
    },
    asyncGetUsers({ commit }) {
      getUsers()
        .then((res) => {
          commit('setUsers', res);
        });
    }
  }
};

export default store;

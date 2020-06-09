import Vue from 'vue';
import Vuex from 'vuex';
import menu from './modules/menu';
import tags from './modules/tags';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    menu,
    tags
  }
});

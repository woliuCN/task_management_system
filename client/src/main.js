import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/js/elementImport';
import './assets/css/reset.scss';
import './assets/css/common-variables.scss';
import 'font-awesome/css/font-awesome.min.css';
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

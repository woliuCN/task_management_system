import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import http from './lib/request';
import './assets/js/elementImport';
import './assets/css/reset.scss';
import './assets/css/common-variables.scss';
import 'font-awesome/css/font-awesome.min.css';

import directives from './directives';
Vue.use(directives);

Vue.config.productionTip = false;

Vue.prototype.$http = http; // ajax请求
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

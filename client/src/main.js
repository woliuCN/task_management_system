<<<<<<< HEAD
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/js/elementImport';
import './assets/css/reset.scss';
import './assets/css/common-variables.scss';
import 'font-awesome/css/font-awesome.min.css';
Vue.config.productionTip = false;
=======
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/js/elementImport'
import './assets/css/reset.scss'
import './assets/css/common-variables.scss'
import 'font-awesome/css/font-awesome.min.css'
Vue.config.productionTip = false
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

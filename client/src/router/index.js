import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import store from '@/store/index';
Vue.use(VueRouter);

// 因为使用了element ui menu的router 属性，无法自定义push的时候过滤重复的相同路径，会抛出警告，这里是捕获异常。
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/DashBoard'),
        name: 'Dashboard',
        meta: { title: '首页', affix: true }
      },
      {
        path: 'group',
        component: () => import('@/views/GroupManage'),
        name: 'GroupManage',
        meta: { title: '分组管理', affix: true }
      },
      {
        path: 'member',
        component: () => import('@/views/MemberManage'),
        name: 'MemberManage',
        meta: { title: '成员管理', affix: true }
      },
      {
        path: 'project',
        component: () => import('@/views/ProjectManage/Index'),
        name: 'ProjectManage',
        meta: { title: '项目管理', affix: true }
      },
      {
        path: 'task',
        component: () => import('@/views/TaskList/Index'),
        name: 'TaskManage',
        meta: { title: '任务管理', affix: true }
      },
      {
        path: 'log',
        component: () => import('@/views/AbnormalLog'),
        name: 'AbnormalLog',
        meta: { title: '异常日志', affix: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
});

// 每次重定向的时候需要重新修改tags标签的值
router.beforeEach((to, from, next) => {
  if (to.path !== '/' || to.path !== '/dashboard') {
    store.commit('addCachedViews', { path: to.path, title: to.meta.title });
  }
  next();
});

export default router;

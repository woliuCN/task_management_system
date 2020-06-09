import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
Vue.use(VueRouter);

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
        meta: { title: 'Dashboard', affix: true }
      },
      {
        path: 'group',
        component: () => import('@/views/GroupManage'),
        name: 'GroupManage',
        meta: { title: 'GroupManage', affix: true }
      },
      {
        path: 'member',
        component: () => import('@/views/MemberManage'),
        name: 'MemberManage',
        meta: { title: 'MemberManage', affix: true }
      },
      {
        path: 'project',
        component: () => import('@/views/ProjectManage'),
        name: 'ProjectManage',
        meta: { title: 'ProjectManage', affix: true }
      },
      {
        path: 'task',
        component: () => import('@/views/TaskList'),
        name: 'TaskManage',
        meta: { title: 'TaskManage', affix: true }
      },
      {
        path: 'log',
        component: () => import('@/views/AbnormalLog'),
        name: 'AbnormalLog',
        meta: { title: 'AbnormalLog', affix: true }
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

export default router;

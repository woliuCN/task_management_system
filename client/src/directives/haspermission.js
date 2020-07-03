import { PERMISSION } from '@/common/config.js';
import store from '../store';
// import Vue from 'vue';
/**
 * v-has-permission
 * @desc 检查当前用户是否有权限显示本组件
 *       v-has-permission传入的是一个允许运行本组件的权限列表，只有用户权限存在该列表中才可加载本组件。
 */
export default {
  inserted(el, binding, vnode) {
    const userInfo = store.state.userInfo;
    const userPermission = userInfo.permission || PERMISSION.ORDINARY_USER;
    const permissionList = binding.value || [];
    const hasPermission = permissionList.indexOf(userPermission) === -1 ? false : true;
    if (!hasPermission) {
      el.remove();
    }
  }
};

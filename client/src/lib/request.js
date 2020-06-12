import Vue from 'vue';
import axios from 'axios';
import router from '@/router';

const http = axios.create({
  timeout: 1000 * 30,
  withCredentials: true, // 当前请求为跨域类型时是否在请求中协带cookie
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  baseURL: process.env.VUE_APP_BASE_URL
});

/**
 * 请求拦截
 */
// http.interceptors.request.use(config => {
//     // 处理请求之前的配置
//     config.headers['dbtoken'] = Vue.cookie.get('dbtoken') // // 请求头带上token
//     return config
// }, error => {
//     // 请求失败的处理
//     return Promise.reject(error)
// });

/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  if (response.data && response.data.code === 1001) { // 1001 token失效
    Vue.prototype.$message({
      type: 'error',
      message: '登录信息失效,请重新登录!',
      duration: 1500,
      onClose: () => {
        router.push({ name: 'Login' });
      }
    });
    return;
  }
  return response;
}, error => {
  return Promise.reject(error);
});

/**
 * get 请求封装
 * @param url  请求路径
 * @param params 拼接在路径后面的参数
 * @returns promise
 * @example (user/getUserList,{id:'1001'})
 */
http.getRequest = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    http.get(url, { params }).then(res => {
      resolve(res.data);
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * post 请求封装
 * @param url  请求路径
 * @param params 拼接在路径后面的参数
 * @returns promise
 * @example (user/getUserList,{id:'1001'})
 */
http.postRequest = (url, params) => {
  return new Promise((resolve, reject) => {
    http.post(url, params).then(res => {
      resolve(res.data);
    }).catch(err => {
      reject(err);
    });
  });
};

export default http;

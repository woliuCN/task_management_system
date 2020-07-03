import { REQUEST_URL } from '../common/config.js';
import http from '../lib/request.js';
/**
 * 将时间戳格式化为具体日期格式
 *
 * @param {Number} timestamp 由new Date()生成的时间戳
 * @param {String} format 格式化后的日期格式，默认格式为YYYY-MM-DD hh:mm:ss
 *                        可选的格式有YYYY-MM-DD、YYYY/MM/DD hh:mm:ss等
 * @return {String} 由timestamp生成的与format格式一致的时间文本
 */
export const time = (timestamp, format = 'YYYY-MM-DD hh:mm:ss') => {
  const dateObj = new Date(timestamp);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const whatDate = dateObj.getDate().toString().padStart(2, '0');
  const hour = dateObj
    .getHours()
    .toString()
    .padStart(2, '0');
  const minute = dateObj
    .getMinutes()
    .toString()
    .padStart(2, '0');
  const second = dateObj
    .getSeconds()
    .toString()
    .padStart(2, '0');

  let res = format;
  res = res.replace(/Y+/, year)
    .replace(/M+/, month)
    .replace(/D+/, whatDate)
    .replace(/h+/, hour)
    .replace(/m+/, minute)
    .replace(/s+/, second);

  // const date = `${year}/${month}/${whatDate}`;
  // const time = `${hour}:${minute}:${second}`;
  // const dateTime = `${date} ${time}`;
  // return dateTime;
  return res;
};

/**
 * 对函数进行防抖处理
 *
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param immediate true 表立即执行，false 表非立即执行
 * @param errCallback 发生错误（）
 */
export const debounce = function(func, wait, immediate, errCallback) {
  let timeout;
  return function() {
    const context = this;

    // 获取参数
    const args = arguments;

    // 如果在计时器运行时执行函数，重置计时器
    if (timeout) clearTimeout(timeout);

    // const callNow = !timeout;
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) {
        return func.apply(context, args);
      }
    } else {
      timeout = setTimeout(function() {
        return func.apply(context, args);
      }, wait);
    }

    if (timeout && typeof errCallback === 'function') {
      errCallback.apply(context);
    }
  };
};

// 判断变量的类型
function getType(obj) {
  var str = Object.prototype.toString.call(obj);
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };
  if (obj instanceof Element) { // 判断是否是dom元素，如div等
    return 'element';
  }
  return map[str];
}

// 对象深拷贝

// 深拷贝函数
export const copy = function(obj) {
  var res;
  let i;
  var str = getType(obj);
  if (str === 'array') {
    res = [];
    for (i = 0; i < obj.length; i++) {
      res.push(copy(obj[i]));
    }
  } else if (str === 'object') {
    res = {};
    for (i in obj) {
      res[i] = copy(obj[i]);
    }
  } else {
    return obj;
  }
  return res;
};

export const getUserInfo = function() {
  const url = REQUEST_URL.USER_GETUSERINFO;
  return http.getRequest(url);
};

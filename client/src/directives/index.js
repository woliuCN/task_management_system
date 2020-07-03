import hasPermission from './haspermission';
const directive = {
  install(Vue) {
    Vue.directive('has-permission', {
      ...hasPermission
    });
  }
};

export default directive;

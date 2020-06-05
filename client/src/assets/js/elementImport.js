import {
  Table,
  TableColumn,
  Button,
  ButtonGroup
} from 'element-ui'
import Vue from 'vue'

const components = {
  Table,
  TableColumn,
  Button,
  ButtonGroup
}

for (const key in components) {
  Vue.use(components[key])
}
// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;
// Vue.prototype.$message = Message;
// Vue.prototype.$messageBox = MessageBox;

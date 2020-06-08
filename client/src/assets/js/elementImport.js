import {
  Table,
  TableColumn,
  Button,
  ButtonGroup,
  Row,
  Col,
  Popover,
  Timeline,
  TimelineItem,
  DatePicker,
  Dialog
} from 'element-ui'
import Vue from 'vue'

const components = {
  Table,
  TableColumn,
  Button,
  ButtonGroup,
  Row,
  Col,
  Popover,
  Timeline,
  TimelineItem,
  DatePicker,
  Dialog
}

for (const key in components) {
  Vue.use(components[key])
}
// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;
// Vue.prototype.$message = Message;
// Vue.prototype.$messageBox = MessageBox;

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
  Dialog,
  Menu,
  Submenu,
  MenuItemGroup,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Select,
  Option,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Input,
  DatePicker
} from 'element-ui';
import Vue from 'vue';

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
  Dialog,
  Menu,
  Submenu,
  MenuItemGroup,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Select,
  Option,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Input,
  DatePicker
};

for (const key in components) {
  Vue.use(components[key]);
}
// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;
// Vue.prototype.$message = Message;
// Vue.prototype.$messageBox = MessageBox;

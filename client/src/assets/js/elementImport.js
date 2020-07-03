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
  Form,
  FormItem,
  Checkbox,
  DatePicker,
  Message,
  MessageBox,
  Radio,
  RadioGroup,
  Loading,
  Upload,
  Avatar,
  Transfer
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
  Form,
  FormItem,
  Checkbox,
  DatePicker,
  Radio,
  RadioGroup,
  Upload,
  Avatar,
  Transfer
};

for (const key in components) {
  Vue.use(components[key]);
}
Vue.use(Loading.directive);
Vue.prototype.$loading = Loading.service;
Vue.prototype.$message = Message;
Vue.prototype.$messageBox = MessageBox;
Vue.prototype.$confirm = MessageBox.confirm;

import {
  Table,
  TableColumn,
  Button,
  ButtonGroup,
<<<<<<< HEAD
  Row,
  Col,
=======
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251
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
<<<<<<< HEAD
  DropdownItem,
  Pagination,
  Input
} from 'element-ui';
import Vue from 'vue';
=======
  DropdownItem
} from 'element-ui'
import Vue from 'vue'
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251

const components = {
  Table,
  TableColumn,
  Button,
  ButtonGroup,
<<<<<<< HEAD
  Row,
  Col,
=======
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251
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
<<<<<<< HEAD
  DropdownItem,
  Pagination,
  Input
};
=======
  DropdownItem
}
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251

for (const key in components) {
  Vue.use(components[key]);
}
// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;
// Vue.prototype.$message = Message;
// Vue.prototype.$messageBox = MessageBox;

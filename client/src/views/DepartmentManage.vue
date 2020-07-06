<template>
  <div>
    <data-table
      ref="data-table"
      class="people-table"
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :pageIndex="pageIndex"
      :pageSize="pageSize"
      :total="total"
      v-loading="isLoading"
      :isSelection="true"
      :isShowSearch="false"
      @search-content-changed="searchContent"
      @add-group="addDept"
      @allocate-administrator="allocateAdministrator"
      @modification-group="modificationDept"
      @delete-group="deleteDept"
    >
    </data-table>

    <!-- 信息弹窗 -->
    <my-dialog
      :visible.sync="visible"
      :tableData="dialogInfo"
      :titleName="titleName"
      @success="success"
      @close="close"
    ></my-dialog>

    <!-- 分配管理员弹窗 -->
    <el-dialog
      title="分配管理员"
      width="725px"
      :visible.sync="allocating"
    >
      <el-transfer
        class="allocate"
        filterable
        filter-placeholder="请按名称搜索"
        :titles="['成员列表', '选中']"
        v-model="selectUsers"
        :data="allUsers">
      </el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocateCancle">取 消</el-button>
        <el-button type="primary" @click="allocateOK">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
import MyDialog from '../components/MyDialog';
import { time, copy } from '../utils/api.js';
import { Loading } from 'element-ui';
import { PERMISSION, USER_PERMISSION, REQUEST_URL } from '../common/config';
export default {
  components: {
    DataTable,
    MyDialog
  },
  data() {
    return {
      // table抬头
      tableTitle: [
        { label: '部门ID', prop: 'deptId' },
        { label: '部门名称', prop: 'deptName' },
        { label: '创建时间', prop: 'createTime' },
        { label: '修改时间', prop: 'updateTime' }
      ],

      // 源数据
      sourceData: [],
      // table主体数据
      tableData: [],

      // table操作button
      buttonList: [],
      pageIndex: 0,
      pageSize: 8,
      total: 0,
      isLoading: false,

      // 是否显示添加/修改信息弹窗
      visible: false,

      // 是否显示分配管理员弹窗
      allocating: false,

      // 弹窗的title
      titleName: '',

      // 弹窗的内容
      dialogInfo: [],

      // 所有用户
      allUsers: [],

      // 被分配的管理员
      selectUsers: [],

      // 模糊搜索关键字
      keywords: ''
    };
  },
  created() {
    this.initButtonList();
    this.initDialogInfo();
    this.getDepartmentInfo({ pageSize: this.pageSize, pageIndex: this.pageIndex });
  },
  mounted() {
  },
  methods: {

    // 初始化dialogInfo
    initDialogInfo(str = '', typeOfUserId = 'input') {
      this.dialogInfo = [
        {
          attrName: 'deptId',
          label: 'ID',
          type: 'hidden',
          value: ''
        },
        {
          attrName: 'deptName',
          label: '部门名称',
          type: 'input',
          value: '',
          rules: { required: true, message: '请输入分组名称', trigger: 'blur' }
        }
      ];
    },

    // 按关键字搜索
    searchContent(value) {
      this.keyWords = value;
      if (value === '') {
        this.pageSize = 8;
        this.pageIndex = 1;
      }
      const pageSize = this.pageSize;
      const pageIndex = this.pageIndex;
      this.getDepartmentInfo({ pageSize, pageIndex, keyWords: value });
    },

    // 获取部门列表
    async getDepartmentInfo(params) {
      this.isLoading = true;
      const res = await this.$http.getRequest('/department/getPaginDept', params);
      const { data, totalCount, retCode } = res;
      if (retCode === 200) {
        this.sourceData = data.map((item) => {
          item.createTime = time(item.createTime, 'YYYY-MM-DD');
          item.updateTime = time(item.updateTime, 'YYYY-MM-DD');
          return item;
        });
        this.total = totalCount;
        this.tableData = copy(this.sourceData);
      } else {
        this.$message({
          message: '获取部门列表失败',
          type: 'error',
          duration: 1000
        });
      }
      this.isLoading = false;
    },

    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
        // 新增分组按钮
        // {
        //   text: '添加',
        //   event: 'add-group',
        //   permission: [PERMISSION.SYS_ADMIN]
        // },

        // 修改分组按钮
        {
          text: '修改',
          event: 'modification-group',
          permission: [PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 分配管理员按钮
        {
          text: '分配管理员',
          event: 'allocate-administrator',
          permission: [PERMISSION.SYS_ADMIN]
        }

        // 删除分组按钮
        // {
        //   text: '删除',
        //   event: 'delete-group',
        //   permission: [PERMISSION.SYS_ADMIN]
        // }
      ];
    },

    // 新增部门
    addDept() {
      // this.$message({
      //   message: '目前无需多加分组，功能待扩展',
      //   type: 'warning',
      //   duration: 1000
      // });
      this.initDialogInfo();
      this.titleName = '添加部门';
      this.visible = true;
      console.log('添加部门');
    },

    // 分配管理员
    allocateAdministrator(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能为一个部门分配管理员！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      };
      this.titleName = '分配管理员';
      this.$rows = rows;
      const { deptId } = rows[0];
      console.log(deptId);
      this.$http.getRequest(REQUEST_URL.DEPARTMENT_ALLUSER, { deptId })
        .then((res) => {
          const { retCode, data } = res;
          if (retCode === 200) {
            console.log(data);
            this.allUsers = data.map((user) => {
              return {
                label: user.userName,
                key: user.userId
              };
            });
            this.selectUsers = data.filter((user) => {
              return user.permission === USER_PERMISSION['管理员'];
            }).map((user) => {
              return user.userId;
            });
          }
        });
      this.allocating = true;
    },

    // 修改部门
    modificationDept(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能编辑一条部门信息！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      } else {
        this.titleName = '修改部门';
        const rowInfo = copy(rows[0]);
        this.visible = true;
        this.dialogInfo.forEach((item, index) => {
          this.dialogInfo[index].value = rowInfo[item.attrName];
        });
      }
    },

    // 删除部门
    deleteDept(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能删除一个部门信息',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.$confirm(
        '确定删除这个部门吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.titleName = '删除部门';
          const department = rows[0];
          this.addOrUpdateOrAllocateAdmin(department);
        });
    },
    success(valueInfo) {
      console.log(valueInfo);
      this.addOrUpdateOrAllocateAdmin(valueInfo);
    },

    // 添加或更新部门信息或分配管理员
    addOrUpdateOrAllocateAdmin(paramsObj, str = '') {
      let url = '';
      let params = {};
      if (this.titleName === '添加部门') {
        url = REQUEST_URL.DEPARTMENT_ADDDEPT;
        delete paramsObj.deptId;
        params = { department: paramsObj };
      } else if (this.titleName === '修改部门') {
        url = REQUEST_URL.DEPARTMENT_UPDATEDEPT;
        params = { department: paramsObj };
      } else if (this.titleName === '分配管理员') {
        url = REQUEST_URL.USER_UPDATESTATE;
        params = paramsObj;
      } else if (this.titleName === '删除部门') {
        url = REQUEST_URL.DEPARTMENT_DELETEDEPARTMENT;
        params = { department: paramsObj };
      }
      // 配置loading
      const loadingOptions = {
        target: '.app-main'
      };

      // 弹出loading窗口
      this.loading = Loading.service(loadingOptions);
      this.$http.postRequest(url, params)
        .then((res) => {
          if (res.retCode === 200) {
            this.$message({
              message: res.message,
              type: 'success',
              duration: 1000
            });
          } else {
            this.$message({
              message: `更新出现问题⊙.⊙！${res.message}`,
              type: 'error',
              duration: 1000
            });
          }
        })
        .catch(err => {
          this.$message({
            message: `操作失败，错误代码：${err}`,
            type: 'error',
            duration: 1000
          });
        })
        .finally(() => {
          this.loading.close && this.loading.close();
          this.getDepartmentInfo(
            this.pageIndex,
            this.pageSize,
            this.keyWords);
        });
    },
    close() {
    },

    // 分配的取消按钮事件
    allocateCancle() {
      this.allocating = false;
      console.log('取消');
    },

    // 分配的确定按钮事件
    allocateOK() {
      let list = [];
      let permission = null;
      if (this.selectUsers.length > 0) {
        permission = USER_PERMISSION['管理员'];
        list = this.selectUsers.map((user) => {
          return {
            userId: user
          };
        });
      } else {
        permission = USER_PERMISSION['组员'];
        list = this.allUsers.map((user) => {
          return {
            userId: user.key
          };
        });
      };
      this.addOrUpdateOrAllocateAdmin({ list, data: [{ permission }] });
      this.allocating = false;
      console.log(this.$rows, list);
      console.log('确定');
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/.people-table{
  min-width: 980px;
    .el-table__header {
    display: flex;
    width: 100%!important;
    .has-gutter {
      width: 100%;
      tr {
        display: flex;
        th {
          text-align: center;
          flex: 2;
        }
        th:nth-child(1) {
          flex: none;
          width: 50px;
        }
        th:nth-child(2) {
          flex: none;
          width: 200px;
        }
      }
    }
  }

  .el-table__body {
    display: flex;
    width: 100%!important;
    tbody {
      width: 100%;
      .el-table__row {
        display: flex;
        td {
          text-align: center;
          flex: 2;
        }
        td:nth-child(1) {
          flex: none;
          width: 50px;
        }
        td:nth-child(2) {
          flex: none;
          width: 200px;
        }
      }
    }
  }
}
/deep/ .allocate {
  .el-transfer-panel {
    width: 250px;
    .el-transfer-panel__body {
      .el-transfer-panel__filter {
        width: 220px;
      }
    }
  }
}
</style>

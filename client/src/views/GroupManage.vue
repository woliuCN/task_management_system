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
      :isShowSearch="true"
      searchPlaceholder="输入小组名/部门名搜索"
      @search-content-changed="searchContent"
      @add-group="addGroup"
      @allocate-group="allocateGroup"
      @modification-group="modificationGroup"
      @delete-group="deleteGroup"
    >
    </data-table>
    <my-dialog
      :visible.sync="visible"
      :tableData="dialogInfo"
      :titleName="titleName"
      @success="success"
      @close="close"
    ></my-dialog>

    <!-- 分配管理员弹窗 -->
    <el-dialog
      title="分配组长"
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
  computed: {
    buttonList() {
      return [
        // 新增分组按钮
        {
          text: '添加',
          event: 'add-group',
          permission: [PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 修改分组按钮
        {
          text: '修改',
          event: 'modification-group',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 分配小组组长按钮
        {
          text: '分配组长',
          event: 'allocate-group',
          permission: [PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 删除分组按钮
        {
          text: '删除',
          event: 'delete-group',
          permission: [PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        }
      ];
    }
  },
  data() {
    return {
      // table抬头
      tableTitle: [
        { label: '小组编号', prop: 'groupId' },
        { label: '小组名', prop: 'groupName' },
        { label: '所属部门', prop: 'deptName' },
        { label: '创建时间', prop: 'createTime' },
        { label: '修改时间', prop: 'updateTime' },
        { label: '备注', prop: 'remarks' }
      ],

      // 源数据
      sourceData: [],
      // table主体数据
      tableData: [],
      pageIndex: 0,
      pageSize: 8,
      total: 0,
      isLoading: false,

      // 是否显示弹窗
      visible: false,

      // 是否显示分配组长弹窗
      allocating: false,

      // 弹窗的title
      titleName: '',

      // 弹窗的内容
      dialogInfo: [],

      // 所有用户
      allUsers: [],

      // 选中分配的组长
      selectUsers: [],

      // 部门列表
      deptList: [],
      trimDept: [],

      // 模糊搜索关键字
      keyWords: ''
    };
  },
  created() {
    this.getGroupInfo({ pageSize: this.pageSize, pageIndex: this.pageIndex });
  },
  mounted() {
    this.initDialogInfo();
    window.$dept = this.deptList;
  },
  methods: {

    // 初始化dialogInfo
    initDialogInfo(str = '', typeOfUserId = 'input') {
      this.dialogInfo = [
        {
          attrName: 'groupId',
          label: 'ID',
          type: 'hidden',
          value: ''
        },
        {
          attrName: 'groupName',
          label: '小组名称',
          type: 'input',
          value: '',
          rules: { required: true, message: '请输入分组名称', trigger: 'blur' }
        },
        {
          attrName: 'deptName',
          label: '所属部门',
          type: 'text',
          // options: this.deptList.filter(item => item !== undefined),
          // optionsName: this.deptList,
          value: this.deptList[1],
          rules: { required: true, message: '请选择所属部门', trigger: 'blur' }
        },
        {
          attrName: 'remarks',
          label: '备注',
          type: 'input',
          value: ''
        }
      ];
    },

    // 按关键字搜索
    searchContent(value) {
      this.keyWords = value;
      if (value === '') {
        this.pageSize = 10;
        this.pageIndex = 1;
      }
      this.getGroupInfo({ pageSize: this.pageSize, pageIndex: this.pageIndex, keyWords: value });
    },

    // 获取分组列表
    async getGroupInfo(params) {
      this.isLoading = true;
      const res = await this.$http.getRequest('/group/getPaginGroup', params);
      const { data, totalCount, retCode } = res;
      if (retCode === 200) {
        this.sourceData = data.map((item) => {
          item.createTime = time(item.createTime, 'YYYY-MM-DD');
          item.updateTime = time(item.updateTime, 'YYYY-MM-DD');
          return item;
        });
        this.total = totalCount;
        this.tableData = copy(this.sourceData);
        await this.getDept();
      } else {
        this.$message({
          message: '获取分组列表失败',
          type: 'error',
          duration: 1000
        });
      }
      this.isLoading = false;
    },

    // 获取部门列表
    async getDept() {
      const res = await this.$http.getRequest('/department/getDepartMentList');
      const { data, retCode } = res;
      if (retCode === 200) {
        data.map((item) => {
          this.deptList[item.deptId] = item.deptName;
          this.trimDept[item.deptName] = item.deptId;
        });
      } else {
        this.$message({
          message: '获取部门列表失败',
          type: 'error',
          duration: 1000
        });
      }
    },

    // 新增分组
    addGroup() {
      // this.$message({
      //   message: '目前无需多加分组，功能待扩展',
      //   type: 'warning',
      //   duration: 1000
      // });
      this.initDialogInfo();
      this.titleName = '添加分组';
      this.visible = true;
      console.log('添加分组');
    },

    // 分配小组组长
    allocateGroup(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能为一个小组分配组长！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      };
      this.titleName = '分配组长';
      this.$rows = rows;
      const { groupId } = rows[0];
      console.log(REQUEST_URL);
      this.$http.getRequest(REQUEST_URL.GROUP_ALLUSER, { groupId })
        .then((res) => {
          const { retCode, data } = res;
          if (retCode === 200) {
            console.log(data);
            this.allUsers = data.filter((user) => {
              return user.permission < USER_PERMISSION['管理员'];
            }).map((user) => {
              return {
                label: user.userName,
                key: user.userId
              };
            });
            this.selectUsers = data.filter((user) => {
              return user.permission === USER_PERMISSION['组长'];
            }).map((user) => {
              return user.userId;
            });
          }
        });
      this.allocating = true;
      console.log('分配');
    },

    // 修改分组
    modificationGroup(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能编辑一个小组信息！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      } else {
        this.titleName = '修改分组';
        this.initDialogInfo();
        const rowInfo = copy(rows[0]);
        this.visible = true;
        this.dialogInfo.forEach((item, index) => {
          this.dialogInfo[index].value = rowInfo[item.attrName];
        });
      }
    },

    // 删除分组
    deleteGroup(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能删除一个小组信息',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.$confirm(
        '确定删除这个小组吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.titleName = '删除';
          const groupInfo = rows[0];
          this.addOrUpdateOrDeleteGroupInfo(groupInfo);
        });
    },
    success(value) {
      console.log(value);
      this.addOrUpdateOrDeleteGroupInfo(value);
    },
    close() {
    },

    // 添加或更新小组信息
    addOrUpdateOrDeleteGroupInfo(groupInfo, str = '') {
      let url = '';
      let params = {};
      if (this.titleName === '添加分组') {
        url = REQUEST_URL.GROUP_ADDGROUP;
        const deptId = this.trimDept[groupInfo.deptName];
        const group = {
          groupName: groupInfo.groupName,
          // deptName: groupInfo.deptName,
          deptId
        };
        params = { group };
      } else if (this.titleName === '修改分组') {
        url = REQUEST_URL.GROUP_UPDATEGROUP;
        delete groupInfo.deptName;
        params = { group: groupInfo };
      } else if (this.titleName === '删除') {
        url = REQUEST_URL.GROUP_DELETEGROUP;
        params = { group: groupInfo };
      } else if (this.titleName === '分配组长') {
        url = REQUEST_URL.USER_UPDATESTATE;
        params = groupInfo;
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
          this.getGroupInfo(
            this.pageIndex,
            this.pageSize,
            this.keyWords);
        });
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
        permission = USER_PERMISSION['组长'];
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
      this.addOrUpdateOrDeleteGroupInfo({ list, data: [{ permission }] });
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

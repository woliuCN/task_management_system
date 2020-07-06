<template>
  <div>
    <data-table
      class="people-table"
      ref="data-table"
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :pageIndex="pageIndex"
      :pageSize="pageSize"
      :total="total"
      :isSelection="true"
      :isShowSearch="true"
      searchPlaceholder="输入名称/小组名/部门名搜索"
      @search-content-changed="searchContent"
      @add-user="addUser"
      @modification-user="modificationUser"
      @allocate-group-member="allocateGroupMemberBefore"
      @dimission="dimission"
      @on-job="onJob"
      @delete-user="deleteUser"
      @init-password="initPasswordOfUsers"
      @page-index-change="pageIndexChange"
    >
    </data-table>

    <!-- 添加、修改成员信息 -->
    <my-dialog
      ref="mydialog"
      :visible.sync="visible"
      :tableData="dialogInfo"
      :titleName="titleName"
      :isSelectedEvent="true"
      @selectedEvent="selected"
      @success="success"
      @close="close"
    ></my-dialog>

    <!-- 分配小组成员 -->
    <el-dialog
      :title="titleName"
      :visible.sync="visibleOfAllocate"
      width="575px"
    >
      <span>部门：</span>
      <el-select v-model="selectedDept" @change="getGroup(selectedDept)" filterable placeholder="请选择">
        <el-option
          v-for="department in departmentList"
          :key="department.deptId"
          :label="department.deptName"
          :value="department.deptId">
        </el-option>
      </el-select>
      <span> 组：</span>
      <el-select v-model="selectedGroup" filterable placeholder="请选择">
        <el-option
          v-for="group in groupList"
          :key="group.groupId"
          :label="group.groupName"
          :value="group.groupId">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="allocateGroupMember">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
import MyDialog from '../components/MyDialog';
import { time, debounce, copy } from '../utils/api.js';
import { Loading } from 'element-ui';
import { PERMISSION, USER_STATUS, USER_PERMISSION, REQUEST_URL } from '../common/config';
export default {
  components: {
    DataTable,
    MyDialog
  },
  data() {
    return {

      // user源数据
      sourceData: [],

      // table抬头
      tableTitle: [
        { label: '编号', prop: 'idx' },
        { label: '工号', prop: 'userId' },
        { label: '名称', prop: 'userName' },
        { label: '部门', prop: 'deptName' },
        { label: '小组', prop: 'groupName' },
        { label: '职位', prop: 'permission' },
        { label: '状态', prop: 'state' },
        { label: '创建时间', prop: 'createTime' },
        { label: '修改时间', prop: 'updateTime' },
        { label: '备注', prop: 'remarks' }
      ],

      // table主体数据
      tableData: [],

      // table操作button
      buttonList: [],
      pageIndex: 1,
      pageSize: 8,
      total: 0,
      loading: '',

      // 是否显示弹窗
      visible: false,
      visibleOfAllocate: false,

      // 弹窗的title
      titleName: '',

      // 弹窗的内容
      dialogInfo: [],

      // 选中的row索引
      selectedRowIndex: '',

      // 选择框的分组信息
      selectGroup: [],
      trimGroup: [],

      // 部门列表
      departmentList: [],

      // 部门的小组列表
      groupList: [],

      // 选中的部门
      selectedDept: '',

      // 选中的小组
      selectedGroup: ''
    };
  },
  created() {
    // 对获取数据过程进行防抖处理
    this.getData = debounce(
      (url, data = {}) => {
        return this.$http.getRequest(url, data);
      },
      500,
      true,
      () => {
        // 当用户操作太快时进行弹窗提醒
        this.$message({
          message: '请不要频繁操作！',
          type: 'warning',
          duration: 1500
        });
        this.loading.close();
      }
    );
    this.getDept();
    this.initDialogInfo();
    this.initButtonList();
  },
  mounted() {
    this.getTableData();
  },
  beforeDestroy() {
    this.loading.close();
  },
  methods: {

    // 按关键字搜索
    searchContent(value) {
      this.keyWords = value;
      const pageSize = this.pageSize = 8;
      const pageIndex = this.pageIndex = 1;
      this.getTableData(pageIndex, pageSize, value);
    },

    // 获取table数据
    getTableData(
      pageIndex = 1,
      pageSize = 8,
      keyWords = ''
    ) {
      // 配置loading
      const loadingOptions = {
        target: '.app-main'
      };

      // 弹出loading窗口
      this.loading = Loading.service(loadingOptions);

      // 数据获取
      const url = '/user/getPaginUser';
      this.getData(url, { pageIndex, pageSize, keyWords })
        .then(res => {
          this.sourceData = res.data;
          const tableData = [];
          let idx = (pageIndex - 1) * pageSize;
          res.data.forEach((tableItem, index) => {
            tableData[index] = {};
            idx += 1;
            tableData[index].idx = idx;
            tableData[index].createTime = time(tableItem.createTime, 'YYYY-MM-DD');
            tableData[index].updateTime = time(tableItem.updateTime, 'YYYY-MM-DD');
            tableData[index].state = USER_STATUS[tableItem.state];
            tableData[index].userId = tableItem.userId;
            tableData[index].userName = tableItem.userName;
            tableData[index].groupId = tableItem.groupId;
            tableData[index].groupName = tableItem.groupName;
            tableData[index].permission = USER_PERMISSION[tableItem.permission];
            tableData[index].remarks = tableItem.remarks;
            if (tableItem.deptId) {
              tableData[index].deptId = tableItem.deptId;
              tableData[index].deptName = this.deptIdTodeptName(tableItem.deptId);
            } else {
              tableData[index].deptName = '';
            }
          });
          this.tableData = tableData;
          this.total = res.totalCount;
          this.pageIndex = pageIndex;

          // 关闭loading
          this.loading.close && this.loading.close();
        })
        .catch((err) => {
          console.log(err);
          // this.paginationData.pageIndex = 1;
          // this.$nextTick(() => {
          //   this.paginationData.pageIndex = oldPageIndex;
          // }, 0);
        });
    },

    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
        // 添加人员按钮
        {
          text: '添加',
          event: 'add-user',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 修改信息按钮
        {
          text: '修改',
          event: 'modification-user',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 在职按钮
        {
          text: '在职',
          event: 'on-job',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 离职按钮
        {
          text: '离职',
          event: 'dimission',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 删除人员按钮
        {
          text: '删除',
          event: 'delete-user',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 分配小组成员
        {
          text: '小组分配成员',
          event: 'allocate-group-member',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 初始化成员密码
        {
          text: '初始化成员密码',
          event: 'init-password',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        }
      ];
    },

    // 初始化dialogInfo
    async initDialogInfo(str = '', typeOfUserId = 'input') {
      this.dialogInfo = [
        {
          attrName: 'userName',
          label: '名称',
          type: 'input',
          value: '',
          rules: { required: true, message: '请输入名称', trigger: 'blur' }
        },
        {
          attrName: 'userId',
          label: '工号',
          type: typeOfUserId,
          value: '',
          rules: { required: true, message: '请输入工号', trigger: 'blur' }
        },
        // {
        //   attrName: 'deptName',
        //   label: '部门',
        //   type: 'select',
        //   options: this.departmentList.map((department) => department.deptName),
        //   optionsName: {},
        //   value: '',
        //   rules: { required: false, message: '请选择部门', trigger: 'blur' },
        //   event: 'selectedEvent'
        // },
        {
          attrName: 'groupName',
          label: '小组',
          type: 'select',
          options: [],
          optionsName: {},
          value: '',
          rules: { required: false, message: '请选择小组', trigger: 'blur' }
        },
        // {
        //   attrName: 'permission',
        //   label: '职位',
        //   type: 'select',
        //   options: [1, 0],
        //   optionsName: { 1: '组长', 0: '组员' },
        //   value: '',
        //   rules: { required: false, message: '请选择小组', trigger: 'blur' }
        // },
        {
          attrName: 'remarks',
          label: '备注',
          type: 'input',
          value: ''
        },
        {
          attrName: 'state',
          label: '状态',
          type: 'select',
          options: ['在职', '离职'],
          optionsName: USER_STATUS,
          value: '在职',
          rules: { required: true, message: '请选择状态', trigger: 'blur' }
        }
      ];
    },

    // 获取部门列表
    async getDept() {
      const res = await this.$http.getRequest(REQUEST_URL.DEPARTMENT_GETDEPARTMENTLIST);
      const { data, retCode } = res;
      if (retCode === 200) {
        this.departmentList = data;
      } else {
        this.$message({
          message: '获取部门列表失败',
          type: 'error',
          duration: 1000
        });
      }
    },

    // 选中部门更新小组列表
    selected(dept) {
      const deptId = this.deptNameTodeptId(dept);
      this.getGroup(deptId);
    },

    // 部门名称和id映射
    deptNameTodeptId(name) {
      const deptId = (this.departmentList.filter((department) => {
        return department.deptName === name;
      }))[0].deptId;
      return deptId;
    },

    // 部门id映射部门名称
    deptIdTodeptName(deptId) {
      const deptName = (this.departmentList.filter((department) => {
        return department.deptId === deptId;
      }))[0].deptName;
      return deptName;
    },

    // 小组名称和id映射
    groupNameTogroupId(name) {
      const groupId = (this.groupList.filter((group) => {
        return group.groupName === name;
      }))[0].groupId;
      return groupId;
    },

    // 获取部门所有小组列表
    async getGroup(deptId) {
      const res = await this.$http.getRequest(REQUEST_URL.GROUP_GETGROUPBYDEPT, { deptId });
      const { data, retCoude } = res;
      if (retCoude === 200) {
        this.groupList = data;
        // 更新dialogInfo
        this.$refs.mydialog.internalTableData[2].options = data.map(group => {
          return group.groupName;
        });
        this.$refs.mydialog.internalTableData[2].value = '';
        this.selectedGroup = '';
      } else {
        this.$message({
          message: '获取小组列表失败',
          type: 'error',
          duration: 1000
        });
      }
    },

    // 新增人员
    addUser(rows) {
      this.initDialogInfo();
      this.titleName = '添加人员';
      this.getGroup(1);
      this.visible = true;
      console.log('新增人员');
    },

    // 修改人员
    async modificationUser(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能修改一条信息！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      } else {
        this.titleName = '修改人员';
        const rowInfo = copy(rows[0]);
        this.selectedRowIndex = rowInfo.idx - (this.pageIndex - 1) * this.pageSize - 1;
        const permission = USER_PERMISSION[rowInfo.permission];
        this.initDialogInfo('修改', 'text');
        this.visible = true;
        console.log(rowInfo);
        if (rowInfo.deptId) {
          rowInfo.deptName = this.deptIdTodeptName(rowInfo.deptId);
          this.$nextTick(async () => {
            await this.getGroup(rowInfo.deptId);
            this.$refs.mydialog.internalTableData[2].value = rowInfo.groupName;
          });
        }
        this.dialogInfo.forEach((item, index) => {
          if (item.attrName === 'permission') {
            this.dialogInfo[index].value = permission;
          } else {
            this.dialogInfo[index].value = rowInfo[item.attrName];
          }
        });
        console.log(this.dialogInfo);
      }
    },

    // 删除人员
    deleteUser(rows) {
      if (rows.length < 1) {
        this.$message({
          message: '至少选中一条信息',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.$confirm(
        `确定删除这${rows.length}位员工吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.titleName = '删除';
          const list = [];
          rows.map((row) => {
            const state = this.stateTrim(row.state);
            list.push({
              userId: row.userId,
              userName: row.userName,
              userGroup: row.userGroup,
              remarks: row.remarks,
              state
            });
          });
          this.addOrUpdateOrDeleteUserInfo(list);
        });
      // console.log('删除人员', rows);
    },

    // 设置人员在职
    onJob(rows) {
      if (rows.length < 1) {
        this.$message({
          message: '至少选中一条信息',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.$confirm(
        `确定将这${rows.length}位员工设置为在职吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.titleName = '在职';
          const list = [];
          rows.map((row) => {
            const state = this.stateTrim(row.state);
            list.push({
              userId: row.userId,
              userName: row.userName,
              userGroup: row.userGroup,
              remarks: row.remarks,
              state
            });
          });
          this.addOrUpdateOrDeleteUserInfo(list);
        });
    },

    // 设置人员离职
    dimission(rows) {
      if (rows.length < 1) {
        this.$message({
          message: '至少选中一条信息',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.$confirm(
        `确定将这${rows.length}位员工设置为离职吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.titleName = '离职';
          const list = [];
          rows.map((row) => {
            const state = this.stateTrim(row.state);
            list.push({
              userId: row.userId,
              userName: row.userName,
              userGroup: row.userGroup,
              remarks: row.remarks,
              state
            });
          });
          this.addOrUpdateOrDeleteUserInfo(list);
        });
    },

    // 分配小组请求发送前
    async allocateGroupMemberBefore(rows) {
      if (rows.length < 1) {
        this.$message({
          message: '至少选中一条信息',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.titleName = '小组分配成员';
      this.visibleOfAllocate = true;
      await this.getDept();
      this.$rows = rows;
    },

    // 发送分配小组请求
    allocateGroupMember() {
      if (this.selectedGroup) {
        // const groupName = (this.groupList.filter((group) => {
        //   return group.groupId === this.selectedGroup;
        // }))[0].groupName;
        const deptId = this.selectedDept;
        const groupId = this.selectedGroup;
        // console.log(this.$rows, groupName);
        this.addOrUpdateOrDeleteUserInfo(this.$rows, [{ deptId }, { groupId }]);
      } else {
        this.$message({
          message: '请选择要分配的小组',
          type: 'warning',
          duration: 1000
        });
      }
      this.visibleOfAllocate = false;
    },

    // 初始化成员密码
    initPasswordOfUsers(rows) {
      if (rows.length < 1) {
        this.$message({
          message: '至少选中一条信息',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.titleName = '初始化成员密码';
      this.addOrUpdateOrDeleteUserInfo(rows);
    },

    pageIndexChange(val) {
      this.pageIndex = val;

      // 获取数据
      this.getTableData(
        this.pageIndex,
        this.pageSize,
        this.keyWords);
    },

    // groupTrim
    groupTrim(groupName) {
      return this.trimGroup[groupName];
    },

    // stateTrim
    stateTrim(stateName) {
      const state = {
        在职: 1,
        离职: 0
      };
      return state[stateName];
    },

    // 保存
    success(valueInfo) {
      console.log(valueInfo);
      const state = this.stateTrim(valueInfo.state);
      const userInfo = {
        userId: valueInfo.userId,
        userName: valueInfo.userName,
        remarks: valueInfo.remarks,

        // 目前单部门，先写死，后面扩展删除
        deptId: 1,
        state
      };
      if (valueInfo.groupName) {
        const userGroupId = this.groupNameTogroupId(valueInfo.groupName);
        userInfo.groupId = userGroupId;
        // userInfo.userGroupName = valueInfo.userGroupName;
        userInfo.permission = valueInfo.permission;
      }
      this.addOrUpdateOrDeleteUserInfo(userInfo);
    },

    // 添加或更新员工信息
    addOrUpdateOrDeleteUserInfo(userInfo, group = []) {
      let url = '';
      let params = {};
      if (this.titleName === '添加人员') {
        url = REQUEST_URL.USER_ADDUSER;
        params = { user: userInfo };
      } else if (this.titleName === '修改人员') {
        url = REQUEST_URL.USER_UPDATEUSER;
        params = { user: userInfo };
      } else if (this.titleName === '删除') {
        url = REQUEST_URL.USER_DELETEUSER;
        params = { list: userInfo };
      } else if (this.titleName === '初始化成员密码') {
        url = REQUEST_URL.USER_RESETPASSWORD;
        params = { list: userInfo };
      } else {
        let data;
        if (this.titleName === '在职') {
          data = [{ state: 1 }, { deleteTime: null }];
        } else if (this.titleName === '离职') {
          data = [{ state: 0 }, { deleteTime: new Date().getTime() }];
        } else {
          data = group;
        }
        url = REQUEST_URL.USER_UPDATESTATE;
        params = { list: userInfo, data };
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
            this.$store.dispatch('asyncGetUsers');
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
          this.getTableData(
            this.pageIndex,
            this.pageSize,
            this.keyWords);
        });
    },

    // 取消
    close() {
      // this.visible = false;
    },

    // 小组映射部门
    groupToDept() {

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
        th:nth-child(1),th:nth-child(2) {
          flex: none;
          width: 50px;
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
        td:nth-child(1),td:nth-child(2) {
          flex: none;
          width: 50px;
        }
      }
    }
  }
}
</style>

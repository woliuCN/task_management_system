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
      @add-user="addUser"
      @modification-user="modificationUser"
      @dimission="dimission"
      @on-job="onJob"
      @delete-user="deleteUser"
      @page-index-change="pageIndexChange"
    >
    </data-table>
    <my-dialog
      :visible.sync="visible"
      :tableData="dialogInfo"
      :titleName="titleName"
      @success="success"
      @close="close"
    ></my-dialog>
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
import MyDialog from '../components/MyDialog';
import { time, debounce, copy } from '../filters/index.js';
import { Loading } from 'element-ui';
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
        { label: '分组', prop: 'userGroup.groupName' },
        { label: '名称', prop: 'userName' },
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

      // 弹窗的title
      titleName: '',

      // 弹窗的内容
      dialogInfo: [],

      // 选中的row索引
      selectedRowIndex: ''
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
          const status = {
            0: '离职',
            1: '在职'
          };
          this.sourceData = res.data;
          const tableData = [];
          let idx = (pageIndex - 1) * pageSize;
          res.data.forEach((tableItem, index) => {
            tableData[index] = {};
            idx += 1;
            tableData[index].idx = idx;
            tableData[index].createTime = time(tableItem.createTime, 'YYYY-MM-DD');
            tableData[index].updateTime = time(tableItem.updateTime, 'YYYY-MM-DD');
            tableData[index].state = status[tableItem.state];
            tableData[index].userId = tableItem.userId;
            tableData[index].userName = tableItem.userName;
            if (tableItem.userGroup[0] === '{' && tableItem.userGroup[tableItem.userGroup.length - 1] === '}') {
              tableData[index].userGroup = JSON.parse(tableItem.userGroup);
            } else {
              tableData[index].userGroup = {};
              tableData[index].userGroup.groupName = tableItem.userGroup;
            }
            tableData[index].remarks = tableItem.remarks;
          });
          this.tableData = tableData;
          this.total = res.totalCount;
          this.pageIndex = pageIndex;

          // 关闭loading
          this.loading.close && this.loading.close();
        })
        .catch(() => {
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
          event: 'add-user'
        },

        // 修改信息按钮
        {
          text: '修改',
          event: 'modification-user'
        },

        // 离职按钮
        {
          text: '离职',
          event: 'dimission'
        },

        // 在职按钮
        {
          text: '在职',
          event: 'on-job'
        },

        // 删除人员按钮
        {
          text: '删除',
          event: 'delete-user'
        }
      ];
    },

    // 初始化dialogInfo
    initDialogInfo(str = '', typeOfUserId = 'input') {
      this.dialogInfo = [
        {
          attrName: 'group',
          label: '所属分组',
          type: 'select',
          options: ['预研'],
          optionsName: { 0: '预研' },
          value: '',
          rules: { required: true, message: '请选择项目', trigger: 'blur' }
        },
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
        {
          attrName: 'permission',
          label: '身份',
          type: 'select',
          options: ['组长', '组员'],
          optionsName: { 1: '组长', 0: '组员' },
          value: '',
          rules: { required: true, message: '请选择身份', trigger: 'blur' }
        },
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
          optionsName: { 1: '在职', 0: '离职' },
          value: '在职',
          rules: { required: true, message: '请选择状态', trigger: 'blur' }
        }
      ];
      // if (str === '修改') {
      //   this.dialogInfo.splice(3, 0, {
      //     attrName: 'permission',
      //     label: '身份',
      //     type: 'select',
      //     options: ['组长', '组员'],
      //     optionsName: { 1: '组长', 0: '组员' },
      //     value: '',
      //     rules: { required: true, message: '请选择身份', trigger: 'blur' }
      //   })
      // }
    },

    // 新增人员
    addUser(rows) {
      this.initDialogInfo();
      this.titleName = '添加人员';
      this.visible = true;
      console.log('新增人员');
    },

    // 修改人员
    modificationUser(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能编辑一条任务！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      } else {
        this.titleName = '修改人员';
        const rowInfo = copy(rows[0]);
        this.selectedRowIndex = rowInfo.idx - (this.pageIndex - 1) * this.pageSize - 1;
        this.initDialogInfo('修改', 'text');
        // console.log(this.sourceData[this.selectedRowIndex]);
        this.visible = true;
        this.dialogInfo.forEach((item, index) => {
          item.attrName === 'group' ? this.dialogInfo[index].value = rowInfo.userGroup.groupName : this.dialogInfo[index].value = rowInfo[item.attrName];
        });
      }
    },

    // 删除人员
    deleteUser(rows) {
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
        })
      // console.log('删除人员', rows);
    },

    // 设置人员在职
    onJob(rows) {
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
        })
    },

    // 设置人员离职
    dimission(rows) {
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
        })
    },

    pageIndexChange(val) {
      this.pageIndex = val;
      console.log(val);

      // 获取数据
      this.getTableData(
        this.pageIndex,
        this.pageSize,
        this.keyWords);
    },

    // groupTrim
    groupTrim(groupName) {
      const group = {

        // 后面通过分组查询接口获取分组信息 ===> [groupName]: groupId;
        预研: 0
      };
      return group[groupName];
    },

    // stateTrim
    stateTrim(stateName) {
      const state = {
        在职: 1,
        离职: 0
      };
      return state[stateName];
    },

    // permissionTrim
    permissionTrim(permissionName) {
      const permission = {
        组长: 1,
        组员: 0
      };
      return permission[permissionName];
    },

    // 保存
    success(valueInfo) {
      const permission = this.permissionTrim(valueInfo.permission);
      const userGroup = {
        groupId: this.groupTrim(valueInfo.group),
        groupName: valueInfo.group
      };
      const state = this.stateTrim(valueInfo.state);
      const userInfo = {
        userId: valueInfo.userId,
        userName: valueInfo.userName,
        permission,
        userGroup,
        remarks: valueInfo.remarks,
        state
      };
      this.addOrUpdateOrDeleteUserInfo(userInfo);
    },

    // 添加或更新员工信息
    addOrUpdateOrDeleteUserInfo(userInfo, str = '') {
      let url = '';
      let params = {};
      if (this.titleName === '添加人员') {
        url = '/user/addUser';
        params = { user: userInfo };
      } else if (this.titleName === '修改人员') {
        url = '/user/updateUser';
        params = { user: userInfo };
      } else if (this.titleName === '删除') {
        url = '/user/deleteUser';
        params = { list: userInfo };
      } else {
        let data;
        if (this.titleName === '在职') {
          data = [{ state: 1 }];
        } else if (this.titleName === '离职') {
          data = [{ state: 0 }];
        }
        url = '/user/updateState';
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
          } else {
            this.$message({
              message: `更新出现问题⊙.⊙！${res.message}`,
              type: 'error',
              duration: 1000
            });
          }
          this.loading.close && this.loading.close();
          this.getTableData(
            this.pageIndex,
            this.pageSize,
            this.keyWords);
        })
        .catch(err => {
          this.$message({
            message: `操作失败，错误代码：${err}`,
            type: 'error',
            duration: 1000
          });
        });
    },

    // 取消
    close() {
      console.log('取消');
      // this.visible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/.people-table{
  .el-table{
    .el-table__header-wrapper{
      .el-table__header{
        background-color: red;
      }
    }
  }
}
</style>

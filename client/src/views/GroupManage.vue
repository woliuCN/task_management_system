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
      @add-group="addGroup"
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
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
import MyDialog from '../components/MyDialog';
import { time, copy } from '../filters/index.js';
export default {
  components: {
    DataTable,
    MyDialog
  },
  data() {
    return {
      // table抬头
      tableTitle: [
        { label: '名称', prop: 'groupName' },
        { label: '状态', prop: 'state' },
        { label: '创建时间', prop: 'createTime' },
        { label: '修改时间', prop: 'updateTime' },
        { label: '备注', prop: 'remarks' }
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

      // 是否显示弹窗
      visible: false,

      // 弹窗的title
      titleName: '',

      // 弹窗的内容
      dialogInfo: []
    };
  },
  created() {
    this.getGroupInfo({ pageSize: this.pageSize, pageIndex: this.pageIndex });
  },
  mounted() {
    this.initButtonList();
    this.initDialogInfo();
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
          label: '名称',
          type: 'input',
          value: '',
          rules: { required: true, message: '请输入分组名称', trigger: 'blur' }
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
          options: ['使用', '禁用'],
          optionsName: { 1: '使用', 0: '禁用' },
          value: '使用',
          rules: { required: true, message: '请选择状态', trigger: 'blur' }
        }
      ];
    },

    // 获取部门列表
    async getGroupInfo(params) {
      this.isLoading = true;
      const res = await this.$http.getRequest('/group/getGroupList', params);
      console.log(res);
      const { data, totalCount, retCoude } = res;
      if (retCoude === 200) {
        this.sourceData = data.map((item) => {
          item.createTime = time(item.createTime, 'YYYY-MM-DD');
          item.updateTime = time(item.updateTime, 'YYYY-MM-DD');
          item.state = this.stateTrim(item.state);
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

    // stateTrim
    stateTrim(value) {
      const state = {
        0: '禁用',
        1: '使用'
      };
      return state[value];
    },

    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
        // 新增分组按钮
        {
          text: '添加',
          event: 'add-group'
        },

        // 修改分组按钮
        {
          text: '修改',
          event: 'modification-group'
        },

        // 删除分组按钮
        {
          text: '删除',
          event: 'delete-group'
        }
      ];
    },

    // 新增分组
    addGroup() {
      this.initDialogInfo();
      this.titleName = '添加分组';
      this.visible = true;
      console.log('添加分组');
    },

    // 修改分组
    modificationGroup(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能编辑一条分组信息！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      } else {
        this.titleName = '修改分组';
        const rowInfo = copy(rows[0]);
        this.visible = true;
        this.dialogInfo.forEach((item, index) => {
          this.dialogInfo[index].value = rowInfo[item.attrName];
        });
      }
    },

    // 删除分组
    deleteGroup(rows) {
      console.log('删除分组', rows);
    },
    success(value) {
      console.log(value);
    },
    close() {
      console.log('close');
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
          flex: 1;
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
          flex: 1;
        }
      }
    }
  }
}
</style>

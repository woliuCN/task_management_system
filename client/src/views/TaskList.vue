<template>
  <div>
    <data-table
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :maxHeight="500"
      :isSelection="true"
      @accomplish-task="accomplishTask"
      @edit-task="editTask"
      @delete-task="deleteTask"
    >
    </data-table>
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
import axios from 'axios';
export default {
  components: {
    DataTable
  },
  data() {
    return {
      tableTitle: [
        { label: '开始时间', prop: 'startTime', fixed: true, width: 150, sortable: true },
        { label: '任务编号', prop: 'id', sortable: true, width: 150 },
        { label: '任务名', prop: 'name', width: 200 },
        { label: '所属项目', prop: 'projectInfo.name', sortable: true },
        { label: '负责人', prop: 'belonger.name', sortable: true },
        { label: '状态', prop: 'state' },
        { label: '工时', prop: 'workingHours' }
      ],
      tableData: [],
      buttonList: [],
      isSelection: false
    };
  },
  methods: {
    // 获取表单抬头和数据
    getTableData(start = 0, pageSize = 10) {
      axios.get('http://127.0.0.1:3389/taskData').then(res => {
        this.tableData = res.data.taskList.slice(0, 10);
      });
    },

    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
        //
        {
          text: '仅显示本周',
          event: 'show-this-week'
        },

        // 数据导入按钮
        {
          text: '导入',
          event: 'import-data'
        },

        // 数据导出按钮
        {
          text: '导出',
          event: 'export-data'
        },

        // 完成任务按钮
        {
          // type: 'success',
          text: '完成',
          event: 'accomplish-task'
          // icon: 'el-icon-check'
        },

        // 任务编辑按钮
        {
          // type: 'primary',
          text: '编辑',
          event: 'edit-task'
          // icon: 'el-icon-edit'
        },

        // 任务删除按钮
        {
          // type: 'danger',
          text: '删除',
          event: 'delete-task'
          // icon: 'el-icon-delete'
        },

        // 生成周报按钮
        {
          text: '生成周报',
          event: 'weekly-report'
        }

      ];
    },

    // 完成任务
    accomplishTask(rows) {
      console.log(rows);
    },

    // 编辑任务
    editTask(rows) {
      console.log(rows);
    },

    // 删除任务
    deleteTask(rows) {
      console.log(rows);
    }
  },
  mounted() {
    this.getTableData();
    this.initButtonList();
  }
};
</script>

<style>
</style>

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
      @add-task="addTask"
    >
      <template v-slot:tmp_search>
        <el-date-picker
          v-model="timeInterval"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="mini"
          value-format="timestamp"
          class="date-picker"
          :picker-options="timePickerOptions"
          @change="timePickerChanged"
        >
        </el-date-picker>
      </template>
    </data-table>

    <data-dialog
      :isShow="isDialogShow"
      :projectList="projectList"
      :userList="userList"
      @submit-task="submitTask"
      @close-dialog="isDialogShow = false"
    >
    </data-dialog>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import DataDialog from './components/Dialog';
import axios from 'axios';
export default {
  components: {
    DataTable,
    DataDialog
  },
  data() {
    return {
      tableTitle: [
        { label: '开始时间', prop: 'startTime', fixed: true, width: 150, sortable: true },
        { label: '任务编号', prop: 'id', sortable: true, width: 150 },
        { label: '任务名', prop: 'name', width: 250 },
        { label: '所属项目', prop: 'projectInfo.name', sortable: true, width: 200 },
        { label: '负责人', prop: 'belonger.name', sortable: true },
        { label: '状态', prop: 'state' },
        { label: '工时', prop: 'workingHours' }
      ],
      tableData: [],
      buttonList: [],
      isSelection: false,
      timeInterval: '',
      isDialogShow: false,
      timePickerOptions: {
        firstDayOfWeek: 1,
        shortcuts: [{
          text: '本周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            // 通过今天的时间减去本周已过天数，得出本周周一的日期
            start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() - 1));

            // 今天的时间加上6天可得到本周最后一天的日期
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '本月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            // 获取本月1号的时间戳
            start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDate() - 1));

            // 获取当前月份
            const month = end.getMonth();

            // 生成实际的月份: 由于curMonth会比实际月份小1, 故需加1
            end.setMonth(month + 1);

            // 将日期设置为0, 再通过getDate()就可以获取本月天数
            end.setDate(0);

            // 获取本月最后一天的时间戳
            end.setTime(start.getTime() + 3600 * 1000 * 24 * (end.getDate() - 1));
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      projectList: [
        { id: 1, name: '项目1' },
        { id: 2, name: '项目2' },
        { id: 3, name: '项目3' },
        { id: 4, name: '项目4' }
      ],
      userList: [
        { id: 1, name: '员工1' },
        { id: 2, name: '员工2' },
        { id: 3, name: '员工3' },
        { id: 4, name: '员工4' }
      ]
    };
  },
  methods: {
    // 获取表单抬头和数据
    getTableData(start = 0, pageSize = 10) {
      // axios.get('http://127.0.0.1:3389/taskData').then(res => {
      //   const status = {
      //     0: '挂起',
      //     1: '未完成',
      //     2: '已完成'
      //   };
      //   this.tableData = res.data.taskList.slice(0, 10);
      //   this.tableData.map(tableItem => {
      //     tableItem.state = status[tableItem.state];
      //   });
      // });
    },

    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
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

        // 新增任务
        {
          text: '新增',
          event: 'add-task'
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

    // 新增任务
    addTask() {
      this.isDialogShow = true;
    },

    // 提交新增任务表单
    submitTask(data) {
      data.project = this.projectList.filter(projectItem => {
        return projectItem.id === data.project;
      })[0];

      data.belonger = this.userList.filter(user => {
        return user.id === data.belonger;
      })[0];
      console.log(data);
      axios.post('http://49713218ec71.ngrok.io/api/task/addTask', { task: data }, (res) => {
        console.log(res);
      })
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
    },

    // 时间选择器内容发生变化
    timePickerChanged() {
      // 发送请求
      console.log(this.timeInterval);
    }
  },
  mounted() {
    this.getTableData();
    this.initButtonList();
  }
};
</script>

<style lang="scss" scoped>
  /deep/.date-picker{
    margin-right: 1vw;
  }
</style>

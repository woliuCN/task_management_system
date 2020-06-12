<template>
  <div>
    <data-table
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :isSelection="true"
      :isShowSearch="true"
      :pagination="paginationData"
      @accomplish-task="accomplishTask"
      @edit-task="editTask"
      @delete-task="deleteTask"
      @add-task="addTask"
      @search-content-changed="searchContentChanged"
      @page-index-change="pageIndexChange"
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
import { time, debounce } from '../../filters/index.js';
export default {
  components: {
    DataTable,
    DataDialog
  },
  data() {
    return {
      tableTitle: [
        { label: '开始时间', prop: 'startTime', fixed: true, width: 150, sortable: true },
        { label: '任务编号', prop: 'taskId', sortable: true, width: 150 },
        { label: '任务名', prop: 'content', width: 250 },
        { label: '所属项目', prop: 'project.name', sortable: true, width: 200 },
        { label: '负责人', prop: 'belonger.name', sortable: true },
        { label: '状态', prop: 'state' },
        { label: '工时', prop: 'workingHours' }
      ],
      tableData: [],
      buttonList: [],
      isSelection: false,
      timeInterval: [],
      isDialogShow: false,
      keyWords: '',
      startTime: 0,
      endTime: new Date().getTime(),
      pageIndex: 0,
      pageSize: 8,
      paginationData: {
        total: 0,
        pageIndex: 0,
        pageSize: 10
      },
      timePickerOptions: {
        firstDayOfWeek: 1,
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            const start = new Date();
            const end = new Date();

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '本周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            // 通过今天的时间减去本周已过天数，得出本周周一的日期
            start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() - 1));

            // 今天的时间加上6天可得到本周最后一天的日期
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
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

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
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
    // 格式化时间戳
    time,

    // 获取表单抬头和数据
    getTableData(
      pageIndex = 0,
      pageSize = 8,
      startTime = 0,
      endTime = new Date().getTime(),
      keyWords = ''
    ) {
      const url = 'http://192.168.31.84:30/api/task/getTaskList';

      // 用于阻止快速发送请求时，页数发生错误跳转
      // const oldPageIndex = this.paginationData.pageIndex;
      this.getData(url, { pageIndex, pageSize, startTime, endTime, keyWords })
        .then(res => {
          console.log(res);
          const status = {
            1: '未启动',
            2: '进行中',
            3: '挂起',
            4: '完成'
          };
          const tableData = res.data.taskList;
          tableData.map(tableItem => {
            tableItem.startTime = time(tableItem.startTime, 'YYYY-MM-DD');
            tableItem.project = JSON.parse(tableItem.project);
            tableItem.belonger = JSON.parse(tableItem.belonger);
            tableItem.state = status[tableItem.state];
          });
          this.tableData = tableData;
          this.paginationData.total = res.data.totalCount;
          this.paginationData.pageIndex = pageIndex;
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
    submitTask(taskInfo) {
      taskInfo = JSON.parse(taskInfo);
      taskInfo.project = this.projectList.find(projectItem => {
        return projectItem.id === taskInfo.project;
      });

      taskInfo.belonger = this.userList.find(user => {
        return user.id === taskInfo.belonger;
      });
      // axios.post('http://01b3e79a05df.ngrok.io/api/task/addTask', { task: taskInfo }, (res) => {
      //   console.log(res);
      //   this.$message({
      //     message: '添加任务成功',
      //     type: 'success',
      //     duration: 1500
      //   });
      // }, (err) => {
      //   console.log(err);
      //   this.$message({
      //     message: `添加任务失败，错误原因:${err.message}`,
      //     type: 'error',
      //     duration: 1500
      //   });
      // });
      axios.post('http://01b3e79a05df.ngrok.io/api/task/addTask', { task: taskInfo })
        .then(res => {
          this.$message({
            message: '添加任务成功',
            type: 'success',
            duration: 1500
          });
        }).catch(err => {
          console.log(err);
        });
    },

    // 完成任务
    accomplishTask(rows) {
      // some code
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
      // 先判断timeInterval的格式是否正确
      this.timeInterval = Array.isArray(this.timeInterval) && this.timeInterval.length === 2
        ? this.timeInterval : [0, new Date().getTime()];
      [this.startTime, this.endTime] = this.timeInterval;
      this.pageIndex = 0;
      // 获取数据
      this.getTableData(
        this.pageIndex,
        this.pageSize,
        this.startTime,
        this.endTime,
        this.keyWords);
      // this.paginationData.pageIndex = this.pageIndex;
    },

    pageIndexChange(val) {
      this.pageIndex = val;
      // 获取数据
      this.getTableData(
        this.pageIndex,
        this.pageSize,
        this.startTime,
        this.endTime,
        this.keyWords);
      // this.paginationData.pageIndex = this.pageIndex;
    },

    // 搜索索引
    searchContentChanged(searchContent) {
      this.keyWords = searchContent;
      this.pageIndex = 0;
      this.getTableData(
        this.pageIndex,
        this.pageSize,
        this.startTime,
        this.endTime,
        this.keyWords);
      // this.paginationData.pageIndex = this.pageIndex;
    }
  },
  mounted() {
    this.getTableData();
    this.initButtonList();
  },
  created() {
    this.getData = debounce((url, data) => {
      return axios.post(url, data);
    }, 1500, true);
    axios.get('http://192.168.31.84:30/api/user/getUserList/options')
      .then(res => {
        this.userList = res.data.userList;
      });
  }
};
</script>

<style lang="scss" scoped>
  /deep/.date-picker{
    margin-right: 1vw;
  }
</style>

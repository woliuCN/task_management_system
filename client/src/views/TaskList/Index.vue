<template>
  <div>
    <data-table
      ref="data-table"
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :isSelection="true"
      :isShowSearch="true"
      :pageIndex="pageIndex"
      :pageSize="pageSize"
      :total="total"
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
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="mini"
          value-format="timestamp"
          class="date-picker"
          :picker-options="timePickerOptions"
          :editable="false"
          :clearable="true"
          @change="timePickerChanged"
        >
        </el-date-picker>
      </template>
    </data-table>

    <data-dialog
      :isShow="isDialogShow"
      :userList="userList"
      :projectList="projectList"
      :taskInfo="taskInfo"
      @submit-task="submitTask"
      @close-dialog="clearTaskInfo"
    >
    </data-dialog>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import DataDialog from './components/Dialog';
import { time, debounce, copy } from '../../filters/index.js';
import { Loading } from 'element-ui';
export default {
  components: {
    DataTable,
    DataDialog
  },
  data() {
    return {
      // table抬头
      tableTitle: [
        { label: '开始时间', prop: '_startTime', fixed: true, width: 150 },
        { label: '任务编号', prop: 'taskId', width: 150 },
        { label: '任务名', prop: 'content', width: 250 },
        { label: '所属项目', prop: 'project.projectName', width: 200 },
        { label: '负责人', prop: 'belonger.userName' },
        { label: '状态', prop: '_state' },
        { label: '工时', prop: 'workingHours' }
      ],

      // table主体数据
      tableData: [],

      // table操作button
      buttonList: [],

      // 是否显示table左侧的多选按钮
      isSelection: false,

      // table数据显示的时间范围
      timeInterval: [],

      // 是否弹出弹窗，用于增加/修改任务
      isDialogShow: false,

      // table数据索引
      keyWords: '',

      startTime: 0,
      endTime: undefined,
      pageIndex: 0,
      pageSize: 8,
      total: 0,
      loading: '',

      timePickerOptions: {
        firstDayOfWeek: 1,
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date();
              const end = new Date();

              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);
              picker.$emit('pick', [start, end]);
            }
          },
          {
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
          },
          {
            text: '上周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              // 通过今天的时间减去本周已过天数，得出本周周一的日期
              start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() + 6));

              // 今天的时间加上6天可得到本周最后一天的日期
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);

              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);
              picker.$emit('pick', [start, end]);
            }
          },
          {
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
          }
        ]
      },

      // 已有项目列表，用于在新建任务时选择
      projectList: [],

      // 已有用户列表，用于在新建任务时选择
      userList: [],

      // 新增/修改任务的表单数据
      taskInfo: {
        content: '',
        project: { projectId: '', projectName: '' },
        belonger: { userId: '', userName: '' },
        state: 0,
        taskType: 0,
        workingHours: 8,
        startTime: new Date().getTime(),
        endTime: new Date().getTime()
      }
    };
  },
  methods: {
    // 格式化时间戳
    time,

    // 获取table数据
    getTableData(
      pageIndex = 0,
      pageSize = 8,
      startTime = 0,
      endTime = undefined,
      keyWords = ''
    ) {
      // 配置loading
      const loadingOptions = {
        target: '.app-main'
      };

      // 弹出loading窗口
      this.loading = Loading.service(loadingOptions);

      // 数据获取
      const url = '/task/getTaskList';
      this.getData(url, { pageIndex, pageSize, startTime, endTime, keyWords })
        .then(res => {
          if (res.retCode === -1) {
            this.$message({
              message: '数据获取出错',
              type: 'error',
              duration: 1000
            })
            this.loading.close();
            return -1;
          }

          const status = {
            0: '未启动',
            1: '进行中',
            2: '完成',
            3: '挂起'
          };
          const tableData = res.data;
          tableData.map(tableItem => {
            tableItem._startTime = this.time(tableItem.startTime, 'YYYY-MM-DD');
            tableItem._state = status[tableItem.state];
            tableItem.project = JSON.parse(tableItem.project);
            tableItem.belonger = JSON.parse(tableItem.belonger);
          });
          this.tableData = tableData;
          this.total = res.totalCount;
          this.pageIndex = pageIndex;

          // 关闭loading
          this.loading.close();
        })
        .catch(() => {
          this.loading.close();
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
          event: 'accomplish-task',
          limit: 1
          // icon: 'el-icon-check'
        },

        // 任务编辑按钮
        {
          // type: 'primary',
          text: '编辑',
          event: 'edit-task',
          limit: 1
          // icon: 'el-icon-edit'
        },

        // 任务删除按钮
        {
          // type: 'danger',
          text: '删除',
          event: 'delete-task',
          limit: 1
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
      delete taskInfo._state;
      delete taskInfo._startTime;

      // 通过taskInfo是否存在taskID来判断是进行新增操作还是更新操作
      let url;
      let successMessage;
      let errorMessage;
      const taskId = taskInfo.taskId;
      if (taskId === undefined) {
        url = '/task/addTask';
        successMessage = '增加任务成功';
        errorMessage = '增加任务失败';
      } else {
        url = '/task/updateTask';
        successMessage = '修改任务成功';
        errorMessage = '修改任务失败';
      }

      // 提交数据到服务器
      this.$http.postRequest(url, { task: taskInfo })
        .then(res => {
          // 增加/修改任务失败
          if (res.retCode === -1) {
            this.$message({
              message: `${errorMessage}，错误代码:${res.message}`,
              type: 'error',
              duration: 1500
            });
          } else {
            this.$message({
              message: successMessage,
              type: 'success',
              duration: 1500
            });
          }

          // 增加数据成功后刷新数据列表
          this.getTableData();
        }).catch(err => {
          this.$message({
            message: `操作失败，错误代码:${err}`,
            type: 'error',
            duration: 1500
          });
        });
    },

    // 完成任务
    accomplishTask(rows) {
      // some code
    },

    // 编辑任务
    editTask(rows) {
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能编辑一条任务！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      } else {
        this.taskInfo = copy(rows[0]);
        this.isDialogShow = true;
      }
    },

    // 删除任务
    deleteTask(rows) {
      this.$confirm(`确定删除这${rows.length}项任务吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const taskList = copy(rows);
        taskList.map(taskItem => {
          delete taskItem._state;
          delete taskItem._startTime;
        });
        this.$http.postRequest('/task/deleteTask', { list: taskList })
          .then(res => {
            if (res.retCode === -1) {
              this.$message({
                message: `删除失败,错误代码:${res.message}`,
                type: 'error',
                duration: 1000
              });
            } else {
              this.$message({
                message: '删除成功',
                type: 'success',
                duration: 1000
              });

              // 删除数据成功后刷新数据列表
              this.getTableData();
            }
          });
      });
    },

    // 时间选择器内容发生变化
    timePickerChanged() {
      // 先判断timeInterval的格式是否正确
      this.timeInterval = Array.isArray(this.timeInterval) && this.timeInterval.length === 2
        ? this.timeInterval : [0, undefined];
      [this.startTime, this.endTime] = this.timeInterval;
      this.pageIndex = 0;

      // 获取数据
      this.getTableData(
        this.pageIndex,
        this.pageSize,
        this.startTime,
        this.endTime,
        this.keyWords);

      // 页码重置为1
      this.pageIndex = 1;
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

      // 页码重置为1
      this.pageIndex = 1;
    },

    // 关闭对话框时初始化任务数据
    clearTaskInfo() {
      this.isDialogShow = false;
      this.taskInfo = {
        content: '',
        project: { projectId: '', projectName: '' },
        belonger: { userId: '', userName: '' },
        state: 0,
        taskType: 0,
        workingHours: 8,
        startTime: new Date().getTime(),
        endTime: new Date().getTime()
      };
    }
  },
  mounted() {
    this.getTableData();
    this.initButtonList();
  },
  created() {
    // 对获取数据过程进行防抖处理
    this.getData = debounce(
      (url, data) => {
        return this.$http.postRequest(url, data);
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

    // 获取用户列表数据 用于新增任务
    this.$http.getRequest('/user/getUserList/options')
      .then(res => {
        this.userList = res.data;
      });

    // 获取项目列表数据
    this.$http.getRequest('/project/getProjectList/options')
      .then(res => {
        this.projectList = res.data;
      });
  }
};
</script>

<style lang="scss" scoped>
  /deep/.date-picker{
    margin-right: 1vw;
  }
</style>

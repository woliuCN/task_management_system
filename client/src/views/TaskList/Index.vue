<template>
  <div>
    <data-table
      class="people-table"
      ref="data-table"
      searchPlaceholder="输入负责人/项目名搜索"
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :isSelection="true"
      :isShowSearch="true"
      :pageIndex="pageIndex"
      :pageSize="pageSize"
      :total="total"
      @accomplish-task="accomplishTask"
      @run-task="runTask"
      @pend-task="pendTask"
      @edit-task="editTask"
      @delete-task="deleteTask"
      @add-task="addTask"
      @search-content-changed="searchContentChanged"
      @page-index-change="onPageIndexChange"
      @import-data="openExportDialog('import')"
      @export-data="openExportDialog('export')"
      @weekly-report="openExportDialog('weekreport')"
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
          @change="onTimePickerChanged"
        >
        </el-date-picker>
      </template>
    </data-table>

    <edit-dialog
      :title="title"
      :isShow="isEditDialogShow"
      :userList="userList"
      :projectList="projectList"
      :taskInfo="taskInfo"
      :isEdit="isEditTaskInfo"
      @submit-task="submitTask"
      @close-dialog="clearTaskInfo"
      @close-edit-mode="isEditTaskInfo = false"
    >
    </edit-dialog>

    <export-dialog
      :isShow="isExportDialogShow"
      :openWith="openWith"
      @close-dialog="isExportDialogShow = false"
    >
    </export-dialog>

    <accomplish-dialog
      :isShow="isAccomplishDialogShow"
      :taskInfo="taskInfo"
      @close-dialog="isAccomplishDialogShow = false"
      @change-workinghours="changeWorkingHours"
    >
    </accomplish-dialog>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import EditDialog from './components/EditDialog';
import ExportDialog from './components/ExportDialog';
import AccomplishDialog from './components/AccomplishDialog';
import { time, debounce, copy } from '../../utils/api.js';
import { initTimePicker } from '../../utils/timePickerConfig.js';
import { STATUS, STATUS_CH, TASK_TYPE, TASK_TYPE_CH, REQUEST_URL, PERMISSION } from '../../common/config';
export default {
  components: {
    DataTable,
    EditDialog,
    ExportDialog,
    AccomplishDialog
  },
  data() {
    return {
      title: '新增任务',

      // table主体数据
      tableData: [],

      // 是否显示table左侧的多选按钮
      isSelection: false,

      // table数据显示的时间范围
      timeInterval: [],

      // 是否弹出弹窗，用于增加/修改任务
      isEditDialogShow: false,

      // 是否弹出导入/导出窗口
      isExportDialogShow: false,

      isAccomplishDialogShow: false,

      // 导入/导出窗口显示的内容，可选项为'import' - 导入， 'export' - 导出
      openWith: '',

      // table数据索引
      keyWords: '',
      startTime: 0,
      endTime: undefined,
      pageIndex: 0,
      pageSize: 8,
      total: 0,
      loading: '',

      // 已有项目列表，用于在新建任务时选择
      projectList: [],

      // 已有用户列表，用于在新建任务时选择
      userList: [],

      // 新增/修改任务的表单数据
      taskInfo: {},

      // 是否进入编辑模式，编辑模式与新增模式的弹窗内容有差别
      isEditTaskInfo: false
    };
  },
  methods: {
    // 格式化时间戳
    time,

    debounce,

    copy,

    /**
     * 获取表格数据
     * @param method{String}: 默认为KEEP，若为REFRESH，则重制请求参数
     */
    getTableData(method = 'KEEP') {
      // 将索引条件初始化
      if (method === 'REFRESH') {
        this.pageIndex = 0;
        this.pageSize = 8;
        this.keyWords = '';
        this.startTime = 0;
        this.endTime = undefined;
      }
      const { pageIndex, pageSize, startTime, endTime, keyWords } = this;
      const query = { pageIndex, pageSize, startTime, endTime, keyWords };

      // 配置loading
      const loadingOptions = {
        target: '.app-main'
      };

      // 弹出loading窗口
      this.loading = this.$loading(loadingOptions);

      // 数据获取
      const url = REQUEST_URL.TASK_GETPAGINTASK;
      let message;
      let type;
      let isShowMessage;
      this.getData(url, query)
        .then(res => {
          // 响应代码异常
          if (res.retCode === -1) {
            message = '数据获取出错';
            type = 'error';
            isShowMessage = true;
            return -1;
          }

          // 对获取到的数据进行格式化
          const tableData = res.data;
          tableData.map(tableItem => {
            tableItem._startTime = this.time(tableItem.startTime, 'YYYY-MM-DD');
            tableItem._endTime = this.time(tableItem.endTime, 'YYYY-MM-DD');
            tableItem._state = STATUS_CH[tableItem.state];
            tableItem._type = TASK_TYPE_CH[tableItem.taskType];
          });
          this.tableData = tableData;
          this.total = res.totalCount;
          this.pageIndex = pageIndex;
        })
        .catch((err) => {
          isShowMessage = true;
          message = `请求出错，错误原因${err}`;
          type = 'error';
        })
        .finally(() => {
          this.loading.close();
          if (isShowMessage) {
            this.$message({
              message,
              type,
              duration: 1000
            });
          }
        });
    },

    // 新增任务
    addTask() {
      this.title = '新增任务';
      this.isEditDialogShow = true;
    },

    // 提交新增任务表单
    submitTask(taskInfo) {
      // 获取由子组件发送过来的表单信息并格式化
      taskInfo = JSON.parse(taskInfo);
      delete taskInfo._state;
      delete taskInfo._startTime;
      delete taskInfo._endTime;
      delete taskInfo._type;

      // 通过taskInfo是否存在taskID来判断是进行新增操作还是更新操作
      let url;
      let message = '';
      let successMessage;
      let errorMessage;
      let type;
      const taskId = taskInfo.taskId;

      if (taskId === undefined) {
        url = REQUEST_URL.TASK_ADDTASK;
        successMessage = '增加任务成功';
        errorMessage = '增加任务失败';
      } else {
        url = REQUEST_URL.UPDATETASK;
        successMessage = '修改任务成功';
        errorMessage = '修改任务失败';
      }

      // 提交数据到服务器
      this.$http.postRequest(url, { task: taskInfo })
        .then(res => {
          // 增加/修改任务失败
          if (res.retCode === -1) {
            message = `${errorMessage}，错误代码:${res.message}`;
            type = 'error';
          } else {
            message = successMessage;
            type = 'success';
          }

          // 增加数据成功后刷新数据列表
          this.getTableData('REFRESH');
        })
        .catch(err => {
          message = `操作失败，错误代码:${err}`;
          type = 'error';
        })
        .finally(() => {
          this.$message({
            message,
            type,
            duration: 1000
          });
        });
    },

    // 完成任务
    accomplishTask(rows) {
      // 获取需要修改状态的任务列表
      const taskList = this.copy(rows);
      if (rows.length !== 1) {
        this.$message({
          message: '一次只能完成一条任务！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.isAccomplishDialogShow = true;
      this.taskInfo = taskList[0];
    },

    // 将任务状态更新为“挂起”
    pendTask(rows) {
      const taskList = this.copy(rows);
      this.changeTaskState(taskList, STATUS.PEND);
    },

    // 将任务状态更新为“运行中”
    runTask(rows) {
      const taskList = this.copy(rows);
      this.changeTaskState(taskList, STATUS.RUNNING);
    },

    // 发送请求更新任务状态
    changeTaskState(taskList, state) {
      const url = REQUEST_URL.TASK_UPDATESTATE;
      this.$http.postRequest(url, { list: taskList, data: [{ state }] })
        .then(res => {
          if (res.retCode === 200) {
            this.$message({
              message: '修改成功！',
              type: 'success',
              duration: 1000
            });

            // 更新完成之后刷新页面数据
            this.getTableData();
          } else {
            this.$message({
              message: `修改失败!错误原因:${res.message}`,
              type: 'error',
              duration: 1000
            });
          }
        });
    },

    //  完成任务确认触发事件
    changeWorkingHours(completeForm) {
      let message;
      let type;
      const url = REQUEST_URL.TASK_UPDATESTATE;
      // 发送请求
      this.$http.postRequest(
        url,
        {
          list: [completeForm.task],
          data: [{ state: 1 }, { workingHours: completeForm.workingHours }]
        }
      )
        .then(res => {
          if (res.retCode === 200) {
            message = '修改成功！';
            type = 'success';

            // 更新完成之后刷新页面数据
            this.getTableData();
          } else {
            message = `修改失败!错误原因:${res.message}`;
            type = 'error';
          }
        })
        .catch(err => {
          message = `修改失败!错误原因:${err}`;
          type = 'error';
        })
        .finally(() => {
          this.$message({
            message,
            type,
            duration: 1000
          });
          this.dialogVisible = false;
        });
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
        this.taskInfo = this.copy(rows[0]);
        this.title = '编辑任务';
        this.isEditDialogShow = true;
        this.isEditTaskInfo = true;
      }
    },

    // 删除任务
    deleteTask(rows) {
      this.$confirm(
        `确定删除这${rows.length}项任务吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          const taskList = this.copy(rows);
          // 删除列表中不必要字段
          taskList.map(taskItem => {
            delete taskItem._state;
            delete taskItem._startTime;
            delete taskItem._endTime;
            delete taskItem._type;
          });
          let message;
          let type;
          // 发送删除请求
          const url = REQUEST_URL.TASK_DELETETASK;
          this.$http.postRequest(url, { list: taskList })
            .then(res => {
              if (res.retCode === -1) {
                message = `删除失败,错误代码:${res.message}`;
                type = 'error';
              } else {
                message = '删除成功';
                type = 'success';

                // 删除数据成功后刷新数据列表
                this.getTableData('REFRESH');
              }
            })
            .catch(err => {
              message = `操作失败，错误代码：${err}`;
              type = 'error';
            })
            .finally(() => {
              this.$message({
                message,
                type,
                duration: 1000
              });
            });
        });
    },

    // 时间选择器内容发生变化
    onTimePickerChanged() {
      // 先判断timeInterval的格式是否正确
      this.timeInterval = Array.isArray(this.timeInterval) && this.timeInterval.length === 2
        ? this.timeInterval
        : [0, undefined];
      [this.startTime, this.endTime] = this.timeInterval;
      this.pageIndex = 0;

      // 获取数据
      this.getTableData();
    },

    onPageIndexChange(val) {
      this.pageIndex = val;

      // 获取数据
      this.getTableData();
    },

    // 搜索索引
    searchContentChanged(searchContent) {
      this.keyWords = searchContent;
      this.pageIndex = 0;

      // 获取数据
      this.getTableData();
    },

    // 关闭对话框时初始化任务数据
    clearTaskInfo() {
      this.isEditDialogShow = false;
      // this.isEditTaskInfo = false;
      this.initTaskInfo();
    },

    initTaskInfo() {
      this.taskInfo = {
        content: '',
        projectId: '',
        projectName: '',
        belongerId: '',
        belongerName: '',
        state: STATUS.RUNNING,
        taskType: TASK_TYPE.PLAN,
        startTime: new Date().getTime(),
        endTime: new Date().getTime()
      };
    },

    openExportDialog(method) {
      this.openWith = method;
      this.isExportDialogShow = true;
    }
  },
  computed: {
    // 初始化时间选择器
    timePickerOptions() {
      const onPick = () => {};
      return initTimePicker(
        ['today', 'week', 'lastWeek', 'month', 'lastMonth', 'all'],
        { firstDayOfWeek: 1, onPick }
      );
    },

    // 初始化按钮组
    buttonList() {
      return [
        // 数据导入按钮
        {
          text: '导入',
          event: 'import-data',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 数据导出按钮
        {
          text: '导出',
          event: 'export-data',
          permission: [PERMISSION.ORDINARY_USER, PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 新增任务
        {
          text: '新增',
          event: 'add-task',
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },

        // 完成任务按钮
        {
          // type: 'success',
          text: '完成',
          event: 'accomplish-task',
          limit: 1,
          permission: [PERMISSION.ORDINARY_USER, PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
          // icon: 'el-icon-check'
        },

        // 完成任务按钮
        {
          // type: 'success',
          text: '运行',
          event: 'run-task',
          limit: 1,
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
          // icon: 'el-icon-check'
        },

        // 完成任务按钮
        {
          // type: 'success',
          text: '挂起',
          event: 'pend-task',
          limit: 1,
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
          // icon: 'el-icon-check'
        },

        // 任务编辑按钮
        {
          // type: 'primary',
          text: '编辑',
          event: 'edit-task',
          limit: 1,
          permission: [PERMISSION.ORDINARY_USER, PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
          // icon: 'el-icon-edit'
        },

        // 任务删除按钮
        {
          // type: 'danger',
          text: '删除',
          event: 'delete-task',
          limit: 1,
          permission: [PERMISSION.ORDINARY_USER, PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
          // icon: 'el-icon-delete'
        }

        // 生成周报按钮
        // {
        //   text: '生成周报',
        //   event: 'weekly-report',
        //   permission: [PERMISSION.ORDINARY_USER, PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        // }
      ];
    },

    // 初始化表格样式
    tableTitle() {
      return [
        { label: '开始时间', prop: '_startTime', width: 150 },
        { label: '任务类型', prop: '_type', width: 100 },
        { label: '任务编号', prop: 'taskId', width: 150 },
        { label: '任务名', prop: 'content', width: 250 },
        { label: '所属项目', prop: 'projectName', width: 200 },
        { label: '负责人', prop: 'belongerName', width: 100 },
        { label: '状态', prop: '_state', width: 100 },
        { label: '工时', prop: 'workingHours', width: 80 },
        { label: '结束时间', prop: '_endTime' }
      ];
    }
  },
  created() {
    // 对获取数据过程进行防抖处理
    this.getData = this.debounce(
      // 进行防抖处理的函数
      (url, data) => {
        return this.$http.getRequest(url, data);
      },
      // 间隔时间
      500,
      // 立刻执行
      true,
      // 操作太快时执行的回调函数
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
    this.$http.getRequest(REQUEST_URL.USER_GETTOTALUSER_OPTIONS)
      .then(res => {
        this.userList = res.data;
      });

    // 获取项目列表数据
    this.$http.getRequest(REQUEST_URL.PROJECT_GETTOTALPROJECT_OPTIONS)
      .then(res => {
        this.projectList = res.data;
      });

    // 初始化任务信息
    this.initTaskInfo();
  },
  mounted() {
    this.getTableData();
  },
  beforeDestroy() {
    this.loading.close();
  }
};
</script>

<style lang="scss" scoped>
  /deep/.date-picker{
    margin-right: 1vw;
  }
</style>

<template>
  <div>
    <el-dialog
      :title="project.projectName"
      width="80%"
      top='5vh'
      :visible.sync="isShowDetail"
      :destroy-on-close=true
      @close="closeDialog"
    >
      <data-table
        id="table_1"
        :tableTitle="tableTitle"
        :tableData="tableData"
        :isSelection="true"
        :isShowSearch="true"
        :pageIndex="pageIndex"
        :pageSize="pageSize"
        :total="total"
        :buttonList="buttonList"
        @page-index-change="pageIndexChange"
        @search-content-changed="searchContentChanged"
        @run-task="runTask"
        @pend-task="pendTask"
        @accomplish-task="accomplishTask"
        @delete-task="deleteTask"
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
    </el-dialog>
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
import DataTable from '../../../components/DataTable';
import AccomplishDialog from './AccomplishDialog';
import { time, copy } from '../../../utils/api.js';
import { initTimePicker } from '../../../utils/timePickerConfig';
import { REQUEST_URL, STATUS, STATUS_CH, PERMISSION } from '../../../common/config.js';
export default {
  components: {
    DataTable,
    AccomplishDialog
  },
  props: {
    // 目标项目信息，用于索引该项目的子任务
    project: Object,

    // 本弹窗是否显示
    isShow: Boolean
  },
  data() {
    return {
      // 完成任务弹窗项目数据
      isAccomplishDialogShow: false,
      taskInfo: {},

      tableData: [],

      // 时间选择器相关配置
      timeInterval: [],

      // 索引条件
      pageIndex: 0,
      pageSize: 8,
      startTime: 0,
      endTime: undefined,
      keyWords: '',
      total: 0,

      isShowDetail: false,
      targetProject: {},

      loading: '',
      loadingOptions: {
        target: '#table_1 .el-table__body-wrapper'
      }
    };
  },
  methods: {
    // 格式化时间戳
    time,

    // 深拷贝
    copy,

    /**
     * 获取子任务数据
     * @param method{String}: 默认为KEEP，若为REFRESH，则重制请求参数
     */
    showDetail(project, method = 'KEEP') {
      const { projectName, projectId } = project;

      // 如果没有检索数据，直接退出
      if (!projectId || !projectName) {
        this.tableData = [];
        return -1;
      }

      // 将索引条件初始化
      if (method === 'REFRESH') {
        this.pageIndex = 0;
        this.pageSize = 8;
        this.keyWords = '';
        this.startTime = 0;
        this.endTime = undefined;
      }

      this.$nextTick(_ => {
        this.loading = this.$loading(this.loadingOptions);
      });

      const { pageIndex, pageSize, keyWords, startTime, endTime } = this;
      const query = { projectId, projectName, pageIndex, pageSize, keyWords, startTime, endTime };
      // 发送请求获取项目的子任务
      const url = REQUEST_URL.PROJECT_GETTASKBYPROJECT;
      this.$http.getRequest(url, query)
        .then(res => {
          this.tableData = res.data;
          this.total = res.totalCount;
          this.pageIndex = pageIndex;

          // 格式化获取到的数据类型
          this.tableData.map(tableItem => {
            tableItem._startTime = this.time(tableItem.startTime, 'YYYY-MM-DD');
            tableItem._state = STATUS_CH[tableItem.state];
          });
        })
        .finally(() => {
          this.loading.close();
        });
    },

    // 更新页码并获取数据
    pageIndexChange(val) {
      this.pageIndex = val;

      // 获取数据
      this.showDetail(this.project);
    },

    // 搜索内容变更并获取新数据
    searchContentChanged(searchContent) {
      this.keyWords = searchContent;
      this.pageIndex = 0;

      // 获取数据
      this.showDetail(this.project);
    },

    // 将任务状态更新为“完成”
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
            this.showDetail(this.project);
          } else {
            this.$message({
              message: `修改失败!错误原因:${res.message}`,
              type: 'error',
              duration: 1000
            });
          }
        });
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
                this.showDetail(this.targetProject, 'REFRESH');
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

    // 监听时间选择器内容是否发生变化
    timePickerChanged() {
      // 先判断timeInterval的格式是否正确
      this.timeInterval = Array.isArray(this.timeInterval) && this.timeInterval.length === 2
        ? this.timeInterval
        : [0, undefined];
      [this.startTime, this.endTime] = this.timeInterval;
      this.pageIndex = 0;

      // 获取数据
      this.showDetail(this.project);
    },

    // 关闭弹窗
    closeDialog() {
      this.$emit('close-dialog');
      this.tableData = [];
      this.loading.close();
    },

    //  完成任务确认触发事件
    changeWorkingHours(completeForm) {
      let message;
      let type;

      // 发送请求
      const url = REQUEST_URL.TASK_UPDATESTATE;
      this.$http.postRequest(
        url,
        {
          list: [completeForm.task],
          data: [{ state: STATUS.ACCOMPLISH }, { workingHours: completeForm.workingHours }]
        }
      )
        .then(res => {
          if (res.retCode === 200) {
            message = '修改成功！';
            type = 'success';

            // 更新完成之后刷新页面数据
            this.showDetail(this.project);
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
    }
  },
  computed: {
    timePickerOptions() {
      return initTimePicker(
        ['today', 'week', 'lastWeek', 'month', 'lastMonth', 'all'],
        { firstDayOfWeek: 1 }
      );
    },
    tableTitle() {
      return [
        { label: '开始时间', prop: '_startTime', fixed: true, width: 150 },
        { label: '任务编号', prop: 'taskId', width: 200 },
        { label: '任务名', prop: 'content', width: 250 },
        { label: '负责人', prop: 'belongerName', width: 150 },
        { label: '状态', prop: '_state' },
        { label: '工时', prop: 'workingHours' }
      ];
    },
    buttonList() {
      return [
        {
          text: '完成',
          event: 'accomplish-task',
          limit: 1,
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },
        {
          text: '挂起',
          event: 'pend-task',
          limit: 1,
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },
        {
          text: '运行',
          event: 'run-task',
          limit: 1,
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        },
        {
          text: '删除',
          event: 'delete-task',
          limit: 1,
          permission: [PERMISSION.TEAM_MANAGER, PERMISSION.DEPT_MANAGER, PERMISSION.SYS_ADMIN]
        }
      ];
    }
  },
  watch: {
    isShow(val) {
      this.isShowDetail = val;
      if (!this.isShowDetail) {
        this.timeInterval = [];
        this.keyWords = '';
        this.pageIndex = 0;
        this.startTime = 0;
        this.endTime = undefined;
      }
    },

    project(val) {
      this.targetProject = this.copy(val);
      this.showDetail(this.targetProject);
    }
  }
};
</script>

<style lang="scss" scoped>
  /deep/.date-picker{
    margin-right: 1vw;
  }
</style>

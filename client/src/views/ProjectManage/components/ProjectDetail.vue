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
  </div>
</template>

<script>
import DataTable from '../../../components/DataTable';
import { time, copy } from '../../../filters/index.js';
export default {
  components: {
    DataTable
  },
  props: {
    // 目标项目信息，用于索引该项目的子任务
    project: Object,

    // 本弹窗是否显示
    isShow: Boolean
  },
  data() {
    return {
      tableTitle: [
        { label: '开始时间', prop: '_startTime', fixed: true, width: 150 },
        { label: '任务编号', prop: 'taskId', width: 200 },
        { label: '任务名', prop: 'content', width: 250 },
        { label: '负责人', prop: 'belonger.userName', width: 150 },
        { label: '状态', prop: '_state' },
        { label: '工时', prop: 'workingHours' }
      ],
      tableData: [],
      buttonList: [
        {
          text: '完成',
          event: 'accomplish-task',
          limit: 1
        },
        {
          text: '挂起',
          event: 'pend-task',
          limit: 1
        },
        {
          text: '运行',
          event: 'run-task',
          limit: 1
        },
        {
          text: '删除',
          event: 'delete-task',
          limit: 1
        }
      ],

      // 时间选择器相关配置
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

    // 获取子任务数据
    showDetail(project, index = {}) {
      const { projectName, projectId } = project;

      // 如果没有检索数据，直接退出
      if (!projectId || !projectName) {
        this.tableData = [];
        return -1;
      }
      this.$nextTick(_ => {
        this.loading = this.$loading(this.loadingOptions);
      });

      // 初始化索引条件
      let { pageIndex, pageSize, keyWords, startTime, endTime } = index;
      pageIndex = pageIndex || 0;
      pageSize = pageSize || this.pageSize;
      keyWords = keyWords || '';
      startTime = startTime || 0;
      const query = { projectId, projectName, pageIndex, pageSize, keyWords, startTime, endTime };

      // 发送请求获取项目的子任务
      this.$http.getRequest('/project/getTaskByProject', query)
        .then(res => {
          this.tableData = res.data;
          this.total = res.totalCount;
          this.pageIndex = pageIndex;
          const status = {
            0: '未启动',
            1: '进行中',
            2: '完成',
            3: '挂起'
          };

          // 格式化获取到的数据类型
          this.tableData.map(tableItem => {
            tableItem._startTime = this.time(tableItem.startTime, 'YYYY-MM-DD');
            tableItem._state = status[tableItem.state];
            tableItem.project = JSON.parse(tableItem.project);
            tableItem.belonger = JSON.parse(tableItem.belonger);
          });
        })
        .finally(() => {
          this.loading.close();
        });
    },

    // 更新页码并获取数据
    pageIndexChange(val) {
      this.pageIndex = val;
      const pageIndex = this.pageIndex;
      const pageSize = this.pageSize;
      const keyWords = this.keyWords;
      const startTime = this.startTime;
      const endTime = this.endTime;

      // 获取数据
      this.showDetail(
        this.project,
        { pageIndex, pageSize, keyWords, startTime, endTime }
      );
    },

    // 搜索内容变更并获取新数据
    searchContentChanged(searchContent) {
      this.keyWords = searchContent;
      this.pageIndex = 0;
      const pageIndex = this.pageIndex;
      const pageSize = this.pageSize;
      const keyWords = this.keyWords;
      const startTime = this.startTime;
      const endTime = this.endTime;

      // 获取数据
      this.showDetail(
        this.project,
        { pageIndex, pageSize, keyWords, startTime, endTime }
      );
    },

    // 将任务状态更新为“完成”
    accomplishTask(rows) {
      const taskList = this.copy(rows);
      this.changeTaskState(taskList, 2);
    },

    // 将任务状态更新为“挂起”
    pendTask(rows) {
      const taskList = this.copy(rows);
      this.changeTaskState(taskList, 3);
    },

    // 将任务状态更新为“运行中”
    runTask(rows) {
      const taskList = this.copy(rows);
      this.changeTaskState(taskList, 1);
    },

    // 发送请求更新任务状态
    changeTaskState(taskList, state) {
      this.$http.postRequest('/task/updateState', { list: taskList, data: [{ state }] })
        .then(res => {
          const pageIndex = this.pageIndex;
          const pageSize = this.pageSize;
          const keyWords = this.keyWords;
          const startTime = this.startTime;
          const endTime = this.endTime;
          if (res.retCode === 200) {
            this.$message({
              message: '修改成功！',
              type: 'success',
              duration: 1000
            });

            // 更新完成之后刷新页面数据
            this.showDetail(
              this.project,
              { pageIndex, pageSize, keyWords, startTime, endTime }
            );
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
          this.$http.postRequest('/task/deleteTask', { list: taskList })
            .then(res => {
              if (res.retCode === -1) {
                message = `删除失败,错误代码:${res.message}`;
                type = 'error';
              } else {
                message = '删除成功';
                type = 'success';

                // 删除数据成功后刷新数据列表
                this.showDetail(this.targetProject);
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

      const pageIndex = this.pageIndex;
      const pageSize = this.pageSize;
      const keyWords = this.keyWords;
      const startTime = this.startTime;
      const endTime = this.endTime;

      // 获取数据
      this.showDetail(
        this.project,
        { pageIndex, pageSize, keyWords, startTime, endTime }
      );
    },

    // 关闭弹窗
    closeDialog() {
      this.$emit('close-dialog');
      this.tableData = [];
      this.loading.close();
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

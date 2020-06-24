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
          @change="timePickerChanged"
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
      @submit-task="submitTask"
      @close-dialog="clearTaskInfo"
    >
    </edit-dialog>

    <export-dialog
      :isShow="isExportDialogShow"
      :openWith="openWith"
      @close-dialog="isExportDialogShow = false"
    >
    </export-dialog>
    <el-dialog
      title="任务是否完成"
      :visible.sync="dialogVisible"
      width="25%"
      >
      <el-form :model="completeForm" label-width="50px">
        <el-form-item label="工时">
          <el-input v-model="completeForm.workingHours"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleComfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import EditDialog from './components/EditDialog';
import ExportDialog from './components/ExportDialog';
import { time, debounce, copy } from '../../filters/index.js';
export default {
  components: {
    DataTable,
    EditDialog,
    ExportDialog
  },
  data() {
    return {
      title: '新增任务',
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
      isEditDialogShow: false,

      // 是否弹出导入/导出窗口
      isExportDialogShow: false,

      dialogVisible: false,

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
      },
      completeForm: {
        workingHours: 0,
        taskList: []
      }
    };
  },
  methods: {
    // 格式化时间戳
    time,

    debounce,

    copy,

    // 获取table数据
    getTableData(index = {}) {
      let { pageIndex, pageSize, startTime, endTime, keyWords } = index;
      pageIndex = pageIndex || 0;
      pageSize = pageSize || this.pageSize;
      startTime = startTime || 0;
      endTime = endTime || undefined;
      keyWords = keyWords || '';
      const props = { pageIndex, pageSize, startTime, endTime, keyWords };

      // 配置loading
      const loadingOptions = {
        target: '.app-main'
      };

      // 弹出loading窗口
      this.loading = this.$loading(loadingOptions);

      // 数据获取
      const url = '/task/getPaginTask';
      let message;
      let type;
      let isShowMessage;
      this.getData(url, props)
        .then(res => {
          // 响应代码异常
          if (res.retCode === -1) {
            message = '数据获取出错';
            type = 'error';
            isShowMessage = true;
            return -1;
          }

          // 对获取到的数据进行格式化
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
      this.title = '新增任务';
      this.isEditDialogShow = true;
    },

    // 提交新增任务表单
    submitTask(taskInfo) {
      // 获取由子组件发送过来的表单信息并格式化
      taskInfo = JSON.parse(taskInfo);
      delete taskInfo._state;
      delete taskInfo._startTime;

      // 通过taskInfo是否存在taskID来判断是进行新增操作还是更新操作
      let url;
      let message = '';
      let successMessage;
      let errorMessage;
      let type;
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
            message = `${errorMessage}，错误代码:${res.message}`;
            type = 'error';
          } else {
            message = successMessage;
            type = 'success';
          }

          // 增加数据成功后刷新数据列表
          this.getTableData();
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
          message: '一次只能编辑一条任务！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.dialogVisible = true;
      this.completeForm.workingHours = taskList[0].workingHours;
      this.completeForm.taskList = taskList;
    },

    //  完成任务确认触发事件
    handleComfirm() {
      let message;
      let type;
      // 发送请求
      this.$http.postRequest('/task/updateState', { list: this.completeForm.taskList, data: [{ state: 2 }, { workingHours: this.completeForm.workingHours }] })
        .then(res => {
          if (res.retCode === 200) {
            message = '修改成功！';
            type = 'success';

            // 更新完成之后刷新页面数据
            const pageIndex = this.pageIndex;
            const pageSize = this.pageSize;
            const startTime = this.startTime;
            const endTime = this.endTime;
            const keyWords = this.keyWords;
            const props = { pageIndex, pageSize, startTime, endTime, keyWords };
            this.getTableData(props);
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
                this.getTableData();
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
    timePickerChanged() {
      // 先判断timeInterval的格式是否正确
      this.timeInterval = Array.isArray(this.timeInterval) && this.timeInterval.length === 2
        ? this.timeInterval
        : [0, undefined];
      [this.startTime, this.endTime] = this.timeInterval;
      this.pageIndex = 0;

      // 获取数据
      const pageIndex = this.pageIndex;
      const pageSize = this.pageSize;
      const startTime = this.startTime;
      const endTime = this.endTime;
      const keyWords = this.keyWords;
      const props = { pageIndex, pageSize, startTime, endTime, keyWords };
      this.getTableData(props);
    },

    pageIndexChange(val) {
      this.pageIndex = val;

      // 获取数据
      const pageIndex = this.pageIndex;
      const pageSize = this.pageSize;
      const startTime = this.startTime;
      const endTime = this.endTime;
      const keyWords = this.keyWords;
      const props = { pageIndex, pageSize, startTime, endTime, keyWords };
      this.getTableData(props);
    },

    // 搜索索引
    searchContentChanged(searchContent) {
      this.keyWords = searchContent;
      this.pageIndex = 0;

      // 获取数据
      const pageIndex = this.pageIndex;
      const pageSize = this.pageSize;
      const startTime = this.startTime;
      const endTime = this.endTime;
      const keyWords = this.keyWords;
      const props = { pageIndex, pageSize, startTime, endTime, keyWords };
      this.getTableData(props);
    },

    // 关闭对话框时初始化任务数据
    clearTaskInfo() {
      this.isEditDialogShow = false;
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
    },

    openExportDialog(method) {
      this.openWith = method;
      this.isExportDialogShow = true;
    }
  },
  mounted() {
    this.initButtonList();
    const pageIndex = this.pageIndex;
    const pageSize = this.pageSize;
    const startTime = this.startTime;
    const endTime = this.endTime;
    const keyWords = this.keyWords;
    const props = { pageIndex, pageSize, startTime, endTime, keyWords };
    this.getTableData(props);
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
    this.$http.getRequest('/user/getTotalUser/options')
      .then(res => {
        this.userList = res.data;
      });

    // 获取项目列表数据
    this.$http.getRequest('/project/getTotalProject/options')
      .then(res => {
        this.projectList = res.data;
      });
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

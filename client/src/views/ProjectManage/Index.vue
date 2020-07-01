<template>
  <div>
    <data-table
      class="people-table"
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :isSelection="true"
      :isShowSearch="true"
      :pageIndex="pageIndex"
      :pageSize="pageSize"
      :total="total"
      @page-index-change="pageIndexChange"
      @search-content-changed="searchContentChanged"
      @dblclick="showDetailOfProject"
      @add-project="isShowEditDialog = true"
      @edit-project="editProject"
      @accomplish-project="accomplishProject"
      @pend-project="pendProject"
      @run-project="runProject"
      @delete-project="deleteProject"
    >

    </data-table>

    <project-detail
      :isShow="isShowDetail"
      :project="targetProject"
      @close-dialog="closeDialog('detailDialog')"
    >
    </project-detail>

    <edit-dialog
      :isShow="isShowEditDialog"
      :projectInfo="projectInfo"
      :userList="userList"
      @close-dialog="closeDialog('editDialog')"
      @submit-project="submitProject"
    >
    </edit-dialog>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import ProjectDetail from './components/ProjectDetail';
import EditDialog from './components/EditDialog';
import { time, debounce, copy } from '../../utils/api.js';
import { STATUS, STATUS_CH, REQUEST_URL } from '../../common/config.js';
export default {
  components: {
    DataTable,
    ProjectDetail,
    EditDialog
  },
  data() {
    return {
      // table主体数据
      tableData: [],

      // 数据获取相关参数
      pageIndex: 0,
      pageSize: 10,
      total: 0,
      loading: '',

      // 展示项目细节弹窗
      isShowDetail: false,
      projectDetail: [],

      // 新增/编辑项目弹窗
      isShowEditDialog: false,
      projectInfo: {},

      // 用于展示项目的子任务
      targetProject: {},

      userList: []
    };
  },
  methods: {
    // 格式化时间戳
    time,

    // 防抖处理
    debounce,

    // 深拷贝
    copy,

    // 获取项目信息
    getProjectData(method = 1) {
      if (method === 0) {
        this.pageIndex = 0;
        this.keyWords = '';
      }

      // 索引条件获取
      const { pageIndex, pageSize, keyWords } = this;

      // 配置loading
      const loadingOptions = {
        target: '.app-main'
      };

      // 弹出loading窗口
      this.loading = this.$loading(loadingOptions);

      // 数据获取
      const url = REQUEST_URL.PROJECT_GETPAGINPROJECT;
      this.getData(url, { pageIndex, pageSize, keyWords })
        .then(res => {
          // 获取响应代码为-1，则代表获取数据失败
          if (res.retCode === -1) {
            this.$message({
              message: '数据获取出错',
              type: 'error',
              duration: 1000
            });
            this.loading.close();
            return -1;
          }

          // 当数据获取成功，需要先格式化数据
          const tableData = res.data;
          tableData.map(tableItem => {
            tableItem._createTime = this.time(tableItem.createTime, 'YYYY-MM-DD');
            tableItem._state = STATUS_CH[tableItem.state];
          });
          this.tableData = tableData;
          this.total = res.totalCount;
          this.pageIndex = pageIndex;
        })
        .finally(() => {
          // 关闭loading界面
          this.loading.close();
        });
    },

    // 更新页码并获取数据
    pageIndexChange(val) {
      this.pageIndex = val;

      // 获取数据
      this.getProjectData();
    },

    // 搜索索引
    searchContentChanged(searchContent) {
      this.keyWords = searchContent;
      this.pageIndex = 0;

      // 获取数据
      this.getProjectData();
    },

    // 当某一行被双击之后，展示该项目的子任务
    showDetailOfProject(project) {
      this.isShowDetail = true;
      this.targetProject = project;
    },

    // 关闭弹窗
    closeDialog(dialog) {
      // 关闭项目子任务弹窗
      if (dialog === 'detailDialog') {
        this.isShowDetail = false;
        this.targetProject = {};
      } else if (dialog === 'editDialog') {
        // 关闭编辑项目弹窗
        this.isShowEditDialog = false;
        this.initProjectInfo();
      }
    },

    // 项目编辑
    editProject(rows) {
      if (rows.length > 1) {
        this.$message({
          message: '一次只能编辑一条项目！',
          type: 'warning',
          duration: 1000
        });
        return -1;
      }
      this.isShowEditDialog = true;
      this.projectInfo = this.copy(rows[0]);
    },

    // 新增项目
    submitProject(projectInfo) {
      // 获取由子组件表单传过来的数据并格式化为JSON
      projectInfo = JSON.parse(projectInfo);

      // 删除不必要的字段
      delete projectInfo._createTime;
      delete projectInfo._state;

      // 由是否存在projectId来判断该项目是否属于新增项目
      let url;
      let message;
      let successMessage, errMessage;
      let type;
      if (projectInfo && projectInfo.projectId !== undefined) {
        url = REQUEST_URL.PROJECT_UPDATEPROJECT;
        successMessage = '修改项目成功';
        errMessage = '修改项目失败';
      } else {
        url = REQUEST_URL.PROJECT_ADDPROJECT;
        successMessage = '增加项目成功';
        errMessage = '增加项目失败';
      }

      // 提交数据到服务器
      this.$http.postRequest(url, { project: projectInfo })
        .then(res => {
          // 增加/修改任务失败
          if (res.retCode === -1) {
            message = `${errMessage}，错误代码:${res.message}`;
            type = 'error';
          } else {
            message = successMessage;
            type = 'success';
          }

          // 增加数据成功后刷新数据列表
          this.getProjectData();
        })
        .catch(err => {
          message = `操作失败，错误代码:${err}`;
          type = 'error';
        })
        .finally(() => {
          this.$message({
            message,
            type,
            duration: 1500
          });
        });
    },

    // 项目删除
    deleteProject(rows) {
      this.$confirm(
        `确定删除这${rows.length}个项目吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          const projectList = this.copy(rows);
          // 删除列表中不必要字段
          projectList.map(projectItem => {
            delete projectItem._state;
            delete projectItem._createTime;
          });
          let message;
          let type;
          const url = REQUEST_URL.PROJECT_DELETEPROJECT;
          // 发送删除请求
          this.$http.postRequest(url, { list: projectList })
            .then(res => {
              if (res.retCode === -1) {
                message = `删除失败,错误代码:${res.message}`;
                type = 'error';
              } else {
                message = '删除成功';
                type = 'success';

                // 删除数据成功后刷新数据列表
                this.getProjectData(0);
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

    // 将项目的状态修改为“完成”
    accomplishProject(rows) {
      this.changeProjectState(rows, STATUS.ACCOMPLISH);
    },

    // 将项目的状态修改为“挂起”
    pendProject(rows) {
      this.changeProjectState(rows, STATUS.PEND);
    },

    // 将项目的状态修改为“运行中”
    runProject(rows) {
      this.changeProjectState(rows, STATUS.RUNNING);
    },

    // 发送请求进行项目状态修改
    changeProjectState(projectList, state) {
      let message;
      let type;
      const url = REQUEST_URL.PROJECT_UPDATESTATE;
      this.$http.postRequest(url, { list: projectList, data: [{ state }] })
        .then(res => {
          if (res.retCode === 200) {
            message = '修改成功!';
            type = 'success';

            // 更新完成之后刷新页面数据
            this.getProjectData();
          } else {
            message = `修改失败!错误原因:${res.message}`;
            type = 'error';
          }
        })
        .catch(err => {
          message = `操作失败，错误原因:${err}`;
          type = 'error';
        })
        .finally(() => {
          this.$message({
            message,
            type,
            duration: 1500
          });
        });
    },

    // 初始化项目信息
    initProjectInfo() {
      this.projectInfo = {
        projectName: '',
        state: STATUS.RUNNING,
        remarks: '',
        belongerId: '',
        belongerName: ''
      };
    }
  },
  computed: {
    tableTitle() {
      return [
        { label: '项目名', prop: 'projectName', width: 300 },
        { label: '项目编号', prop: 'projectId', width: 100 },
        { label: '开始时间', prop: '_createTime', width: 180 },
        { label: '负责人', prop: 'belongerName', width: 150 },
        { label: '状态', prop: '_state', width: 200 },
        { label: '备注', prop: 'remarks', width: 300 }
      ];
    },
    buttonList() {
      return [
        // 新增项目
        {
          text: '新增',
          event: 'add-project',
          limit: 0
        },

        // 项目编辑按钮
        {
          // type: 'primary',
          text: '编辑',
          event: 'edit-project',
          limit: 1
          // icon: 'el-icon-edit'
        },

        // 项目删除按钮
        {
          text: '删除',
          event: 'delete-project',
          limit: 1
          // icon: 'el-icon-delete'
        },

        // 项目完成按钮
        {
          text: '完成',
          event: 'accomplish-project',
          limit: 1
          // icon: 'el-icon-delete'
        },

        // 项目挂起按钮
        {
          text: '挂起',
          event: 'pend-project',
          limit: 1
          // icon: 'el-icon-delete'
        },

        // 项目运行按钮
        {
          text: '运行',
          event: 'run-project',
          limit: 1
          // icon: 'el-icon-delete'
        }
      ];
    }
  },
  created() {
    // 对获取数据过程进行防抖处理
    this.getData = this.debounce(
      // 需要进行防抖的函数
      (url, data) => {
        return this.$http.getRequest(url, data);
      },
      // 间隔时间
      500,
      // 立即执行
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

    this.initProjectInfo();
  },
  mounted() {
    // 获取第一页项目信息
    this.getProjectData();
  },
  beforeDestroy() {
    this.loading.close();
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
        th:nth-child(1) {
          flex: none;
          width: 50px;
        }
        th:nth-child(2) {
          flex: none;
          width: 250px;
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
        td:nth-child(1) {
          flex: none;
          width: 50px;
        }
        td:nth-child(2) {
          flex: none;
          width: 250px;
        }
      }
    }
  }
}
</style>

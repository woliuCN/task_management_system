<template>
  <div>
    <data-table
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
    >

    </data-table>

    <project-detail
      :isShow="isShowDetail"
      :tableData="projectDetail"
      @close-dialog="closeDialog('detailDialog')"
    >
    </project-detail>

    <edit-dialog
      :isShow="isShowEditDialog"
      :projectInfo="projectInfo"
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
import { time, debounce, copy } from '../../filters/index.js';
export default {
  components: {
    DataTable,
    ProjectDetail,
    EditDialog
  },
  data() {
    return {
      // 传给DataTable的按钮列表
      buttonList: [],

      // table抬头数据
      tableTitle: [
        { label: '项目名', prop: 'projectName', width: 300, fixed: true },
        { label: '项目编号', prop: 'projectId', width: 150 },
        { label: '开始时间', prop: '_createTime', width: 200 },
        { label: '状态', prop: '_state', width: 200 },
        { label: '备注', prop: 'remarks', width: 300 }
      ],

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
      projectInfo: {
        projectName: '',
        state: 0,
        remarks: ''
      }
    };
  },
  methods: {
    time,
    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
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
    },

    // 获取列表信息
    getProjectData(
      pageIndex = 0,
      pageSize = 10,
      keyWords = ''
    ) {
      // 配置loading
      const loadingOptions = {
        target: '.app-main'
      };

      // 弹出loading窗口
      this.loading = this.$loading(loadingOptions);
      // 数据获取
      const url = '/project/getPaginProject';
      this.getData(url, { pageIndex, pageSize, keyWords })
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
            0: '运行',
            1: '挂起',
            2: '完成'
          };
          const tableData = res.data;
          tableData.map(tableItem => {
            tableItem._createTime = this.time(tableItem.createTime, 'YYYY-MM-DD');
            tableItem._state = status[tableItem.state];
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

    // 更新页码并获取数据
    pageIndexChange(val) {
      this.pageIndex = val;

      // 获取数据
      this.getProjectData(
        this.pageIndex,
        this.pageSize,
        this.keyWords);
    },

    // 搜索索引
    searchContentChanged(searchContent) {
      this.keyWords = searchContent;
      this.pageIndex = 0;
      this.getProjectData(
        this.pageIndex,
        this.pageSize,
        this.keyWords);
    },

    // 当某一行被双击之后，展示该项目的子任务
    showDetailOfProject(project) {
      this.isShowDetail = true;
      const loadingOptions = {
        target: '.el-dialog_body'
      };
      // 弹出loading窗口
      this.loading = this.$loading(loadingOptions);
      const { projectName, projectId } = project;
      this.$http.getRequest('/project/getTaskByProject', { projectId, projectName })
        .then(res => {
          this.projectDetail = res.data;
          const status = {
            0: '未启动',
            1: '进行中',
            2: '完成',
            3: '挂起'
          };
          this.projectDetail.map(tableItem => {
            tableItem._startTime = this.time(tableItem.startTime, 'YYYY-MM-DD');
            tableItem._state = status[tableItem.state];
            tableItem.project = JSON.parse(tableItem.project);
            tableItem.belonger = JSON.parse(tableItem.belonger);
          });
          this.loading.close();
        })
        .catch(_ => {
          this.loading.close();
        })
    },

    closeDialog(dialog) {
      if (dialog === 'detailDialog') {
        this.isShowDetail = false;
        this.projectDetail = [];
      } else if (dialog === 'editDialog') {
        this.isShowEditDialog = false;
        this.projectInfo = {
          projectName: '',
          state: 0,
          remarks: ''
        };
      }
    },

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
      this.projectInfo = copy(rows[0]);
    },

    submitProject(projectInfo) {
      projectInfo = JSON.parse(projectInfo);
      delete projectInfo._createTime;
      delete projectInfo._state;
      let url;
      let successMessage, errMessage;
      if (projectInfo && projectInfo.projectId !== undefined) {
        url = '/project/updateProject';
        successMessage = '修改项目成功';
        errMessage = '修改项目失败';
      } else {
        url = '/project/addProject';
        successMessage = '增加项目成功';
        errMessage = '增加项目失败';
      }

      // 提交数据到服务器
      this.$http.postRequest(url, { project: projectInfo })
        .then(res => {
          // 增加/修改任务失败
          if (res.retCode === -1) {
            this.$message({
              message: `${errMessage}，错误代码:${res.message}`,
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
          this.getProjectData();
        }).catch(err => {
          this.$message({
            message: `操作失败，错误代码:${err}`,
            type: 'error',
            duration: 1500
          });
        });
    },

    accomplishProject(rows) {
      this.changeProjectState(rows, 2);
    },

    pendProject(rows) {
      this.changeProjectState(rows, 1);
    },

    runProject(rows) {
      this.changeProjectState(rows, 0);
    },

    changeProjectState(projectList, state) {
      this.$http.postRequest('/project/updateState', { list: projectList, data: [{ state }] })
        .then(res => {
          if (res.retCode === 200) {
            this.$message({
              message: '修改成功！',
              type: 'success',
              duration: 1000
            })

            // 更新完成之后刷新页面数据
            this.getProjectData(this.pageIndex, this.pageSize, this.keyWords);
          } else {
            this.$message({
              message: `修改失败!错误原因:${res.message}`,
              type: 'error',
              duration: 1000
            })
          }
        })
    }
  },
  mounted() {
    this.initButtonList();
    this.getProjectData();
  },
  created() {
    // 对获取数据过程进行防抖处理
    this.getData = debounce(
      (url, data) => {
        return this.$http.getRequest(url, data);
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
  },
  beforeDestroy() {
    this.loading.close();
  }
};
</script>
<style lang="scss" scoped>

</style>

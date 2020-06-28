<template>
  <div class="logs">
    <!-- <el-table
      :data="tableData"
      style="width: 100%"
      @row-click="showLogs"
      v-popover:tip
      border
    >
      <el-table-column
        prop="name"
        label="用户"
        width="180"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="timestemp"
        label="最后一次操作时间"
        align="center">
      </el-table-column>
        <el-table-column
          prop="log"
          label="操作内容"
          align="center"
        >
        </el-table-column>
    </el-table> -->

    <!-- 提示框 -->
    <!-- <el-popover
      ref="tip"
      placement="top"
      width="100"
      trigger="hover"
      content="点击查看日志详情">
    </el-popover> -->
    <!-- <el-button v-popover:tip>okk</el-button> -->
    <!-- 日志详情 -->
    <!-- <el-dialog :visible.sync="isShowLogs">
      <el-date-picker
        v-model="value1"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="selectLogs"
      >
      </el-date-picker>
      <el-timeline class="time-line">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp">
          {{activity.content}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog> -->
    <data-table
      class="people-table"
      ref="data-table"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :pageIndex="pageIndex"
      :pageSize="pageSize"
      :total="total"
      :isShowSearch="true"
      v-loading="isLoading"
      @search-content-changed="searchContent"
      @page-index-change="pageIndexChange"
    >
    </data-table>
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
import { time } from '../filters/index.js';
// import { Loading } from 'element-ui';
export default {
  name: 'AbnormalLog',
  components: { DataTable },
  data() {
    return {
      // table抬头
      tableTitle: [
        // { label: '日志Id', prop: 'logId' },
        { label: '创建时间', prop: 'createTime' },
        { label: '日志内容', prop: 'content' },
        { label: '操作者', prop: 'operator' },
        { label: '被操作者', prop: 'sufferer' }
      ],

      // table主体数据
      tableData: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      sourceData: [],
      isLoading: false,
      keyWords: ''
    };
  },
  created() {
    this.getLogsInfo();
  },
  mounted() {},
  methods: {
    pageIndexChange(val) {
      this.pageIndex = val;
      console.log(val);

      // 获取数据
      this.getLogsInfo({ pageSize: this.pageSize, pageIndex: this.pageIndex, keyWords: this.keyWords });
    },
    searchContent(value) {
      this.keyWords = value;
      if (value === '') {
        this.pageSize = 10;
        this.pageIndex = 1;
        this.getLogsInfo({ pageSize: this.pageSize, pageIndex: this.pageIndex });
        return;
      }
      this.getLogsInfo({ pageSize: this.pageSize, pageIndex: this.pageIndex, keyWords: value });
    },
    async getLogsInfo(params = {}) {
      this.isLoading = true;
      const res = await this.$http.getRequest('/log/getLogList', params);
      this.total = res.totalCount;
      const { data, retCode } = res;
      if (retCode === 200) {
        this.tableData = data.map((item) => {
          item.createTime = time(item.createTime, 'YYYY-MM-DD');
          if (item.sufferer === '') {
            item.sufferer = '-';
          }
          return item;
        });
      } else {
        this.$message({
          message: '获取日志列表失败',
          type: 'error',
          duration: 1000
        });
      }
      this.isLoading = false;
    }
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
        th:nth-child(1),th:nth-child(3),th:nth-child(4) {
          flex: 1;
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
        td:nth-child(1),td:nth-child(3),td:nth-child(4) {
          flex: 1;
        }
      }
    }
  }
}
</style>

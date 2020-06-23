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
      @search-content-changed="searchContent"
      @page-index-change="pageIndexChange"
    >
    </data-table>
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
// import { time, debounce, copy } from '../filters/index.js';
// import { Loading } from 'element-ui';
export default {
  name: 'AbnormalLog',
  components: { DataTable },
  data() {
    return {
      // table抬头
      tableTitle: [
        { label: '日志Id', prop: 'logId' },
        { label: '日志内容', prop: 'content' },
        { label: '创建时间', prop: 'createTime' },
        { label: '操作者', prop: 'userName' },
        { label: '被操作者', prop: 'state' }
      ],

      // table主体数据
      tableData: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      sourceData: []
    };
  },
  created() {},
  mounted() {},
  methods: {
    pageIndexChange(val) {
      this.pageIndex = val;
      console.log(val);

      // 获取数据
      this.getTableData(
        this.pageIndex,
        this.pageSize,
        this.keyWords);
    },
    searchContent(value) {
      console.log(value)
      if (value === '') {
        this.tableData = this.sourceData;
        return;
      }
      this.tableData = this.sourceData.filter && this.sourceData.filter((item) => {
        return item.content.includes(value);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  align-items: center;
  max-height: 670px;
  overflow: hidden;
  overflow-y: auto;
  ul {
    padding: 0;
  }
}
.time-line {
  margin-top: 30px;
}
</style>

<template>
  <div class="logs">
    <el-table
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
    </el-table>

    <!-- 提示框 -->
    <el-popover
      ref="tip"
      placement="top"
      width="100"
      trigger="hover"
      content="点击查看日志详情">
    </el-popover>
    <!-- <el-button v-popover:tip>okk</el-button> -->
    <!-- 日志详情 -->
    <el-dialog :visible.sync="isShowLogs">
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
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'AbnormalLog',
  data() {
    return {
      tableData: [{
        name: 'admin',
        timestemp: '2020-05-24 12:22:22',
        log: '查看任务'
      }],
      isShowLogs: false,
      activities: [{
        content: '活动按期开始',
        timestamp: '2018-04-15'
      }, {
        content: '通过审核',
        timestamp: '2018-04-13'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }],
      value1: ''
    };
  },
  created() {},
  mounted() {},
  methods: {
    showLogs(row) {
      console.log(row.name);
      this.isShowLogs = true;
    },
    selectLogs(value) {
      console.log(value);
      this.activities = [{
        content: '活动按期结束',
        timestamp: '2018-04-15'
      }, {
        content: '通过审核',
        timestamp: '2018-04-13'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }];
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

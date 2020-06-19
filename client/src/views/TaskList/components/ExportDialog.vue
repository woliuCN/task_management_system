<template>
  <div>
    <el-dialog
      title="导出/导出文件"
      width="30%"
      :visible.sync="isDialogShow"
      @close="$emit('close-dialog')"
    >
      <div v-if="openWith === 'import'" class="center">
        <el-button class="button-item" @click="downloadFile">下载导入模板</el-button>
        <el-button class="button-item" @click="uploadFile">导入文件</el-button>
      </div>
      <div v-else-if="openWith === 'export'" class="center">
        <el-date-picker
          v-model="timeInterval"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          class="date-picker"
          :picker-options="timePickerOptions"
          :editable="false"
          :clearable="true"
          @change="timePickerChanged"
        >
        </el-date-picker>
        <el-button class="button-item" @click="uploadFile">导出任务列表</el-button>
        <el-button class="button-item" @click="personalPerformance">导出个人绩效</el-button>
        <el-button class="button-item" @click="monthPerformance">导出月绩效</el-button>
      </div>
      <div v-else class="center">
        <el-date-picker
          v-model="timeInterval"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          class="date-picker"
          :picker-options="timePickerOptions"
          :editable="false"
          :clearable="true"
          @change="timePickerChanged"
        >
        </el-date-picker>
        <el-button class="button-item" @click="weekreport">生成周报</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    isShow: Boolean,
    openWith: String
  },
  data() {
    return {
      isDialogShow: false,
      timeInterval: [],
      timePickerOptions: {
        firstDayOfWeek: 1,
        shortcuts: [
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
          },
          {
            text: '上月',
            onClick(picker) {
              const start = new Date();
              const lastMonth = start.getMonth() === 0 ? 11 : start.getMonth() - 1;
              start.setMonth(lastMonth);

              // 获取本月1号的时间戳
              start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDate() - 1));

              const end = new Date(start);

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
      }
    };
  },
  methods: {
    uploadFile() {
      //
    },
    downloadFile() {
      //
    },
    weekreport() {
      const url = 'http://192.168.31.84:30/api/task/weeklyDownload';
      window.open(`${url}?startTime=${this.startTime}&endTime=${this.endTime}`);
      // this.$http.getRequest(`${url}?startTime=${this.startTime}&endTime=${this.endTime}`).then(res => {
      //   console.log(res);
      // })
    },
    timePickerChanged() {
      this.timeInterval = Array.isArray(this.timeInterval) && this.timeInterval.length === 2
        ? this.timeInterval
        : [0, undefined];
      [this.startTime, this.endTime] = this.timeInterval;
      this.pageIndex = 0;
    },
    personalPerformance() {
      const url = 'http://192.168.31.84:30/api/task/personalPerformanceDownload';
      window.open(`${url}?startTime=${this.startTime}&endTime=${this.endTime}`);
    },
    monthPerformance() {
      const url = 'http://192.168.31.84:30/api/task/monthPerformanceDownload';
      window.open(`${url}?startTime=${this.startTime}&endTime=${this.endTime}`);
    }
  },
  created() {
    const end = new Date();
    const start = new Date();
    // 通过今天的时间减去本周已过天数，得出本周周一的日期
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() - 1));

    // 今天的时间加上6天可得到本周最后一天的日期
    end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    this.startTime = start.getTime();
    this.endTime = end.getTime();
    this.timeInterval = [this.startTime, this.endTime];
  },
  watch: {
    isShow(val) {
      this.isDialogShow = val;
    }
  }
};
</script>

<style lang="scss" scoped>
  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .button-item {
      margin: 10px;
    }
  }
</style>

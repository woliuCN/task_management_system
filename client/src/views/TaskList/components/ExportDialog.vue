<template>
  <div>
    <el-dialog
      title="导入/导出文件"
      width="30%"
      :visible.sync="isDialogShow"
      @close="$emit('close-dialog')"
    >
      <div v-if="openWith === 'import'" class="upload">
        <el-upload
          :action="uploadUrl"
          :multiple="false"
          :on-success="handleSuccess"
          :on-error="handleError"
          :file-list="fileList"
          with-credentials
          >
          <el-button size="small" type="primary">点击上传</el-button>
          <el-button  size="small" type="success" @click="downloadTemplate">下载模板</el-button>
          <div slot="tip" class="el-upload__tip">只能上传xlsx文件</div>
        </el-upload>
      </div>
      <div v-else-if="openWith === 'export'">
        <div class="export-info-item">
          <span>选择时间：</span>
          <el-date-picker
            v-model="timeInterval"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
            class="date-picker width-100"
            style="margin: 0"
            :picker-options="timePickerOptions"
            :editable="false"
            :clearable="false"
            @change="timePickerChanged"
          >
          </el-date-picker>
        </div>
        <div class="export-info-item">
          <span>选择部门：</span>
          <el-select
            v-model="seletedDept"
            class="width-100"
            placeholder="选择部门"
            filterable
          >
            <el-option
              v-for="dept in deptList"
              :key="dept.deptId"
              :label="dept.deptName"
              :value="dept.deptId"
            >
            </el-option>
          </el-select>
        </div>
        <div class="center">
          <el-button class="button-item" @click="personalPerformance">导出个人绩效</el-button>
          <el-button class="button-item" @click="monthPerformance">导出月绩效</el-button>
        </div>
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
          :clearable="false"
          @change="timePickerChanged"
        >
        </el-date-picker>
        <el-button class="button-item" @click="weekreport">生成周报</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { initTimePicker } from '../../../utils/timePickerConfig';
import { REQUEST_URL } from '../../../common/config.js';
export default {
  props: {
    isShow: Boolean,
    openWith: String,
    projectList: {
      type: Array,
      default() {
        return [];
      }
    },
    userList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      isDialogShow: false,
      timeInterval: [],
      fileList: [],
      uploadUrl: '',

      // 部门列表
      deptList: [],
      seletedDept: 0
    };
  },
  methods: {
    dealDisabledDate(time) {
      // 一天的毫秒数 = 8.64e7  判断时在return处可进行加减
      const curDate = (new Date()).getTime();
      const day = 30 * 24 * 3600 * 1000;
      const dateRegion = curDate - day;
      return time.getTime() > Date.now() || time.getTime() < dateRegion;
    },
    // 下载导入模板
    downloadTemplate() {
      const url = this.$http.adornUrl(REQUEST_URL.TASK_TEMPLATEDOWNLOAD);
      window.open(url);
    },

    // 导入成功回调
    handleSuccess(res) {
      if (res.retCode === -1) {
        this.handleError();
      } else {
        this.$message({
          message: '导入成功',
          type: 'success',
          duration: 1000
        });
      }
    },

    // 导入失败回调
    handleError() {
      this.fileList = [];
      this.$message({
        message: '导入失败',
        type: 'error',
        duration: 1000
      });
    },

    uploadFile() {
      //
    },
    // 生成周报
    weekreport() {
      const url = this.$http.adornUrl(
        REQUEST_URL.TASK_WEEKLYDOWNLOAD,
        { startTime: this.startTime, endTime: this.endTime }
      );
      window.open(url);
    },

    timePickerChanged() {
      this.timeInterval = Array.isArray(this.timeInterval) && this.timeInterval.length === 2
        ? this.timeInterval
        : [0, undefined];
      [this.startTime, this.endTime] = this.timeInterval;
      this.pageIndex = 0;
    },

    // 生成个人绩效
    personalPerformance() {
      const url = this.$http.adornUrl(
        REQUEST_URL.TASK_PERSONALPERFORMANCEDOWNLOAD,
        { startTime: this.startTime, endTime: this.endTime, dept: this.seletedDept }
      );
      window.open(url);
    },

    // 生成月绩效
    monthPerformance() {
      const url = this.$http.adornUrl(
        REQUEST_URL.TASK_TEMPLATEDOWNLOAD,
        { startTime: this.startTime, endTime: this.endTime, dept: this.seletedDept }
      );
      window.open(url);
    }
  },
  computed: {
    timePickerOptions() {
      return initTimePicker(
        ['today', 'week', 'lastWeek', 'month', 'lastMonth'],
        { firstDayOfWeek: 1 }
      );
    }
  },
  created() {
    const end = new Date();
    const start = new Date();

    // 通过今天的时间减去本周已过天数，得出本周周一的日期
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() + 6));

    // 今天的时间加上6天可得到本周最后一天的日期
    end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    this.startTime = start.getTime();
    this.endTime = end.getTime();
    this.timeInterval = [this.startTime, this.endTime];

    this.uploadUrl = this.$http.adornUrl('/task/uploadFile');

    // 获取部门列表
    const url = REQUEST_URL.DEPARTMENT_GETDEPARTMENTLIST;
    this.$http.getRequest(url)
      .then(res => {
        this.deptList = res.data;
        this.seletedDept = this.deptList[0].deptId;
      })
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
  .upload{
    display: flex;
    align-items: flex-start;
  }

  .export-info-item {
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    span {
      margin-bottom: 10px;
    }
  }

  .width-100 {
    width: 100%;
  }
</style>

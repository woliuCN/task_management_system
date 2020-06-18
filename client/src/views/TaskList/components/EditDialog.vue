<template>
  <div>
    <el-dialog
      title="新增任务"
      top="5vh"
      :visible.sync="isShow"
      :close-on-click-modal=false
      :show-close=false
      @open="initTaskInfo"
    >
      <!-- 新增任务表单 -->
      <el-form
        :model="taskInfo"
        ref="taskInfo"
        :hide-required-asterisk=true
      >
        <el-form-item
          label="任务内容"
          prop="content"
          :label-width="formLabelWidth"
          :rules="[ { required: true, message: '内容不能为空'} ]"
        >
          <el-input
            v-model="taskInfo.content"
            autocomplete="off"
            class="width-90"
          >
          </el-input>
        </el-form-item>

        <el-form-item
          label="选择项目"
          prop="project"
          :label-width="formLabelWidth"
          :rules="[ { required: true, message: '项目信息不能为空'} ]"
        >
          <el-select
            v-model="taskInfo.project.projectId"
            filterable
            placeholder="请选择任务所属项目"
            class="width-90"
            @change="formatProject"
          >
            <el-option
              v-for="projectItem in projectList"
              :key="projectItem.projectId"
              :label="projectItem.projectName"
              :value="projectItem.projectId"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          label="选择负责人"
          prop="belonger"
          :label-width="formLabelWidth"
          :rules="[ { required: true, message: '负责人信息不能为空'} ]"
        >
          <el-select
            v-model="taskInfo.belonger.userId"
            filterable
            placeholder="请选择任务负责人"
            class="width-90"
            @change="formatBelonger"
          >
            <el-option
              v-for="user in userList"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="计划时间" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
              v-model="timeInterval"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="width-90"
              value-format="timestamp"
              :default-value="new Date()"
              :picker-options="pickerOptions"
              @change="timePickerChanged"
            >
            </el-date-picker>
          </div>
        </el-form-item>

        <el-form-item label="任务状态" :label-width="formLabelWidth">
          <el-radio-group v-model="taskInfo.state">
            <el-radio :label="0">未启动</el-radio>
            <el-radio :label="1">运行中</el-radio>
            <el-radio :label="2">完成</el-radio>
            <el-radio :label="3">挂起</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="任务性质" :label-width="formLabelWidth">
          <el-radio-group v-model="taskInfo.taskType">
            <el-radio :label="0">新增</el-radio>
            <el-radio :label="1">计划</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="工时"
          :label-width="formLabelWidth"
          prop="workingHours"
          :rules="[ { required: true, message: '工时不能为空'} ]"
        >
          <el-input
            v-model="taskInfo.workingHours"
            autocomplete="off"
            class="width-25"
          >
          </el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitTask">增 加</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    // 控制本弹窗是否显示
    isShow: Boolean,

    // 项目列表
    projectList: {
      type: Array,
      default() {
        return [];
      }
    },

    // 用户列表
    userList: {
      type: Array,
      default() {
        return [];
      }
    },

    // 表单内容
    taskInfo: Object
  },
  data() {
    return {
      // 格式化表单宽度
      formLabelWidth: '120px',

      // 任务开始/结束时间戳
      timeInterval: [],

      // timepicker配置
      pickerOptions: {
        firstDayOfWeek: 1,
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
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
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      }
    };
  },
  methods: {
    // 将时间选择器内的时间戳存至表单内
    timePickerChanged(timeInterval) {
      timeInterval = Array.isArray(timeInterval) && timeInterval.length === 2
        ? timeInterval
        : [new Date().getTime(), new Date().getTime()];
      [this.taskInfo.startTime, this.taskInfo.endTime] = timeInterval;
    },

    // 将表单内容发送给父组件
    submitTask() {
      this.$refs.taskInfo.validate(valid => {
        if (valid) {
          this.$emit('submit-task', JSON.stringify(this.taskInfo));
          this.$emit('close-dialog');
        }
      });
    },

    // 关闭本弹窗
    closeDialog() {
      this.$refs.taskInfo.resetFields();
      this.$emit('close-dialog');
    },

    // 初始化对话框数据
    initTaskInfo() {
      this.taskInfo.startTime = new Date(this.taskInfo.startTime).getTime();
      this.taskInfo.endTime = new Date(this.taskInfo.endTime).getTime();

      this.timeInterval = [this.taskInfo.startTime, this.taskInfo.endTime];
    },

    // 当选择任务负责人的时候，需要找到对应id的名字，并赋值到belonger
    formatBelonger(userId) {
      this.userList.find((user) => {
        if (user.userId === userId) {
          this.taskInfo.belonger.userName = user.userName;
        }
      });
    },

    // 当选择任务所属项目时，需要找到对应id的项目名并赋值到project
    formatProject(projectId) {
      this.projectList.find((project) => {
        if (project.projectId === projectId) {
          this.taskInfo.project.projectName = project.projectName;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
  /deep/.width-90 {
    width: 90%!important;
  }

  /deep/.width-25 {
    width: 25%!important;
  }
</style>
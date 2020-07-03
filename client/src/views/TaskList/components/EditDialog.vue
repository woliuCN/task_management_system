<template>
  <div>
    <el-dialog
      :title="title"
      top="5vh"
      :visible.sync="isShow"
      :close-on-click-modal=false
      :show-close=false
      @open="initTaskInfo"
      @closed="onDialogClosed"
    >
      <!-- 新增任务表单 -->
      <el-form
        ref="taskInfo"
        :model="taskInfo"
        :hide-required-asterisk=true
        :rules="taskInfoRules"
      >
        <el-form-item
          label="任务内容"
          prop="content"
          :label-width="formLabelWidth"
        >
          <el-input
            v-model="taskInfo.content"
            autocomplete="off"
            class="width-90"
            placeholder="请填写任务内容"
          >
          </el-input>
        </el-form-item>

        <el-form-item
          label="选择项目"
          prop="project"
          :label-width="formLabelWidth"
        >
          <el-select
            v-model="taskInfo.projectId"
            filterable
            placeholder="请选择任务所属项目"
            class="width-90"
            ref="project"
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
        >
          <el-select
            v-model="taskInfo.belongerId"
            filterable
            placeholder="请选择任务负责人"
            class="width-90"
            ref="belonger"
            :disabled="isEdit"
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

        <el-form-item
          label="计划时间"
          prop="timeInterval"
          :label-width="formLabelWidth"
        >
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
              ref="timeInterval"
              :default-value="new Date()"
              :editable="false"
              :picker-options="timePickerOptions"
              @change="timePickerChanged"
            >
            </el-date-picker>
          </div>
        </el-form-item>

        <el-form-item
          v-if="isEdit === false"
          label="任务状态"
          :label-width="formLabelWidth"
        >
          <el-radio-group v-model="taskInfo.state">
            <el-radio :label="0">运行中</el-radio>
            <el-radio :label="1">完成</el-radio>
            <el-radio :label="2">挂起</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="isEdit === false"
          label="任务性质"
          :label-width="formLabelWidth"
        >
          <el-radio-group v-model="taskInfo.taskType">
            <el-radio :label="0">计划</el-radio>
            <el-radio :label="1">新增</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitTask">确 认</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import { initTimePicker } from '../../../utils/timePickerConfig.js';
export default {
  props: {
    // 控制本弹窗是否显示
    isShow: Boolean,
    title: String,
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

    isEdit: {
      type: Boolean,
      default() {
        return false;
      }
    },

    // 表单内容
    taskInfo: Object
  },
  data() {
    const that = this;
    const validateString = function(rule, value, callback) {
      value = value ? value.toString().trim() : '';
      if (!value) {
        return callback(new Error('内容不能为空'));
      }
      callback();
    };
    const validateProject = function(rule, value, callback) {
      const projectId = that.$refs.project.value;
      if (projectId === undefined || /\d+/.test(projectId) === false) {
        return callback(new Error('项目信息不能为空'));
      }
      callback();
    };
    const validateBelonger = function(rule, value, callback) {
      const belongerId = that.$refs.belonger.value;
      if (belongerId === undefined || /\d+/.test(belongerId) === false) {
        return callback(new Error('负责人信息不能为空'));
      }
      callback();
    };
    const validateTimeInterval = function(rule, value, callback) {
      const timeInterval = that.timeInterval;
      // const [startTime, endTime] = timeInterval;
      if (!timeInterval || timeInterval.length < 2) {
        return callback(new Error('计划时间不能为空'));
      }
      callback();
    };
    return {
      // 格式化表单宽度
      formLabelWidth: '120px',

      // 任务开始/结束时间戳
      timeInterval: [],

      // 表单校验规则
      taskInfoRules: {
        content: [
          { validator: validateString, trigger: 'blur', message: '任务内容不能为空' }
        ],
        project: [
          { validator: validateProject, trigger: 'change', message: '项目信息不能为空' }
        ],
        belonger: [
          { validator: validateBelonger, trigger: 'change', message: '负责人信息不能为空' }
        ],
        timeInterval: [
          { validator: validateTimeInterval, trigger: 'blur', message: '计划时间不能为空' }
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
      this.$refs.taskInfo.clearValidate();
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
          this.taskInfo.belongerName = user.userName;
        }
      });
    },

    // 当选择任务所属项目时，需要找到对应id的项目名并赋值到project
    formatProject(projectId, key) {
      this.projectList.find((project) => {
        if (project.projectId === projectId) {
          this.taskInfo.projectName = project.projectName;
        }
      });
    },

    // 当弹窗完全关闭时回调
    onDialogClosed() {
      this.$emit('close-edit-mode');
    }
  },
  computed: {
    // 初始化时间选择器
    timePickerOptions() {
      const onPick = () => {};
      return initTimePicker(
        ['today', 'week', 'month'],
        { firstDayOfWeek: 1, onPick }
      );
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

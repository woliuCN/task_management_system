<template>
  <el-dialog
    title="任务是否完成"
    width="25%"
    :visible.sync="isDialogShow"
    @close="closeDialog"
  >
    <el-form
      ref="completeForm"
      :model="completeForm"
      label-width="50px"
      :rules="workingHoursRule"
    >
      <el-form-item label="工时" prop="workingHours">
        <el-input v-model="completeForm.workingHours"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    isShow: {
      type: Boolean,
      defalut() {
        return false;
      }
    },
    taskInfo: {
      type: Object,
      requried: true
    }
  },
  data() {
    const validateWorkingHours = function(rule, value, callback) {
      if (value !== 0 && !value) {
        return callback(new Error('工时不能为空'));
      }
      if (/\d+/.test(value) === false) {
        return callback(new Error('工时必须为数字'));
      }
      if (value <= 0) {
        return callback(new Error('工时必须大于0'));
      }
      if (value % 1 !== 0) {
        return callback(new Error('工时必须为整数'));
      }
      callback();
    };
    return {
      // 表单数据
      completeForm: {
        workingHours: 0,
        task: {}
      },

      // 对工时的输入进行检查
      workingHoursRule: {
        workingHours: [
          { validator: validateWorkingHours, trigger: ['blur', 'change'] }
        ]
      },

      // 本dialog是否显示
      isDialogShow: this.isShow
    };
  },
  methods: {
    closeDialog() {
      this.$refs.completeForm.resetFields();
      this.$emit('close-dialog');
    },
    submit() {
      this.$refs.completeForm.validate(valid => {
        if (valid) {
          this.$emit('change-workinghours', this.completeForm);
          this.closeDialog();
        }
      });
    }
  },
  watch: {
    taskInfo(task) {
      this.completeForm.workingHours = task.workingHours;
      this.completeForm.task = task;
    },
    isShow(val) {
      this.isDialogShow = val;
    }
  }
};
</script>

<style scoped>

</style>

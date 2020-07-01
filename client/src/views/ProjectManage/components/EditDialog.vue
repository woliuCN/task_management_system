<template>
  <div>
    <el-dialog
      title="新增项目"
      top="5vh"
      :visible.sync="isShow"
      :close-on-click-modal=false
      :show-close=false
    >
      <el-form
        ref="projectInfo"
        :model="projectInfo"
        :hide-required-asterisk=true
        :rules="projectRules"
      >
        <el-form-item
          label="项目名称"
          prop="projectName"
          :label-width="formLabelWidth"
        >
          <el-input
            v-model="projectInfo.projectName"
            autocomplete="off"
            class="width-90"
          >
          </el-input>
        </el-form-item>

        <el-form-item
          label="选择负责人"
          prop="belonger"
          :label-width="formLabelWidth"
        >
          <el-select
            v-model="projectInfo.belongerId"
            filterable
            placeholder="请选择任务负责人"
            class="width-90"
            ref="belonger"
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

        <el-form-item label="项目状态" :label-width="formLabelWidth">
          <el-radio-group v-model="projectInfo.state">
            <el-radio :label="0">运行中</el-radio>
            <el-radio :label="1">完成</el-radio>
            <el-radio :label="2">挂起</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="备注"
          :label-width="formLabelWidth"
          prop="remarks"
        >
          <el-input
            v-model="projectInfo.remarks"
            autocomplete="off"
            class="width-90"
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
    // 若projectInfo为空，则代表是新增项目，否则为修改项目信息
    projectInfo: Object,
    isShow: Boolean,
    userList: {
      type: Array,
      defalut() {
        return {}
      }
    }
  },
  data() {
    const that = this;
    const validateBelonger = function(rule, value, callback) {
      const belongerId = that.$refs.belonger.value;
      if (belongerId === undefined || /\d+/.test(belongerId) === false) {
        return callback(new Error('项目信息不能为空'));
      }
      callback();
    };
    const validateString = function(rule, value, callback) {
      value = value ? value.toString().trim() : '';
      if (!value) {
        return callback(new Error('内容不能为空'));
      }
      callback();
    };
    return {
      formLabelWidth: '120px',
      projectRules: {
        projectName: [
          { validator: validateString, trigger: 'blur', message: '项目不能为空' }
        ],
        belonger: [
          { validator: validateBelonger, trigger: 'change', message: '负责人信息不能为空' }
        ]
      }
    };
  },
  methods: {
    // 告知父组件关闭本弹窗并清空表单数据
    closeDialog() {
      this.$refs.projectInfo.resetFields();
      this.$emit('close-dialog');
    },

    // 提交表单数据让父组件进行处理
    submitTask() {
      this.$refs.projectInfo.validate(valid => {
        if (valid) {
          this.$emit('submit-project', JSON.stringify(this.projectInfo));
          this.$emit('close-dialog');
        }
      });
    },

    // 当选择任务负责人的时候，需要找到对应id的名字，并赋值到belonger
    formatBelonger(userId) {
      this.userList.find((user) => {
        if (user.userId === userId) {
          this.projectInfo.belongerName = user.userName;
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
</style>

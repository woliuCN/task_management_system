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
        :model="projectInfo"
        ref="projectInfo"
        :hide-required-asterisk=true
      >
        <el-form-item
          label="项目名称"
          prop="projectName"
          :label-width="formLabelWidth"
          :rules="[ { required: true, message: '项目名称不能为空'} ]"
        >
          <el-input
            v-model="projectInfo.projectName"
            autocomplete="off"
            class="width-90"
          >
          </el-input>
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
    projectInfo: Object,
    isShow: Boolean
  },
  data() {
    return {
      formLabelWidth: '120px'
    }
  },
  methods: {
    closeDialog() {
      this.$refs.projectInfo.resetFields();
      this.$emit('close-dialog');
    },
    submitTask() {
      this.$refs.projectInfo.validate(valid => {
        if (valid) {
          this.$emit('submit-project', JSON.stringify(this.projectInfo));
          this.$emit('close-dialog');
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

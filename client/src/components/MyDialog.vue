<template>
  <el-dialog
    :title="titleName"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="close"
  >
    <el-form label-position="right" label-width="80px" >
      <el-form-item
        v-for="(item, index) in internalTableData"
        :key="index"
        :label="item.label"
        :rules="item.rules"
      >
        <el-select v-if="item.type === 'select'" v-model="item.value" placeholder="请选择">
          <el-option
            v-for="(option, optionIdx) in item.options"
            :key="optionIdx"
            :label="option"
            :value="option">
          </el-option>
        </el-select>
        <el-checkbox v-else-if="item.type === 'checkbox'" v-model="item.value"></el-checkbox>
        <el-date-picker
          v-else-if="item.type === 'date'"
          v-model="item.value"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份">
        </el-date-picker>
        <el-input v-else v-model="item.value" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">{{closeBtnName}}</el-button>
      <el-button type="primary" @click="success">{{successBtnName}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'MyDialog',
  props: {
    // 弹窗显示与否
    visible: {
      type: Boolean,
      default: false
    },
    // 弹窗title
    titleName: {
      type: String,
      default: '',
      required: true
    },
    // 弹窗内容
    tableData: {
      type: Array,
      required: true
    },
    // 通过按钮名称
    successBtnName: {
      type: String,
      default: '保存'
    },
    // 取消按钮名称
    closeBtnName: {
      type: String,
      default: '取消'
    }
  },
  data() {
    return {
      internalTableData: JSON.parse(JSON.stringify(this.tableData))
    };
  },
  created() {
    // Object.assign(this.internalTableData, this.tableData);
    console.log(this.internalTableData);
  },
  methods: {

    // 关闭弹窗事件
    close() {
      this.$emit('close');
      this.$emit('update:visible', false);
      this.clearTableData();
    },

    // success按钮触发事件
    success() {
      const validate = this.validate();
      if (validate.validated) {
        this.$emit('success', this.internalTableData);
        this.$emit('update:visible', false);
        this.clearTableData();
      } else {
        console.error(validate.message);
      }
    },

    // 验证表单信息是否为空
    validate() {
      let message = '';
      const validated = this.internalTableData.every((item, index) => {
        if (item.rules && item.rules.required) {
          if (item.value === '' || item.value === undefined || item.value === null) {
            message = item.rules.message && item.rules.message;
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      });
      return {
        message,
        validated
      };
    },

    // 清除表单内容
    clearTableData() {
      this.internalTableData = JSON.parse(JSON.stringify(this.tableData));
    }
  }
};
</script>

<style lang="scss" scoped>
.el-dialog__body {
  .el-form {
    .el-select {
      width: 100%;
    }
    .el-date-editor {
      width: 100%;
    }
  }
}
</style>

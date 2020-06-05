<template>
  <div>
    <div class="options">
      <el-button
        v-for="(item,index) in buttonList"
        :key="index"
        :type="item.type"
        :size="item.size"
        :icon="item.icon"
        @click="handleFunc(scope.$index, scope.row, item.event)"
      >
      {{ item.text }}
      </el-button>
    </div>
    <el-table
      ref="table"
      :data="tableData"
      :max-height="maxHeight"
      style="width: 100%;"
      fit
    >
      <el-table-column
        v-if="isSelection"
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        v-for="title in tableTitle"
        :key="title.id"
        :prop="title.prop"
        :label="title.label"
        :fixed="title.fixed"
        :width="title.width?title.width:120"
      >
      </el-table-column>
    </el-table>
    <div
      style="margin-top: 20px"
      v-if="isSelection"
    >
      <el-button @click="toggleSelection()"></el-button>
      <el-button @click="toggleSelection()">取消选择</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // 表单的首行，格式为[{prop, label, id, width, fixed}]，其中width和fixed为必填，prop必须与tableData对应
    tableTitle: Array,
    // 表单数据，其中数据的键名需与对应title 的prop对应
    tableData: Array,
    // 表单的最高高度
    maxHeight: Number,
    // 是否在右边显示选择框
    isSelection: Boolean,
    // 自定义操作按钮组
    buttonList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    /**
     * 用于获取触发事件的列表行数据，并且将数据分发给父组件，由父组件来进行相应的处理
     * @param {Number} index: 当前被点击行的行数
     * @param {Array} row: 当前被点击的列表行数据
     * @param {String} event: 分发给父组件的事件名
     */
    handleFunc (index, row, event) {
      this.$emit(event, row)
    },
    // 当出现选择框时，用来进行选中、取消操作
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.table.toggleRowSelection(row)
        })
      } else {
        this.$refs.table.clearSelection()
      }
    }

  }
}
</script>

<style lang="scss" scoped>
  .options{
    display: flex;
    align-items: center;
    overflow: auto;
    margin-bottom: 20px;;
  }
</style>

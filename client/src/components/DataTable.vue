<template>
  <div>
    <div class="options">
      <el-button
        v-for="(item,index) in buttonList"
        :key="index"
        :type="item.type"
        :size="item.size||'mini'"
        :icon="item.icon"
        @click="handleFunc(selectedData, item.event)"
      >
      {{ item.text }}
      </el-button>
      <el-input
        v-model="searchContent"
        size="mini"
        placeholder="输入关键字搜索"
        class="searchButton"
      />
    </div>
    <el-table
      ref="table"
      :data="tableData|dataFilter(that)"
      :max-height="maxHeight"
      style="width: 100%;"
      fit
      @selection-change="handleSelectionChange"
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
    <div class="block">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="1"
        :page-size="10"
        layout="total, prev, pager, next, jumper"
        :total="400">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedData: [],
      that: this,
      searchContent: ""
    };
  },
  props: {
    // 表单的首行，格式为[{prop, label, id, width, fixed}]，其中width和fixed为必填，prop必须与tableData对应
    tableTitle: Array,
    // 表单数据，其中数据的键名需与对应title 的prop对应
    tableData: Array,
    // 表单的最高高度
    maxHeight: Number,
    // 是否在左边显示选择框
    isSelection: Boolean,
    // 自定义操作按钮组
    buttonList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  methods: {
    /**
     * 用于获取触发事件的列表行数据，并且将数据分发给父组件，由父组件来进行相应的处理
     * @param {Array} row: 当前被点击的列表行数据
     * @param {String} event: 分发给父组件的事件名
     */
    handleFunc(data, event) {
      this.$emit(event, data);
    },

    // 选中的表单内容，并将内容地址赋值给selectedData，用于传数据给父组件
    handleSelectionChange(val) {
      this.selectedData = val;
    },

    handleCurrentChange(val) {

    }
  },
  filters: {
    dataFilter(data, that) {
      return data.filter(item => {
        item = JSON.stringify(item);
        return !that.searchContent || item.toLowerCase().includes(that.searchContent.toLowerCase());
      })
    }
  }
};
</script>

<style lang="scss" scoped>
  .options{
    display: flex;
    align-items: center;
    overflow: auto;
    margin-bottom: 20px;
  }
  .searchButton {
    width: 20vw;
    margin-left: 1vw;
  }
</style>

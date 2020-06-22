<template>
  <div>
    <div class="options">
      <slot name="tmp_search"></slot>
      <!-- 将父组件传过来的按钮数组实例化 -->
      <el-button
        v-for="(item,index) in buttonList"
        :key="index"
        :type="item.type"
        :size="item.size||'mini'"
        :icon="item.icon"
        @click="handleFunc(selectedData, item.event, item.limit)"
      >
      {{ item.text }}
      </el-button>
      <el-input
        v-if="isShowSearch"
        v-model="searchContent"
        size="mini"
        placeholder="输入关键字搜索"
        class="searchButton"
        :clearable="true"
        @change="handleFunc(searchContent, 'search-content-changed', 0)"
      />
    </div>
    <el-table
      ref="table-body"
      style="width: 100%;"
      fit
      border
      stripe
      :data="tableData"
      :max-height="maxHeight"
      :row-class-name="'data-item'"
      @selection-change="handleSelectionChange"
      @row-click="handleClick"
      @row-dblclick="handleDblcilck"
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
        :sortable="title.sortable"
      >
      </el-table-column>
    </el-table>
    <div class="block">
      <el-pagination
        layout="total, prev, pager, next, jumper"
        :current-page="currentIndex"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { debounce } from '../filters/index';
export default {
  data() {
    return {
      // 以选中的表单数据
      selectedData: [],
      that: this,

      // 绑定搜索内容
      searchContent: '',

      currentIndex: 0
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

    // 是否显示搜索框
    isShowSearch: {
      type: Boolean,
      default: false
    },

    // 自定义操作按钮组
    buttonList: {
      type: Array,
      default() {
        return [];
      }
    },

    pageIndex: {
      type: Number,
      default: 0
    },

    pageSize: {
      type: Number,
      default: 8
    },

    total: {
      type: Number,
      default: 0
    }
  },
  methods: {
    debounce,
    
    /**
     * 用于获取触发事件的列表行数据，并且将数据分发给父组件，由父组件来进行相应的处理
     * @param {Array} row: 当前被点击的列表行数据
     * @param {String} event: 分发给父组件的事件名
     */
    handleFunc(data, event, limit) {
      limit = limit || 0;
      if (data && data.length < limit) {
        this.$message({
          message: `至少选择${limit}项任务再执行操作`,
          type: 'error',
          duration: 1000
        })
      } else {
        this.$emit(event, data);
      }
    },

    // 已选中的表单内容，并将内容地址赋值给selectedData，用于传数据给父组件
    handleSelectionChange(val) {
      this.selectedData = val;
    },

    // 页码跳转处理函数
    handlePageChange(val) {
      this.debouncePageChange(val);
    },

    handleDblcilck(row, column, event) {
      this.handleFunc(row, 'dblclick', 0);
    },

    handleClick(row, column, event) {
      if (!this.isSelection) {
        return -1;
      }
      this.$refs['table-body'].toggleRowSelection(row);
    }
  },
  created() {
    this.debouncePageChange = this.debounce(
      // 进行防抖处理的函数
      (pageIndex) => {
        this.$emit('page-index-change', pageIndex);
      },
      // 间隔时间
      500,
      // 立刻执行
      true,
      // 操作太快时执行的回调函数
      () => {
        // 当用户操作太快时进行弹窗提醒
        this.$message({
          message: '请不要频繁操作！',
          type: 'warning',
          duration: 1000
        });
        this.currentIndex = 1;
        this.$nextTick(() => {
          this.currentIndex = this.pageIndex;
        })
      }
    );
  },
  watch: {
    pageIndex() {
      this.currentIndex = this.pageIndex;
    }
  }
};
</script>

<style lang="scss" scoped>
  .options {
    display: flex;
    align-items: center;
    overflow: auto;
    margin-bottom: 20px;
  }

  .searchButton {
    width: 20vw;
    margin-left: 1vw;
  }

  /deep/.data-item {
    font-size: 13px!important;
  }

  /deep/.el-pagination {
    margin-top: 10px;
  }
</style>

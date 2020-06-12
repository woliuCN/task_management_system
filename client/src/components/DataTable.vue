<template>
  <div>
    <div class="options">
      <slot name="tmp_search"></slot>
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
        v-if="isShowSearch"
        v-model="searchContent"
        size="mini"
        placeholder="输入关键字搜索"
        class="searchButton"
        @change="handleSearchChange"
      />
    </div>
    <el-table
      ref="table"
      :data="tableData"
      :max-height="maxHeight"
      style="width: 100%;"
      :row-class-name="'data-item'"
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
        :sortable="title.sortable"
      >
      </el-table-column>
    </el-table>
    <div class="block">
      <el-pagination
        layout="total, prev, pager, next, jumper"
        :current-page="pagination.pageIndex"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { debounce } from '../filters/index.js';
export default {
  data() {
    return {
      selectedData: [],
      that: this,
      searchContent: '',
      pageIndex: 0
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

    // 分页数据
    pagination: {
      type: Object,
      default() {
        return {
          pageSize: 10,
          pageIndex: 0,
          total: 0
        }
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

    handlePageChange(val) {
      // this.$emit('page-index-change', val);
      this.debounceHandleSearchChange(val);
      console.log(`当前页数${val}`);
    },

    handleSearchChange(val) {
      if (val !== undefined && val.length > 0) {
        this.$emit('search-content-changed', val);
      }
    }
  },
  created() {
    this.debounceHandleSearchChange = debounce(
      (val) => {
        this.$emit('page-index-change', val);
        this.pageIndex = this.pagination.pageIndex;
      },
      1500,
      true,
      () => {
        console.log('点击太快了');
        setTimeout(() => {
          this.pagination.pageIndex = this.pageIndex;
        }, 0);
      }
    );
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
  /deep/.data-item:nth-child(2n) {
    background-color: rgba($color: #eeeeeea9, $alpha: 1.0)
  }
</style>

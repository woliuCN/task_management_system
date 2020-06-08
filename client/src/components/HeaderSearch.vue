<template>
  <div class="header-search" :class="isShow?'show':''">
    <i class="fa fa-search" @click="toggleShow"></i>
    <el-select
      v-model="search"
      :remote-method="querySearch"
      remote
      filterable
      default-first-option
      placeholder="Search"
      class="header-search-select"
      @change="selectChange"
      ref="headerSearchSelect"
    >
      <el-option v-for="item in options" :key="item.path" :value="item" :label="item.title" />
    </el-select>
  </div>
</template>
<script>
export default {
  data () {
    return {
      options: [
        {
          path: '/',
          title: '首页'
        },
        {
          path: '/task',
          title: '任务'
        },
        {
          path: '/project',
          title: '项目'
        }
      ],
      search: '',
      isShow: false
<<<<<<< HEAD
    };
  },
  methods: {
    // 关键词搜索
    querySearch(query) {},

    // 选中值改变的时候
    selectChange() {},

    // 切换搜索框状态
    toggleShow() {
      this.isShow = !this.isShow;
    }
  }
};
=======
    }
  },
  methods: {
    // 关键词搜索
    querySearch (query) {},

    // 选中值改变的时候
    selectChange () {},

    // 切换搜索框状态
    toggleShow () {
      this.isShow = !this.isShow
    }
  }
}
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251
</script>
<style lang="scss" scoped>
.header-search {
  display: flex;
  align-items: center;
  .fa-search {
    font-size: 20px;
    cursor: pointer;
    margin-right: 8px;
    color: #666;
  }
  .header-search-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    /deep/ .el-input__inner {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }
  &.show {
    .header-search-select {
      width: 300px;
      margin-left: 10px;
    }
  }
}
</style>

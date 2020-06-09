<template>
  <div class="tags-view-container">
    <router-link
      class="tags-item"
      v-for="(tag,index) in visitedViews"
      :key="index"
      :class="isActive(tag) ? 'active' :''"
      :to="{path: tag.path, query: tag.query}"
    >
      {{tag.title}}
      <span v-if="isFixed(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)"></span>
    </router-link>
  </div>
</template>
<script>
export default {
  props: {},
  data() {
    return {
      visitedViews: [
        {
          path: '/home',
          query: '',
          title: '首页'
        },
        {
          path: '/log',
          query: '',
          title: '系统日志'
        },
        {
          path: '/group',
          query: '',
          title: '用户分组'
        },
        {
          path: '/task',
          query: '',
          title: '项目管理'
        }
      ]
    };
  },
  computed: {},
  methods: {

    // 是否是选中状态
    isActive(route) {
      return route.path === this.$route.path;
    },

    // 是否是固定的标签
    isFixed(tag) {
      return true;
    },

    // 关闭标签
    closeSelectedTag(tag) {

    }
  }
};
</script>
<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  .tags-item {
    display: inline-block;
    position: relative;
    cursor: pointer;
    height: 26px;
    line-height: 26px;
    border: 1px solid #d8dce5;
    color: #495060;
    background: #fff;
    padding: 0 8px;
    font-size: 12px;
    margin-left: 5px;
    margin-top: 4px;
    &:first-of-type {
      margin-left: 15px;
    }
    &:last-of-type {
      margin-right: 15px;
    }
    &.active {
      background-color: #42b983;
      color: #fff;
      border-color: #42b983;
      &::before {
        content: "";
        background: #fff;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: relative;
        margin-right: 2px;
      }
    }
    /deep/.el-icon-close{
        padding: 2px;
        &:hover{
            background: #aaa;
            color: #fff;
            border-radius: 50%;
        }
    }
  }
}
</style>

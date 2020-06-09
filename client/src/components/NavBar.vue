<template>
  <div class="nav-container">
    <div class="nav-left">
      <div class="option-icon">
        <i class="el-icon-s-fold" v-if="!isFold" @click="toggleFold(true)"></i>
        <i class="el-icon-s-unfold" v-if="isFold" @click="toggleFold(false)"></i>
      </div>
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>活动管理</el-breadcrumb-item>
          <el-breadcrumb-item>活动列表</el-breadcrumb-item>
          <el-breadcrumb-item>活动详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <div class="nav-right">
      <header-search/>
      <div class="system-options">
        <el-dropdown>
          <img src="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80" class="user-avator">
          <i class="el-icon-caret-bottom"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>首页</el-dropdown-item>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import HeaderSearch from './HeaderSearch';
export default {
  components: {
    HeaderSearch
  },
  props: {
  },
  data() {
    return {};
  },
  computed: {
    isFold() {
      return this.$store.state.menu.foldState;
    }
  },
  methods: {
    // 切换菜单栏隐藏与否
    toggleFold(flag) {
      this.$store.commit('setFoldState', flag);
    }
  }
};
</script>
<style lang="scss" scoped>
.nav-container {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 15px;
  .nav-left{
    display: flex;
    align-items: center;
    flex: 1;
    .option-icon{
      flex: 0 0 40px;
      .el-icon-s-fold,.el-icon-s-unfold{
        font-size: 20px;
        color: #555;
        vertical-align: bottom;
        cursor: pointer;
      }
    }
    .breadcrumb{
      /deep/.el-breadcrumb{
        .el-breadcrumb__inner{
          color: #97a8be;
          &.is-link{
            color: #333;
            font-weight: 600;
          }
        }
        .el-breadcrumb__separator{
          font-size: 12px;
        }
      }
    }
  }
  .nav-right{
    display: flex;
    align-items: center;
    .system-options{
      flex: 0 0 120px;
      margin-left: 10px;
      .user-avator{
        width: 42px;
        border-radius: 10px;
      }
      .el-icon-caret-bottom{
        vertical-align: bottom;
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>

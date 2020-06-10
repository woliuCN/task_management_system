<template>
  <div class="home">
    <div class="side-bar" :class="isFold?'isFold':''">
      <side-bar></side-bar>
    </div>
    <div class="main-container">
      <nav-bar />
      <tags />
      <main class="app-main">
        <transition name="fade-transform" mode="out-in">
          <keep-alive :include="cachedViews">
            <router-view :key="nowPath" />
          </keep-alive>
        </transition>
      </main>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import SideBar from '@/components/SideBar.vue';
import Tags from '@/components/Tags.vue';
import NavBar from '@/components/NavBar.vue';
export default {
  name: 'Home',
  components: {
    SideBar,
    Tags,
    NavBar
  },
  computed: {
    isFold() {
      return this.$store.state.menu.foldState;
    },

    // 当前已经打开过的页面
    cachedViews() {
      return this.$store.state.tags.cachedViews;
    },

    // 当前的路径
    nowPath() {
      return this.$route.path;
    }
  }
};
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  .side-bar {
    flex: 0 0 auto;
    width: $side-bar-width;
    height: 100vh;
    background: $side-bar-color;
    &.isFold {
      width: 65px;
      transition: all 0.3s;
      /deep/.el-menu {
        .el-submenu {
          width: 65px !important;
        }
      }
    }
    transition: all 0.3s;
  }
  .main-container {
    flex: 1;
    overflow: auto;
    overflow-x: hidden;
    .app-main {
      padding: 15px;
      box-sizing: border-box;
    }
  }
}
</style>

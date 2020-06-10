<template>
  <div>
    <el-menu
      :default-active="defaultActive"
      class="el-menu-vertical-demo"
      background-color="rgb(48, 65, 86)"
      text-color="#fff"
      active-text-color="#1890f"
      unique-opened
      :collapse="isFold"
      router
    >
      <el-menu-item index="/dashboard">
        <i class="fa fa-home"></i>
        <span slot="title">首页</span>
      </el-menu-item>
      <el-submenu v-for="menu in menuLists" :index="menu.index" :key="menu.index">
        <template slot="title">
          <i class="fa" :class="menu.icon"></i>
          <span slot="title">{{menu.title}}</span>
        </template>
        <el-menu-item-group v-if="menu.children.length>0">
          <el-menu-item
            v-for="item in menu.children"
            :key="item.index"
            :index="item.index"
          >{{item.title}}</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </div>
</template>
<script>
export default {
  props: {},
  data() {
    return {
      menuLists: []
    };
  },
  computed: {
    isFold() {
      return this.$store.state.menu.foldState;
    },
    defaultActive() {
      return this.$route.path;
    }
  },
  methods: {
    // 跳转页面 iten:跳转的相关信息,使用element menu的router后自动导航，可以去掉，需要加路由守卫
    // changeViews(item) {
    //   if (item.path === this.$route.path) {
    //     return;
    //   }
    //   this.$store.commit('addCachedViews', item);
    //   this.$router.push(item.path);
    // },
    // // 回首页
    // goHome() {
    //   this.$router.push('/dashboard');
    // }
  },
  mounted() {
    this.menuLists = this.$store.state.menu.menuLists;
  }
};
</script>
<style lang="scss" scoped>
/deep/.el-menu {
  border-right: none;
  .el-menu-item-group__title {
    padding: 0 !important;
  }
  .el-submenu {
    width: $side-bar-width !important;
    .el-submenu__title {
      text-align: left;
      font-size: 14px !important;
      &:hover {
        background: #263443 !important;
      }
      .fa {
        font-size: 16px;
        color: #bbb;
        width: 20px;
        margin: 0 10px 0 5px;
      }
    }
    .el-menu-item {
      min-width: 0px;
      padding-left: 50px !important;
      &.is-active {
        color: #409eff !important;
      }
    }
    &.is-opened {
      .el-menu-item {
        background: #1f2d3d !important;
        &:hover {
          background: #001528 !important;
        }
      }
    }
  }
  .el-menu-item {
    font-size: 14px !important;
    &:hover {
      background: #001528 !important;
    }
    &.is-active {
      color: #409eff !important;
    }
    .fa {
      font-size: 20px;
      color: #bbb;
      width: 20px;
      margin: 0 10px 0 5px;
    }
  }
}
</style>

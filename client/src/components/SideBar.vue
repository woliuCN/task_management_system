<template>
  <div >
    <el-menu
      :default-active="defaultActive"
      class="el-menu-vertical-demo"
      background-color="rgb(48, 65, 86)"
      text-color="#fff"
      active-text-color="#1890f"
      unique-opened
      :collapse="isFold"
    >
      <el-submenu v-for="menu in menuLists"  :index="menu.index" :key="menu.index">
        <template slot="title" >
          <i class="fa " :class="menu.icon"></i>
          <span slot="title">{{menu.title}}</span>
        </template>
        <el-menu-item-group v-if="menu.children.length>0">
          <el-menu-item v-for="item in menu.children" :key="item.path" :index="item.path" @click="changeViews(item)">{{item.title}}</el-menu-item>
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
      menuLists: [],
      defaultActive: '/'
    };
  },
  computed: {
    isFold() {
      return this.$store.state.menu.foldState;
    }
  },
  methods: {
    // 跳转页面 iten:跳转的相关信息
    changeViews(item) {
      if (item.path === this.$route.path) {
        return;
      }
      this.defaultActive = item.path;
      this.$store.commit('addCachedViews', item);
      this.$router.push(item.path);
    }
  },
  mounted() {
    this.menuLists = this.$store.state.menu.menuLists;
  }
};
</script>
<style lang="scss" scoped>
/deep/.el-menu {
  border-right:none;
  .el-menu-item-group__title {
    padding: 0 !important;
  }
  .el-submenu {
    width: $side-bar-width !important;
    &:first-child{
      .fa-home{
        font-size: 20px!important;
      }
      .el-submenu__icon-arrow{
        display: none;
      }
    }
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
}

</style>

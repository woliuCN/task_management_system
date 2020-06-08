<template>
  <div >
    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      background-color="rgb(48, 65, 86)"
      text-color="#fff"
      active-text-color="#1890f"
      unique-opened
    >
      <el-submenu index="1">
        <template slot="title">
          <i class="fa fa-home"></i>
          <span>首页</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="1-1">选项1</el-menu-item>
          <el-menu-item index="1-2">选项2</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">
          <i class="fa fa-gears"></i>
          <span>系统管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="2-1">选项1</el-menu-item>
          <el-menu-item index="2-2">选项2</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">
          <i class="fa fa-group"></i>
          <span>人员管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="3-1">选项1</el-menu-item>
          <el-menu-item index="3-2">选项2</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="4">
        <template slot="title">
          <i class="fa fa-file-text"></i>
          <span slot="title">项目管理</span>
        </template>
      </el-submenu>
    </el-menu>
  </div>
</template>
<script>
export default {
  props: {},
  data() {
    return {
    };
  },
  computed: {
    isFold() {
      return this.$store.state.menu.foldState;
    }
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
/deep/.el-menu {
  .el-menu-item-group__title {
    padding: 0 !important;
  }
  .el-submenu {
    width: $side-bar-width !important;
    .el-submenu__title {
      text-align: left;
      &:hover {
        background: #263443 !important;
      }
    }
    .el-menu-item {
      min-width: 0px;
    }
    .el-submenu__title {
      font-size: 14px !important;
      .fa {
        font-size: 16px;
        color: #bbb;
        margin: 0 10px 0 5px;
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
}

</style>

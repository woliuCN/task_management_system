<template>
  <div class="nav-container">
    <div class="nav-left">
      <div class="option-icon">
        <i class="el-icon-s-fold" v-if="!isFold" @click="toggleFold(true)"></i>
        <i class="el-icon-s-unfold" v-if="isFold" @click="toggleFold(false)"></i>
      </div>
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <transition-group name="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }" key="/">首页</el-breadcrumb-item>
            <el-breadcrumb-item
              v-for="(breadcrumb,index) in breadcrumbLists"
              :key="index"
            >{{breadcrumb}}</el-breadcrumb-item>
          </transition-group>
        </el-breadcrumb>
      </div>
    </div>
    <div class="nav-right">
      <header-search />
      <div class="system-options">
        <el-dropdown @command="handleCommand">
          <img src="@/assets/images/avator.gif" class="user-avator" />
          <i class="el-icon-caret-bottom"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <router-link to="/">首页</router-link>
            </el-dropdown-item>
            <el-dropdown-item>修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
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
  props: {},
  data() {
    return {};
  },
  computed: {
    isFold() {
      return this.$store.state.menu.foldState;
    },
    breadcrumbLists() {
      const menuLists = this.$store.state.menu.menuLists;
      const path = this.$route.path;
      const res = [];
      menuLists.map(subMenu => {
        const subTitle = subMenu.title;
        subMenu.children.map(menu => {
          if (menu.index === path) {
            res.push(subTitle, menu.title);
          }
        });
      });
      return res;
    }
  },
  methods: {
    // 切换菜单栏隐藏与否
    toggleFold(flag) {
      this.$store.commit('setFoldState', flag);
    },

    // 右上角下拉框被点击时触发事件
    handleCommand(command) {
      // 退出登录
      if (command === 'logout') {
        this.$confirm('确定退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
        // 在这里做退出登录操作
          this.$router.push('/login');
        });
      }
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
  .nav-left {
    display: flex;
    align-items: center;
    flex: 1;
    .option-icon {
      flex: 0 0 40px;
      .el-icon-s-fold,
      .el-icon-s-unfold {
        font-size: 20px;
        color: #555;
        vertical-align: bottom;
        cursor: pointer;
      }
    }
    .breadcrumb {
      /deep/.el-breadcrumb {
        font-size: 13px;
        .el-breadcrumb__inner {
          color: #97a8be;
          &.is-link {
            color: #333;
            font-weight: 600;
          }
        }
        .el-breadcrumb__separator {
          font-size: 12px;
        }
      }
    }
  }
  .nav-right {
    display: flex;
    align-items: center;
    .system-options {
      flex: 0 0 120px;
      margin-left: 10px;
      .user-avator {
        width: 42px;
        border-radius: 10px;
      }
      .el-icon-caret-bottom {
        vertical-align: bottom;
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>

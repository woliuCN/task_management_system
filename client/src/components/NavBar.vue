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
            <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <el-dialog
      title="修改密码"
      width="30%"
      :visible.sync="isChangePassword"
      @close="closePasswordDialog"
    >
      <el-form
        ref="passwordForm"
        status-icon
        :model="passwordForm"
        :rules="passwordFormRules"
      >
        <el-form-item label="原密码" prop="orginPassword">
          <el-input
            type="password"
            v-model="passwordForm.orginPassword"
            autocomplete="off"
            >
            </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            type="password"
            v-model="passwordForm.newPassword"
            autocomplete="off"
            >
            </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkNewPassword">
          <el-input
            type="password"
            v-model="passwordForm.checkNewPassword"
            autocomplete="off"
            >
            </el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closePasswordDialog">取 消</el-button>
        <el-button type="primary" @click="changePassword">确 认</el-button>
      </div>
    </el-dialog>
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
    var validateOrginPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入原密码'));
      } else {
        callback();
      }
    };
    var validateNewPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'));
      } else {
        if (this.passwordForm.newPassword !== '') {
          this.$refs.passwordForm.validateField('checkNewPassword');
        }
        callback();
      }
    };
    var validateNewPass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      isChangePassword: false,
      passwordForm: {
        orginPassword: '',
        newPassword: '',
        checkNewPassword: ''
      },
      passwordFormRules: {
        orginPassword: [
          { validator: validateOrginPass, trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度必须为 6 到 12 个字符', trigger: 'blur' }
        ],
        newPassword: [
          { validator: validateNewPass, trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度必须为 6 到 12 个字符', trigger: 'blur' }
        ],
        checkNewPassword: [
          { validator: validateNewPass2, trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度必须为 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    };
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
          // this.$router.push('/login');
          this.$http.getRequest('/user/logOut')
            .finally(_ => {
              this.$router.push('/login');
            });
        });
      } else if (command === 'changePassword') {
        // 修改密码
        this.isChangePassword = true;
      }
    },

    // 关闭修改密码弹窗
    closePasswordDialog() {
      this.isChangePassword = false;
    },

    // 发送修改密码请求
    changePassword() {
      const oldPassword = this.passwordForm.orginPassword;
      const newPassword = this.passwordForm.newPassword;
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          this.$http.postRequest('/user/changePassword', { oldPassword, newPassword })
            .then(res => {
              if (res.retCode === -1) {
                this.$message({
                  message: res.message,
                  type: 'error',
                  duration: 1000
                })
              } else {
                this.$message({
                  message: '修改成功',
                  type: 'success',
                  duration: 1000
                })
              }

              this.isChangePassword = false;
            });
        }
      });
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

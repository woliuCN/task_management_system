<template>
  <div class="login">
    <div class="login-logo">
      <a href="#" width="40px">
        <img
          class="logo-img"
          src="https://b-gold-cdn.xitu.io/v3/static/img/normal.0447fe9.png"
          alt="logo"
        />
      </a>
    </div>
    <div class="login-box">
      <el-form
        :model="formData"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item
          label="用户名"
          prop="username"
          label-position="top"
          size="mini"
        >
          <el-input prefix-icon="el-icon-user" v-model="formData.username"/>
        </el-form-item>

        <el-form-item
          label="密码"
          prop="password"
          class="password"
          label-position="top"
          size="mini"
        >
          <el-input prefix-icon="el-icon-lock"  v-model="formData.password" :show-password="true" />
        </el-form-item>

        <el-form-item
          prop="isRemember"
          size="mini"
          align="right"
          class="remember"
        >
          <el-checkbox v-model="formData.isRemember">remember</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            style="width: 100%;"
            @click="login"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      formData: {
        username: '',
        password: '',
        isRemember: false
      }
    };
  },
  methods: {
    login() {
      this.$http
        .postRequest('/user/loginValidation', {
          password: this.formData.password,
          userId: this.formData.username
        })
        .then(res => {
          if (res.retCode === -1) {
            this.$message({
              message: `登录失败，${res.message}.`,
              type: 'error',
              duration: 1000
            });
          } else {
            this.$message({
              message: '登录成功',
              type: 'success',
              duration: 1000,
              onClose: _ => {
                this.$router.push('/');
              }
            });
          }
        });
    }
  }
};
</script>
<style lang="scss" scoped>
  .login {
    box-sizing: border-box;
    width: 100vw;
    height: 100vh;
    padding-top: 15vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-image: url('../assets/images/background.jpg');
    background-size: cover;
    .login-box {
      zoom: 1.2;
      border: 1px solid #eeeeee;
      border-radius: 5px;
      background-color: rgba(255, 255, 255, 0.7);
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      padding: 1vw 3vw .5vw;

      /deep/.el-form-item__content {
        margin-left: 0!important;
      }

      /deep/.el-form-item__label {
        font-size: 14px;
        font-weight: 800;
        text-align: left;
      }

      .remember {
        margin-bottom: 0!important;
      }

      .password {
        margin-bottom: 2px;
      }

      /deep/.el-form-item {
        margin-bottom: 10px;
      }
    }

    .logo-img {
      width: 120px!important;
      transform: translate(0, 15%);
    }
  }
</style>

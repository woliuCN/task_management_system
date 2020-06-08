<template>
  <div class="home">
    <div class="side-bar" :class="isFold?'isFold':''">
      <side-bar></side-bar>
    </div>
    <div class="main-container">
      <nav-bar/>
      <tags/>
<<<<<<< HEAD
      <task-list class="task-list"></task-list>
=======
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251
      <!-- app-main -->
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
<<<<<<< HEAD
import SideBar from '@/components/SideBar.vue';
import Tags from '@/components/Tags.vue';
import NavBar from '@/components/NavBar.vue';
import TaskList from './TaskList';
=======
import SideBar from '@/components/SideBar.vue'
import Tags from '@/components/Tags.vue'
import NavBar from '@/components/NavBar.vue'
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251
export default {
  name: 'Home',
  components: {
    SideBar,
    Tags,
<<<<<<< HEAD
    NavBar,
    TaskList
  },
  computed: {
    isFold() {
      return this.$store.state.menu.foldState;
=======
    NavBar
  },
  computed: {
    isFold () {
      return this.$store.state.menu.foldState
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251
    }
  }
};
</script>
<style lang="scss" scoped>
  .home{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    .side-bar{
      flex: 0 0 auto;
      width: $side-bar-width;
      height: 100vh;
      background: $side-bar-color;
      &.isFold{
        width: 0;
        transition: all 0.5s;
        /deep/.el-menu{
          display: none;
        }
      }
      transition: all 0.5s;
    }
    .main-container{
      flex: 1;
    }
<<<<<<< HEAD
    .task-list {
      margin: 1vw;
      padding: 1vw;
    }
=======
>>>>>>> 7734365e10d6e1728210aab430a9aff0f8fc4251
  }
</style>

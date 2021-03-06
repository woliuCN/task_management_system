<template>
  <div>
    <cards :cardList="cardList"></cards>
    <el-row class="chart" :gutter="20">
      <el-col
        :xs="24"
        :sm="16"
        class="account-item">
        <chart v-loading="loadingOfUserInLastYear" :options="PerSituationInThePastYear" domName="two"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="8"
        v-loading="loadingOfUserInLastYear"
        class="account-item people">
        <div class="box-card">
          <div v-for="user in onJobPeople" :key="user.userId" class="text item">
            <el-avatar icon="el-icon-s-custom" :style="getColor()"></el-avatar>
            <p>{{user.userName}}</p>
            <p>{{user.state | stateTrim }}</p>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="24"
        :sm="24"
        class="account-item">
        <chart v-loading="loadingOfTasksInThisYear" :options="weeklyTaskNumThisYear" domName="four"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="9"
        class="account-item">
        <chart v-loading="loadingOfProject" :options="proStatusInThePastYear" domName="one"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="9"
        class="account-item">
        <chart v-loading="loadingOfTask" :options="monMissionsNumOverThePastYear" domName="three"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="6"
        class="account-item">
        <chart v-loading="loadingOfProjectInCurrentMonth" :options="weeklyTaskNumThisMon" domName="four"></chart>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Chart from '../components/Chart.vue';
import Cards from '../components/Cards.vue';
import { REQUEST_URL } from '../common/config.js';
import { filtrateDateFromTasks, filtrateDateFromProjects, filtrateDateFromTasksInCurrentMonth, weekTasksInThisYear, getCurrentWeekTaskNum, getOnJobOfMonthInlastYear } from '../utils/filtrateDateFromData.js';
export default {
  components: {
    Chart,
    Cards
  },
  filters: {
    stateTrim(value) {
      const state = {
        0: '离职',
        1: '在职'
      };
      return state[value];
    }
  },
  data() {
    return {
      cardList: [
        {
          num: '--',
          name: '本周任务',
          icon: '**'
        },
        {
          num: '--',
          name: '本周任务',
          icon: '**'
        },
        {
          num: '--',
          name: '本周任务',
          icon: '**'
        },
        {
          num: '--',
          name: '本周任务',
          icon: '**'
        }
      ],

      // sourceData
      sourceData: {},

      // 过去一年项目情况信息
      proStatusInThePastYear: {},

      // 过去一年人员情况信息
      PerSituationInThePastYear: {},

      // 过去一年的月任务数量信息
      monMissionsNumOverThePastYear: {},

      // 本月周任务数量
      weeklyTaskNumThisMon: {},

      // 本年周任务数量
      weeklyTaskNumThisYear: {},
      xAxisOfTaskListOfThisYear: [],
      loadingOfTask: false,
      loadingOfProject: false,
      loadingOfProjectInCurrentMonth: false,
      loadingOfTasksInThisYear: false,
      loadingOfUserInLastYear: false,

      // onJobPeople
      onJobPeople: []
    };
  },

  // 初始化 echarts 配置
  async created() {
    this.proStatusInThePastYear = this.getOptions({
      titleText: '过去一年项目情况',
      data: [0]
    });
    this.PerSituationInThePastYear = this.getOptions({
      titleText: '过去一年人员情况',
      data: [0]
    });
    this.monMissionsNumOverThePastYear = this.getOptions({
      titleText: '过去一年的月任务数量',
      data: [0]
    });
    this.weeklyTaskNumThisMon = this.getOptions({
      titleText: '本月周任务数量',
      data: [0]
    });
    this.weeklyTaskNumThisYear = this.getOptions({
      titleText: '今年周任务数量',
      data: [0],
      type: 'line'
    });
    // this.$store.dispatch('asyncGetTasks');
    try {
      await this.getStoreState();
      this.initCardInfo();
    } catch (error) {
      this.$message({
        message: '老铁，你这网络不行啊！等网络好了再来吧',
        type: 'error',
        duration: 5000
      });
    };
    this.getLastYearProjectsOfMonth();
    this.getLastYearTasksOfMonth();
    this.getWeekTasksOfCurrentMonth();
    this.getWeekTasksOfThisYear();
    this.getUsersInlastYear();
  },
  methods: {
    getOptions(
      {
        name = '',
        titleText,
        type = 'bar',
        color, data,
        xAxis = {
          type: 'category'
        },
        yAxis = {
          splitLine: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            formatter: function() {
              return '';
            }
          }
        },
        graphic = {}
      }
    ) {
      return {
        title: {
          show: true,
          text: titleText,
          textStyle: {
            fontStyle: 'normal',
            fontSize: 14
          },
          left: 'center'
          // bottom: -10
        },
        legend: {
          show: false
        },
        tooltip: {
          show: true,
          trigger: 'axis'
          // formatter: function(param) {
          //   return `<div>${param.value}</div>`;
          // }
        },
        xAxis,
        yAxis,
        series: [{
          name: name,
          data: data,
          type: type,
          itemStyle: {
            normal: {
              color: color,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          smooth: true
        }]
      };
    },

    // 初始化卡片
    initCardInfo() {
      // 在职员工
      const onJob = this.sourceData.users.data.filter((item) => {
        return item.state === 1;
      });
      const resTask = this.sourceData.tasks;
      const Task = resTask.data;
      const resProject = this.sourceData.projects;
      const project = resProject.data;
      this.cardList = [
        {
          num: getCurrentWeekTaskNum(this.sourceData.tasks),
          name: '本周任务',
          icon: 'fa-calendar-minus-o',
          color: '#c72d1a'

        },
        {
          num: Task.length,
          name: '历史任务',
          icon: 'fa-tasks',
          color: '#c47d0c'

        },
        {
          num: project.length,
          name: '项目',
          icon: 'fa-align-center',
          color: '#0484c7'

        },
        {
          num: onJob.length,
          name: '在职人数',
          icon: 'fa-user-plus',
          color: '#089e9c'
        }
      ];
    },

    // 获取任务数据
    async getTasks() {
      this.loadingOfTask = true;
      this.loadingOfProjectInCurrentMonth = true;
      this.loadingOfTasksInThisYear = true;
      this.loadingOfProject = true;
      this.loadingOfUserInLastYear = true;
      const url = REQUEST_URL.TASK_GETTOTALTASH;
      this.sourceData.tasks = await this.$http.getRequest(url);
      this.$store.commit('setTasks', this.sourceData.tasks);
    },

    // 获取项目数据
    async getProjects() {
      this.loadingOfProject = true;
      const url = REQUEST_URL.PROJECT_GETTOTALPROJECT;
      this.sourceData.projects = await this.$http.getRequest(url);
      console.log(this.sourceData.projects);
      this.$store.commit('setProject', this.sourceData.projects);
    },

    // 获取人员数据
    async getUser() {
      this.loadingOfUserInLastYear = true;
      const url = REQUEST_URL.USER_GETTOTALUSER;
      this.sourceData.users = await this.$http.getRequest(url);
      this.$store.commit('setUsers', this.sourceData.users);
    },

    // 读取state数据
    async getStoreState() {
      this.sourceData.tasks = this.$store.getters.getTasks;
      this.sourceData.projects = this.$store.getters.getProjects;
      this.sourceData.users = this.$store.getters.getUsers;
      if (this.sourceData.tasks.length === 0) {
        await this.getTasks();
      };
      if (this.sourceData.projects.length === 0) {
        await this.getProjects();
      };
      if (this.sourceData.users.length === 0) {
        await this.getUser();
      };
      this.onJobPeople = this.sourceData.users.data.filter(user => {
        return user.state === 1;
      });
    },

    // 获取过去一年任务情况
    getLastYearTasksOfMonth() {
      const res = this.sourceData.tasks;
      if (res.retCode === 200) {
        const { data } = res;
        const { taskListOfMonth, taskListOfMonthX } = filtrateDateFromTasks(data);
        this.monMissionsNumOverThePastYear = this.getOptions({
          name: '任务数量',
          titleText: '过去一年的月任务数量',
          color: '#11659a',
          data: taskListOfMonth,
          xAxis: {
            type: 'category',
            data: taskListOfMonthX,
            axisTick: {
              show: false
            },
            axisLabel: {
              interval: 3,
              align: 'right'
            }
          }
        });
      } else {
        this.$message({
          message: '获取任务数据失败',
          type: 'error',
          duration: 1000
        });
      }
      this.loadingOfTask = false;
    },

    getLastYearProjectsOfMonth() {
      const res = this.sourceData.projects;
      if (res.retCode === 200) {
        const { data } = res;
        const { projectListOfMonth, projectListOfMonthX } = filtrateDateFromProjects(data);
        this.proStatusInThePastYear = this.getOptions({
          name: '项目数量',
          titleText: '过去一年项目情况',
          color: 'rgb(243, 229, 106)',
          data: projectListOfMonth,
          xAxis: {
            type: 'category',
            data: projectListOfMonthX,
            axisTick: {
              show: false
            },
            axisLabel: {
              align: 'right'
            }
          }
        });
      } else {
        this.$message({
          message: '获取项目数据失败',
          type: 'error',
          duration: 1000
        });
      }
      this.loadingOfProject = false;
    },

    getWeekTasksOfCurrentMonth() {
      const res = this.sourceData.tasks;
      if (res.retCode === 200) {
        const { data } = res;
        const projectListOfCurrentMonth = filtrateDateFromTasksInCurrentMonth(data);
        const projectListOfCurrentMonthX = (new Array(projectListOfCurrentMonth.length)).fill('').map((item, index) => {
          return `第${index + 1}周`;
        });
        this.weeklyTaskNumThisMon = this.getOptions({
          name: '任务数量',
          titleText: '本月周任务数量',
          color: '#3170a7',
          data: projectListOfCurrentMonth,
          xAxis: {
            type: 'category',
            data: projectListOfCurrentMonthX,
            axisTick: {
              show: false
            },
            axisLabel: {
              align: 'center'
            }
          }
        });
      } else {
        this.$message({
          message: '获取项目数据失败',
          type: 'error',
          duration: 1000
        });
      }
      this.loadingOfProjectInCurrentMonth = false;
    },
    getWeekTasksOfThisYear() {
      const res = this.sourceData.tasks;
      if (res.retCode === 200) {
        const { data } = res;
        const taskListOfThisYear = weekTasksInThisYear(data);
        this.xAxisOfTaskListOfThisYear = (new Array(taskListOfThisYear.length)).fill('').map((item, index) => {
          return `第${index + 1}周`;
        });
        this.weeklyTaskNumThisYear = this.getOptions({
          name: '项目数量',
          titleText: '今年周任务数量',
          color: '#c72d1a',
          data: taskListOfThisYear,
          type: 'line',
          xAxis: {
            type: 'category',
            data: this.xAxisOfTaskListOfThisYear,
            axisTick: {
              show: false
            },
            axisLabel: {
              align: 'center'
            }
          },
          graphic: [{
            type: 'group',
            left: '10%',
            top: 'center',
            children: [
              {
                type: 'rect',
                z: 100,
                left: 'center',
                top: 'middle',
                shape: {
                  width: 190,
                  height: 90
                },
                style: {
                  fill: '#fff',
                  stroke: '#555',
                  lineWidth: 2,
                  shadowBlur: 8,
                  shadowOffsetX: 3,
                  shadowOffsetY: 3,
                  shadowColor: 'rgba(0,0,0,0.3)'
                }
              },
              {
                type: 'text',
                z: 100,
                left: 'center',
                top: 'middle',
                style: {
                  fill: '#333',
                  text: [
                    '横轴表示温度，单位是°C',
                    '纵轴表示高度，单位是km',
                    '右上角有一个图片做的水印',
                    '这个文本块可以放在图中各',
                    '种位置'
                  ].join('\n'),
                  font: '14px Microsoft YaHei'
                }
              }
            ]
          }]
        });
      } else {
        this.$message({
          message: '获取任务数据失败',
          type: 'error',
          duration: 1000
        });
      }
      this.loadingOfTasksInThisYear = false;
    },

    // 获取过去一年人员变动情况
    getUsersInlastYear() {
      const res = this.sourceData.users;
      if (res.retCode === 200) {
        const { data } = res;
        const { onJob, obJobX } = getOnJobOfMonthInlastYear(data);
        this.PerSituationInThePastYear = this.getOptions({
          name: '在职人数',
          titleText: '过去一年人员情况',
          color: '#089e9c',
          data: onJob,
          xAxis: {
            type: 'category',
            data: obJobX,
            axisTick: {
              show: false
            },
            axisLabel: {
              align: 'center'
            }
          }
        });
      } else {
        this.$message({
          message: '获取人员数据失败',
          type: 'error',
          duration: 1000
        });
      }
      this.loadingOfUserInLastYear = false;
    },

    // 获取随机颜色
    getColor() {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `color:rgb(${r}, ${g}, ${b})`;
    }
  }
};
</script>
<style lang="scss" scoped>
.chart {
   margin: 15px 0 0 0 !important;
  .account-item {
    margin-bottom: 15px;
    background: #fff;
    .box-card {
      .item {
        padding: 0 20px;
        height: 50px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        >p {
          flex: 0 0 100px;
          text-align: center;
        }
      }
    }
  }
  .people {
    padding: 10px 0;
    height: 260px;
    overflow: auto;
  }
}
/deep/.el-row{
  margin-top: 15px;
}

/deep/.el-avatar {
  background-color: #FFF!important;
  box-shadow: 0 0 5px #bbb;
}
/deep/.card-item {
  border-radius: 4px;
}
</style>

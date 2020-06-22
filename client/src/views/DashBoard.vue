<template>
  <div>
    <cards :cardList="cardList"></cards>
    <el-row class="chart" :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        class="account-item">
        <chart v-loading="loadingOfProject" :options="proStatusInThePastYear" domName="one"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        class="account-item">
        <chart :options="PerSituationInThePastYear" domName="two"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        class="account-item">
        <chart v-loading="loadingOfTask" :options="monMissionsNumOverThePastYear" domName="three"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        class="account-item">
        <chart v-loading="loadingOfProjectInCurrentMonth" :options="weeklyTaskNumThisMon" domName="four"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="24"
        class="account-item">
        <chart v-loading="loadingOfTasksInThisYear" :options="weeklyTaskNumThisYear" domName="four"></chart>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Chart from '../components/Chart.vue';
import Cards from '../components/Cards.vue';
import { filtrateDateFromTasks, filtrateDateFromProjects, filtrateDateFromTasksInCurrentMonth, weekTasksInThisYear, getCurrentWeekTaskNum } from '../utils/filtrateDateFromData.js';
export default {
  components: {
    Chart,
    Cards
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
      loadingOfTask: false,
      loadingOfProject: false,
      loadingOfProjectInCurrentMonth: false,
      loadingOfTasksInThisYear: false
    };
  },
  async created() {
    this.proStatusInThePastYear = this.getOptions({
      titleText: '过去一年项目情况',
      color: '#4e7ca1',
      data: [0]
    });
    this.PerSituationInThePastYear = this.getOptions({
      titleText: '过去一年人员情况',
      color: '#346c9c',
      data: [0]
    });
    this.monMissionsNumOverThePastYear = this.getOptions({
      titleText: '过去一年的月任务数量',
      color: '#11659a',
      data: [0]
    });
    this.weeklyTaskNumThisMon = this.getOptions({
      titleText: '本月周任务数量',
      color: '#3170a7',
      data: [0]
    });
    this.weeklyTaskNumThisYear = this.getOptions({
      titleText: '今年周任务数量',
      color: '#142334',
      data: [0],
      type: 'line'
    });
    await this.getTasks();
    await this.getProjects();
    this.getLastYearProjectsOfMonth();
    this.getLastYearTasksOfMonth();
    this.getWeekTasksOfCurrentMonth();
    this.getWeekTasksOfThisYear();
    this.initCardInfo();
  },
  methods: {
    getOptions({ titleText, type = 'bar', color, data }) {
      return {
        title: {
          show: true,
          text: titleText,
          textStyle: {
            fontStyle: 'normal',
            fontSize: 14
          },
          left: 'center',
          bottom: -4
        },
        tooltip: {
          // show: true,
          // trigger: 'axis',
          formatter: function(param) {
            return `<div>${param.value}</div>`;
          }
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
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
        series: [{
          data: data,
          type: type,
          itemStyle: {
            normal: {
              color: color,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    },

    // 初始化卡片
    async initCardInfo() {
      // 在职员工
      const url = '/user/getTotalUser';
      const resUser = await this.$http.getRequest(url);
      const onJob = resUser.data.filter((item) => {
        return item.state === 1;
      });
      const resTask = this.sourceData.tasks;
      const Task = resTask.data;
      const resProject = this.sourceData.projects;
      const project = resProject.data;
      console.log(this.sourceData.tasks, this.sourceData.projects)
      this.cardList = [
        {
          num: await getCurrentWeekTaskNum(this.sourceData.tasks),
          name: '本周任务',
          icon: '**'
        },
        {
          num: Task.length,
          name: '历史任务',
          icon: '**'
        },
        {
          num: project.length,
          name: '项目',
          icon: '**'
        },
        {
          num: onJob.length,
          name: '在职人数',
          icon: '**'
        }
      ];
    },

    // 获取任务数据
    async getTasks() {
      this.loadingOfTask = true;
      this.loadingOfProjectInCurrentMonth = true;
      this.loadingOfTasksInThisYear = true;
      const url = '/task/getTotalTask';
      this.sourceData.tasks = await this.$http.getRequest(url);
    },

    // 获取项目数据
    async getProjects() {
      this.loadingOfProject = true;
      const url = '/project/getTotalProject';
      this.sourceData.projects = await this.$http.getRequest(url);
    },

    // 获取过去一年任务情况
    getLastYearTasksOfMonth() {
      const res = this.sourceData.tasks;
      if (res.retCode === 200) {
        const { data } = res;
        const taskListOfMonth = filtrateDateFromTasks(data);
        this.monMissionsNumOverThePastYear = this.getOptions({
          titleText: '过去一年的月任务数量',
          color: '#11659a',
          data: taskListOfMonth
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

    async getLastYearProjectsOfMonth() {
      const res = this.sourceData.projects;
      if (res.retCode === 200) {
        const { data } = res;
        const projectListOfMonth = filtrateDateFromProjects(data);
        this.proStatusInThePastYear = this.getOptions({
          titleText: '过去一年项目情况',
          color: '#4e7ca1',
          data: projectListOfMonth
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
        console.log(res)
        const { data } = res;
        const projectListOfCurrentMonth = filtrateDateFromTasksInCurrentMonth(data);
        this.weeklyTaskNumThisMon = this.getOptions({
          titleText: '本月周任务数量',
          color: '#3170a7',
          data: projectListOfCurrentMonth
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
        console.log(res)
        const { data } = res;
        const taskListOfThisYear = weekTasksInThisYear(data);
        console.log(taskListOfThisYear)
        this.weeklyTaskNumThisYear = this.getOptions({
          titleText: '今年周任务数量',
          color: '#142334',
          data: taskListOfThisYear,
          type: 'line'
        });
      } else {
        this.$message({
          message: '获取任务数据失败',
          type: 'error',
          duration: 1000
        });
      }
      this.loadingOfTasksInThisYear = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.chart {
  padding-right: 20px;
}
</style>

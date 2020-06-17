<template>
  <div>
    <cards :cardList="cardList"></cards>
    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        class="account-item">
        <chart :options="proStatusInThePastYear" domName="one"></chart>
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
        <chart :options="monMissionsNumOverThePastYear" domName="three"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        class="account-item">
        <chart :options="weeklyTaskNumThisMon" domName="four"></chart>
      </el-col>
      <el-col
        :xs="24"
        :sm="24"
        class="account-item">
        <chart :options="weeklyTaskNumThisYear" domName="four"></chart>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Chart from '../components/Chart.vue';
import Cards from '../components/Cards.vue';
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

      // 过去一年项目情况信息
      proStatusInThePastYear: {},

      // 过去一年人员情况信息
      PerSituationInThePastYear: {},

      // 过去一年的月任务数量信息
      monMissionsNumOverThePastYear: {},

      // 本月周任务数量
      weeklyTaskNumThisMon: {},

      // 本年周任务数量
      weeklyTaskNumThisYear: {}
    };
  },
  created() {
    this.proStatusInThePastYear = this.getOptions({
      titleText: '过去一年项目情况',
      color: '#bf3553',
      data: [5, 15, 4, 2, 6, 3, 2, 1, 1, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    this.PerSituationInThePastYear = this.getOptions({
      titleText: '过去一年人员情况',
      color: '#bf3553',
      data: [2, 8, 8, 8, 8, 8, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
    });
    this.monMissionsNumOverThePastYear = this.getOptions({
      titleText: '过去一年的月任务数量',
      color: '#bf3553',
      data: [329, 449, 680, 468, 430, 469, 552, 232, 263, 502, 376, 397, 350, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    this.weeklyTaskNumThisMon = this.getOptions({
      titleText: '本月周任务数量',
      color: '#bf3553',
      data: [0, 135, 130, 83, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    this.weeklyTaskNumThisYear = this.getOptions({
      titleText: '今年周任务数量',
      color: '#bf3553',
      data: [0, 0, 109, 121, 0, 0, 0, 0, 165, 93, 93, 103, 97, 105, 101, 79, 90, 104, 99, 87, 101, 100, 106, 135, 130, 83, 0],
      type: 'line'
    });
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
      const res = await this.$http.getRequest(url);
      const onJob = res.data.filter((item) => {
        return item.state === 1;
      });
      this.cardList = [
        {
          num: 98,
          name: '本周任务',
          icon: '**'
        },
        {
          num: 98,
          name: '本周任务',
          icon: '**'
        },
        {
          num: 98,
          name: '本周任务',
          icon: '**'
        },
        {
          num: onJob.length,
          name: '在职人数',
          icon: '**'
        }
      ];
    }
  }
};
</script>
<style lang="scss" scoped>

</style>

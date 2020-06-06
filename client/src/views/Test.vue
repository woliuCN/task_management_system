<template>
  <div class="account">
    <el-row :gutter="20">
      <el-col :span="12" class="account-item">
        <chart :options="options" domName="one"></chart>
      </el-col>
      <el-col :span="12" class="account-item">
        <chart :options="options" domName="one"></chart>
      </el-col>
      <el-col :span="12" class="account-item">
        <chart :options="options" domName="one"></chart>
      </el-col>
      <el-col :span="12" class="account-item">
        <chart :options="options" minHeight="400px" domName="one"></chart>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Chart from '../components/Chart.vue';
export default {
  name: 'Test',
  components: {
    Chart
  },
  data() {
    return {
      options: {}
    }
  },
  created() {
    this.getOptions();
  },
  mounted() {
    window.$op = this.options1
  },
  methods: {
    getOptions() {
      this.options = {
        title: {
          show: true,
          text: '过去一年项目情况',
          textStyle: {
            // color: 'pick',
            fontStyle: 'solid',
            fontSize: 20
          },
          left: 'center',
          bottom: 0
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
          data: [120, 200, 150, 80, 70, 110, 130, 0, 0, 0, 0, 0, 0],
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#2486b9',
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    }
  }
}
</script>

<style scoped lang="scss">
.account {
  width: 100%;
  height: 100%;
  // .account-item {
  //   height: 200px;
  // }
}
</style>

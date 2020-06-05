<template>
  <div id="echarts" :ref="domName"></div>
</template>

<script>
const echarts = require('echarts');
export default {
  name: 'Chart',
  props: {
    domName: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      chart: null,
      defaultOptions: {
        title: {},
        grid: {
          left: 30,
          right: 0,
          top: 10,
          bottom: 20
        },
        tooltip: {
          formatter: function(param) {
            return `<div>${param.value}</div>`;
          }
        },
        legend: {},
        xAxis: {},
        yAxis: {
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        series: [{
          type: 'bar',
          data: []
        }]
      }
    }
  },
  watch: {
    options: {
      handler(options) {
        this.setOptions();
      },
      deep: true
    }
  },
  mounted() {
    this.initEcharts();
  },
  beforeDestroy() {
    window.onreset = null;
  },
  methods: {
    initEcharts() {
      this.chart = echarts.init(this.$refs[this.domName]);
      this.setOptions();
      this.addEventListenerResizeECharts();
    },
    setOptions() {
      Object.assign(this.defaultOptions, this.options)
      this.chart.setOption(this.defaultOptions);
    },
    addEventListenerResizeECharts() {
      window.addEventListener('resize', () => {
        this.chart.resize();
      })
    }
  }
}
</script>

<style>
#echarts {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div>
    <div
      id="echarts"
      :ref="domName"
      :style="{minHeight: minHeight}"
      v-show="hasData"
    ></div>
    <div class="not-data" v-show="!hasData">当前暂无数据</div>
  </div>
</template>

<script>
const echarts = require('echarts');
export default {
  name: 'Chart',
  props: {
    // 表示初始化ECharts的dom
    domName: {
      type: String,
      required: true
    },
    // 图表配置信息
    options: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // 图表高度
    minHeight: {
      type: String,
      default: '200px'
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
          data: [],
          itemStyle: {
            normal: {
              color: '#2486b9',
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      },
      hasData: false,
      firstLoad: true
    };
  },
  watch: {
    options: {
      handler(options) {
        if (options.series.some((serie) => { return serie.data.length > 0 })) {
          if (this.firstLoad) {
            this.initOptions();
            this.firstLoad = false;
          } else {
            console.log(this.firstLoad, options);
            this.setOptions();
          }
          this.hasData = true;
        } else {
          this.hasData = false;
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.initEcharts();
  },
  destroyed() {
    this.removeEventListenerResizeECharts();
  },
  methods: {
    // 初始化ECharts
    initEcharts() {
      this.chart = echarts.init(this.$refs[this.domName]);
      this.setOptions();
      this.addEventListenerResizeECharts();
    },

    // 初始化options
    initOptions() {
      Object.assign(this.defaultOptions, this.options);
    },

    // 配置图表信息
    setOptions() {
      this.chart.setOption(this.defaultOptions, true);
    },

    // 图表大小重置
    ResizeECharts() {
      this.chart.resize();
    },

    // 监听页面大小变化，重置图表大小
    addEventListenerResizeECharts() {
      window.addEventListener('resize', this.ResizeECharts);
    },

    // 移除resize事件监听
    removeEventListenerResizeECharts() {
      window.removeEventListener('resize', this.ResizeECharts);
    }
  }
}
</script>

<style>
#echarts, .not-data {
  width: 100%;
  height: 200px;
}
.not-data {
  text-align: center;
  line-height: 200px;
}
</style>

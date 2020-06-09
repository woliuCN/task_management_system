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
    <cards :cardList="cardList"></cards>
    <el-button @click="()=>{isShowDialog=!isShowDialog}">切换</el-button>
    <my-dialog
      :visible.sync="isShowDialog"
      :titleName="titleName"
      :tableData="infoList"
      @success="success"
    ></my-dialog>
  </div>
</template>

<script>
import Chart from '../components/Chart.vue';
import Cards from '../components/Cards.vue';
import MyDialog from '../components/MyDialog.vue';
export default {
  name: 'Test',
  components: {
    Chart,
    Cards,
    MyDialog
  },
  data() {
    return {
      options: {},
      cardList: [
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
          num: 98,
          name: '本周任务',
          icon: '**'
        }
      ],
      infoList: [
        {
          label: '名称',
          type: 'input',
          value: '',
          rules: { required: true, message: '请输入名称', trigger: 'blur' }
        },
        {
          label: '选择项目',
          type: 'select',
          options: ['视频汇聚平台'],
          value: '',
          rules: { required: true, message: '请选择项目', trigger: 'blur' }
        },
        {
          label: '选择分组',
          type: 'select',
          options: ['yy_group'],
          value: ''
        },
        {
          label: '选择人员',
          type: 'select',
          options: ['罗淋铭'],
          value: '罗淋铭'
        },
        {
          label: '计划日期',
          type: 'date',
          value: [new Date(), new Date()]
        },
        {
          label: '完成',
          type: 'checkbox',
          value: false
        },
        {
          label: '工时',
          type: 'input',
          value: 8
        },
        {
          label: '备注',
          type: 'select',
          options: ['计划任务', '新增任务'],
          value: '计划任务'
        }
      ],
      isShowDialog: false,
      titleName: '任务信息'
    };
  },
  created() {
    this.getOptions();
  },
  mounted() {
    window.$op = this.options1;
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
    },
    success(value) {
      console.log(value);
    }
  }
};
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

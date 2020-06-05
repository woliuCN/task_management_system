<template>
  <div class="about">
    <data-table
      :tableTitle="tableTitle"
      :tableData="tableData"
      :buttonList="buttonList"
      :isSelection="true"
    >
    </data-table>
  </div>
</template>

<script>
import DataTable from '../components/DataTable'

export default {
  components: {
    DataTable
  },
  data () {
    return {
      buttonList: [
        {
          type: 'danger',
          text: '删除',
          event: 'deletefn',
          size: 'mini'
        },
        {
          text: '查看',
          event: 'showfn',
          size: 'mini',
          icon: 'el-icon-search'
        }
      ],
      tableTitle: [
        { label: '日期', prop: 'date', id: '1', fixed: true, width: 200 },
        { label: '姓名', prop: 'name', id: '2', fixed: false },
        { label: '省份', prop: 'province', id: '3' },
        { label: '市区', prop: 'city', id: '4' },
        { label: '详细地址', prop: 'address', id: '5', width: 500 },
        { label: '邮编', prop: 'zip', id: '6' }
      ],
      tableData: [{
        date: '2016-05-03',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-02',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-04',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-01',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-08',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-06',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-07',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }]
    }
  },
  methods: {
    handlDelete (row) {
      console.log(row)
    }
  }
}
</script>

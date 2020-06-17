<template>
  <div>
    <el-dialog
      title="title"
      width="80%"
      :visible.sync="isShowDetail"
      :destroy-on-close=true
      @close="$emit('close-dialog')"
    >
      <data-table
        :tableTitle="tableTitle"
        :tableData="tableData"
        :isShowSearch="true"
        :pageIndex="pageIndex"
        :pageSize="pageSize"
        :total="total"
      >
      </data-table>
    </el-dialog>
  </div>
</template>

<script>
import DataTable from '../../../components/DataTable';
export default {
  components: {
    DataTable
  },
  props: {
    tableData: {
      type: Array,
      default() {
        return [];
      }
    },
    isShow: Boolean
  },
  data() {
    return {
      tableTitle: [
        { label: '开始时间', prop: '_startTime', fixed: true, width: 150 },
        { label: '任务编号', prop: 'taskId', width: 150 },
        { label: '任务名', prop: 'content', width: 250 },
        { label: '所属项目', prop: 'project.projectName', width: 200 },
        { label: '负责人', prop: 'belonger.userName' },
        { label: '状态', prop: '_state' },
        { label: '工时', prop: 'workingHours' }
      ],
      pageIndex: 0,
      pageSize: 8,
      total: 0,
      startTime: 0,
      endTime: 0,
      isShowDetail: false
    }
  },
  watch: {
    isShow(val) {
      this.isShowDetail = val;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>

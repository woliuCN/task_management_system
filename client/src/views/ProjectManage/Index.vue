<template>
  <div>
    <data-table
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :maxHeight="500"
      :isSelection="true"
      :isShowSearch="true"
    >

    </data-table>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
export default {
  components: {
    DataTable
  },
  data() {
    return {
      buttonList: [],
      tableTitle: [],
      tableData: []
    };
  },
  methods: {
    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
        // 数据导入按钮
        {
          text: '导入',
          event: 'import-data'
        },

        // 新增项目
        {
          text: '新增',
          event: 'add-project'
        },

        // 项目编辑按钮
        {
          // type: 'primary',
          text: '编辑',
          event: 'edit-project'
          // icon: 'el-icon-edit'
        },

        // 项目删除按钮
        {
          // type: 'danger',
          text: '删除',
          event: 'delete-project'
          // icon: 'el-icon-delete'
        }
      ];
    },

    // 获取列表信息
    getProjectData() {
      this.tableTitle = [
        { label: '项目名称', prop: 'projectName', fixed: true, width: 200 },
        { label: '状态', prop: 'state', width: 150 },
        { label: '创建时间', prop: 'createTime', width: 200 },
        { label: '修改时间', prop: 'updateTime', width: 200 },
        { label: '备注', prop: 'remarks', width: 200 }
      ];
    }
  },
  mounted() {
    this.initButtonList();
    this.getProjectData();
  }
};
</script>
<style lang="scss" scoped>

</style>

<template>
  <div>
    <data-table
      ref="data-table"
      :buttonList="buttonList"
      :tableTitle="tableTitle"
      :tableData="tableData"
      :pageIndex="pageIndex"
      :pageSize="pageSize"
      :total="total"
      @add-group="addGroup"
      @modification-group="modificationGroup"
      @delete-group="deleteGroup"
    >
    </data-table>
  </div>
</template>

<script>
import DataTable from '../components/DataTable';
export default {
  components: {
    DataTable
  },
  data() {
    return {
      // table抬头
      tableTitle: [
        { label: '名称', prop: 'name', width: 150 },
        { label: '状态', prop: 'status', width: 150 },
        { label: '创建时间', prop: 'startTime', width: 200 },
        { label: '修改时间', prop: 'modTime', width: 200 },
        { label: '备注', prop: 'belonger.userName', width: 200 }
      ],

      // table主体数据
      tableData: [],

      // table操作button
      buttonList: [],
      pageIndex: 0,
      pageSize: 8,
      total: 0
    };
  },
  mounted() {
    this.initButtonList();
  },
  methods: {
    // 初始化按钮列表
    initButtonList() {
      this.buttonList = [
        // 新增分组按钮
        {
          text: '添加',
          event: 'add-group'
        },

        // 修改分组按钮
        {
          text: '修改',
          event: 'modification-group'
        },

        // 删除分组按钮
        {
          text: '删除',
          event: 'delete-group'
        }
      ];
    },

    // 新增分组
    addGroup() {
      console.log('新增分组');
    },

    // 修改分组
    modificationGroup(rows) {
      console.log('修改分组', rows);
    },

    // 删除分组
    deleteGroup(rows) {
      console.log('删除分组', rows);
    }
  }
};
</script>
<style lang="scss" scoped>

</style>

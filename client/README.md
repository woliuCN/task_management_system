# 系统客户端

### 组件使用稳定
```
src/components/DataTable.vue
【功能】 用于系统内表单展示

【使用说明】
tableTitle(必填)：
    表单抬头，格式为[{prop, label, id, width, fixed}]。
    其中width和fixed为必填，prop必须与tableData对应。
    demo：tableTitle: [
            { label: '日期', prop: 'date', id: '1', fixed: true, width: 200 },
            { label: '姓名', prop: 'name', id: '2', fixed: false },
            { label: '省份', prop: 'province', id: '3' },
            { label: '市区', prop: 'city', id: '4' },
            { label: '详细地址', prop: 'address', id: '5', width: 500 },
            { label: '邮编', prop: 'zip', id: '6' }
         ]

tableData(必填)：
    表单数据，数据的键名必须与title中的prop对应，才能在相应的列中显示。
    demo：tableData: [
            {
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
            }
         ]

maxHeight(选填)：
    表单最大高度

isSelection(选填，默认false)：
    是否在表单左边显示多选按钮

buttonList(选填，默认[])：
    是否在表单上方自定义按钮组。
    按钮可自定义type（选填）、size（选填）、text（选填）、event（必填）。
    其中event为事件名，在组件内会通过$emit分发给父组件，所以在父组件中需要先做好事件处理来接收从本组件中分发出来的数据。
    demo：buttonList: [
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
         ]
```

<template>
  <el-row :gutter="10">
    <el-col
      v-for="(card, index) in cardList" :key="index"
      :xs="24"
      :sm="12"
      :lg="6"
    >
      <div
        class="card-item default-bgcolor"
        :style="{backgroundColor: bgColors[index]}"
      >
        <i
          class="el-icon-tickets card-icon"
          :icon="card.icon"
        ></i>
        <div class="card-info">
          <p class="card-info-num">{{card.num}}</p>
          <p class="card-info-name">{{card.name}}</p>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'Cards',
  props: {
    cardList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      bgColors: ['#2bae85', '#f6c430', '#b5aa90', '#f19790']
    }
  }

}
</script>

<style lang='scss' scoped>
.card-item {
  display: flex;
  align-items: center;
  height: 140px;
  margin: 20px;
  .card-icon {
    margin-left: 20px;
    margin-right: 20px;
    padding-right: 20px;
    font-size: 60px;
  }
  .card-info {
    display: flex;
    flex-direction: column;
    width: 200px;
    color: #FFF;
    .card-info-num {
      font-weight: bold;
      font-size: 34px;
    }
    .card-info-name {
      font-size: 14px;
    }
  }
}
.default-bgcolor {
  background-color: #22a2c3;
}
</style>

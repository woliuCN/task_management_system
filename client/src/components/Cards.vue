<template>
  <el-row :gutter="10">
    <el-col
      v-for="(card, index) in cardList" :key="index"
      :xs="24"
      :sm="12"
      :lg="6"
    >
      <div
        class="card-item"
      >
        <i
          class="fa card-icon"
          :class="card.icon"
          :style="{color:card.color}"
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
      bgColors: ['#304156', '#364088', '#304720', '#333566']
    };
  }

};
</script>

<style lang='scss' scoped>
.card-item {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #fff;
  height: 100px;
  .card-icon {
    font-size: 38px;
  }
  .card-info {
    display: flex;
    flex-direction: column;
    color: #333;
    .card-info-num {
      font-weight: bold;
      font-size: 22px;
    }
    .card-info-name {
      font-size: 14px;
    }
  }
}

</style>

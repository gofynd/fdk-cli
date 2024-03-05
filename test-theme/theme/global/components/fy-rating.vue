<template>
  <div class="rating">
    <div v-for="n in 5" :key="n" v-bind:class="getRatingStar(n)"></div>
  </div>
</template>

<script>
export default {
  name: "fdk-rating",
  props: {
    rating: {
      type: Number,
    },
  },
  methods: {
    getRatingStar: function(n) {
      let hasPartial = this.rating % 1;
      let d = {
        "fa-star": true,
      };
      if (n <= this.rating) {
        d["fa-star-checked"] = true;
      } else if (hasPartial && Math.round(this.rating) === n) {
        d["fa-star-half"] = true;
      }
      return d;
    },
  },
};
</script>

<style lang="less" scoped>
.rating {
  display: flex;
  align-items: center;
  .fa-star {
    width: 20px;
    height: 20px;
    margin-left: 0px;
    margin: 2px;
    content: url("../../assets/images/review-star.png");
    @media @tablet-screen {
      width: 15px;
      height: 15px;
    }
  }
  .fa-star-checked {
    content: url("../../assets/images/review-star-checked.png");
  }
  .fa-star-half {
    content: url("../../assets/images/review-star-half.png");
  }
}
</style>

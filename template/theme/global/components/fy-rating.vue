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
  data: function data() {
    return {};
  },
  mounted() {},
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
    content: url("https://hdn-1.fynd.com/company/884/applications/000000000000000000000001/theme/pictures/free/original/theme-image-1627554013146.png");
    @media @tablet-screen {
      width: 15px;
      height: 15px;
    }
  }
  .fa-star-checked {
    content: url("https://hdn-1.fynd.com/company/884/applications/000000000000000000000004/theme/pictures/free/original/theme-image-1598083110649.png");
  }
  .fa-star-half {
    content: url("https://hdn-1.fynd.com/company/884/applications/000000000000000000000004/theme/pictures/free/original/theme-image-1598083162278.png");
  }
}
</style>

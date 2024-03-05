<template>
  <router-link :to="attrs.link">
    <div class="list">
      <div class="icons">
        <svg-wrapper :svg_src="attrs.iconClass"></svg-wrapper>
      </div>
      <div class="offer">
        <div class="desc bold-sm">{{ attrs.title }}</div>
        <div
          class="sub-desc regular-xxxs"
          v-bind:class="{ couponapplied: attrs.hasCancel }"
        >
          {{ attrs.subtitle }}
        </div>
      </div>
      <div class="icons" @click="clickIcon" v-if="!onReview">
        <svg-wrapper :svg_src="getIcon"></svg-wrapper>
      </div>
    </div>
  </router-link>
</template>

<style lang="less" scoped>
.list {
  display: flex;
  cursor: pointer;
  padding: 5px 10px;
  border-bottom: 1px solid @LightGray;
  .icons {
    .flex-center();
    padding: 10px;
  }
  .offer {
    display: block;
    width: 100%;
    color: @Mako;
    padding: 10px;
    .desc {
      /*text-transform: uppercase;*/
    }
    .sub-desc {
      margin-top: 5px;
    }
    .couponapplied {
      color: @Profit;
    }
  }
  &:hover {
    background-color: @LightGray;
  }
}
</style>

<script>
import SvgWrapper from './../../../components/common/svg-wrapper.vue';
export default {
  name: "cart-coupons",
  props: {
    attrs: {},
    onReview: {},
  },
  components: {
    "svg-wrapper": SvgWrapper
  },
  computed: {
    getIcon() {
      if (this.attrs.hasCancel) {
        return "red_cross";
      }
      return "arrow-right-black";
    },
  },
  methods: {
    clickIcon(event) {
      if (!this.attrs.hasCancel) {
        this.$router.push(this.attrs.link);
      }
      if (this.attrs.hasCancel) {
        this.$emit("remove-coupon");
      }
      event.stopPropagation();
      event.preventDefault();
    },
  },
};
</script>

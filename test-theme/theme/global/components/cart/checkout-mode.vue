<template>
  <fdk-cart>
    <template slot-scope="carts">
      <div @click="onClick(carts)" class="main regular-xxs">
        <div>
          <svg-wrapper
            :svg_src="
              context.checkout_mode === 'other'
                ? 'check-box-selected'
                : 'regular'
            "
          ></svg-wrapper>
        </div>
        <div class="message">Placing order on behalf of Customer</div>
      </div>
    </template>
  </fdk-cart>
</template>

<script>
import SvgWrapper from './../../../components/common/svg-wrapper.vue';
export default {
  name: "checkout-mode",
  components: {
    "svg-wrapper": SvgWrapper
  },
  props: {
    context: {
      type: Object,
    },
  },
  watch: {
    context(newValue) {
      this.context = newValue;
    },
  },
  methods: {
    onClick(cartFn) {
      let updateCheckoutMode = {
        checkout_mode: this.context.checkout_mode === "self" ? "other" : "self",
      };
      cartFn.updateCheckoutMode(updateCheckoutMode, this.context.bag_data.id);
    },
  },
};
</script>

<style lang="less" scoped>
.main {
  display: flex;
  padding: 5px;
  color: @Mako;
  text-align: center;
  margin: 10px;
  cursor: pointer;
  .message {
    margin: 5px 3px 3px 4px;
  }
}
</style>

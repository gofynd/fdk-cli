<template>
  <fdk-cart>
    <template slot-scope="carts">
      <div @click="onClick(carts)" class="main regular-xxs">
        <div>
          <fdk-inline-svg
            :src="
              context.checkout_mode === 'other'
                ? 'check-box-selected'
                : 'regular'
            "
          ></fdk-inline-svg>
        </div>
        <div class="message">Placing order on behalf of Customer</div>
      </div>
    </template>
  </fdk-cart>
</template>

<script>
export default {
  name: "checkout-mode",
  components: {},
  computed: {},
  props: {
    context: {
      type: Object,
    },
  },
  data() {
    return {};
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

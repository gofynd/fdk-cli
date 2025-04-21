<template>
  <div
    class="container"
    :style="global_config ? 'color:' + global_config.props.text_body_color : ''"
  >
    <div class="compare-header">Compare</div>
    <jm-compare
      :compared_products="context.compared_products"
      :compare_slugs="context.compare_slugs"
      :global_config="global_config"
    ></jm-compare>
  </div>
</template>

<script>
import jmCompareVue from "./../../global/components/jm-compare.vue";
export default {
  data: function data() {
    return {};
  },
  components: {
    "jm-compare": jmCompareVue,
  },
  props: ["global_config"],
};
</script>

<style lang="less" scoped>
.compare-header {
  background: #f8f8f8;
  color: #000000;
  // text-align: center;
  padding: 20px 15px;
  font-weight: bold;
  font-size: 25px;
}
</style>

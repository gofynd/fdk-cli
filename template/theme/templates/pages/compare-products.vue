<template>
  <div class="container">
    <div class="compare-header">Compare</div>
    <compare
      :context="context.compared_products"
      :compare_slugs="context.compare_slugs"
    ></compare>
  </div>
</template>

<script>
import compareVue from "./../../global/components/compare.vue";
export default {
  data: function data() {
    return {};
  },
  components: {
    compare: compareVue,
  },
  props: {
    context: {
      type: Object,
    },
  },
  methods: {
    exampleMethod: function exampleMethod() {
      alert("Hello");
    },
  },
};
</script>

<style lang="less" scoped>
.compare-header {
  background: #eeeeee;
  color: @ds-black;
  text-align: center;
  padding: 20px 15px;
  font-weight: bold;
}
</style>

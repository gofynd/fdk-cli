<template>
  <div class="errorPage">
    <svg-wrapper :svg_src="'search_empty'" alt="Error "></svg-wrapper>
    <div>{{ title }}</div>
  </div>
</template>

<style lang="less" scoped>
.errorPage {
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  color: "#f4f4f4";
  padding: 8%;
  position: absolute;
  & > img {
    width: 100%;
  }
}
</style>

<script>
import SvgWrapper from './../../components/common/svg-wrapper.vue';
export default {
  name: "fy-not-found",
  props: {
    title: {
      type: String
    }
  },
  components: {
    "svg-wrapper": SvgWrapper
  }
};
</script>

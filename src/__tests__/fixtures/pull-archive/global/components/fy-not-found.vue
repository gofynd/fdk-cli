<template>
  <div class="errorPage">
    <fdk-inline-svg :src="'search_empty'" alt="Error "></fdk-inline-svg>
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
export default {
  name: "fy-not-found",
  props: {
    title: {
      type: String
    }
  }
};
</script>

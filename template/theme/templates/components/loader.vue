<template>
  <div class="container">
    <div class="loader">
      <img src="../../assets/images/loader.gif" alt="" />
    </div>
  </div>
</template>

<script>
export default {
  data: function data() {
    return {
      text: "Loading...",
    };
  },
  methods: {
    exampleMethod: function exampleMethod() {
      alert("Hello");
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  z-index: 999;
  .loader {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

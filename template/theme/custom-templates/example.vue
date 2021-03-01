<template>
  <div class="container">
    {{ text }}
    <button @click="exampleMethod">Click me</button>
  </div>
</template>

<script>
export default {
  data: function data() {
    return {
      text: "Hello"
    };
  },
  methods: {
    exampleMethod: function exampleMethod() {
      alert("Hello");
    }
  },
  computed: {},
  mounted: function mounted() {
    console.log("Component Mounted");
  },
  destroyed: function destroyed() {
    console.log("Component Destroyed");
  }
};
</script>

<style lang="less" scoped></style>

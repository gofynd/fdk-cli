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
      text: "Hello",
    };
  },
  methods: {
    exampleMethod() {
      alert("Hello");
    },
  },
};
</script>

<style lang="less" scoped></style>

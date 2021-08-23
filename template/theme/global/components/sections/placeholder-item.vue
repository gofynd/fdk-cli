<template>
  <div class="placeholder-item">
    <div class="item__image">
      <fdk-placeholder :type="type" />
      <div class="overlay">&nbsp;</div>
    </div>

    <p class="item__name">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: "placeholder-item",

  props: {
    type: {
      type: String,
    },
    text: {
      type: String,
    },
  },
};
</script>

<style lang="less" scoped>
.placeholder-item {
  position: relative;
  cursor: pointer;

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 99.5%;
    background-color: black;
    opacity: 0.3;
    &:hover {
      opacity: 0.7;
    }
  }
  .item__name {
    top: 50%;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 20px;
    width: 100%;
    text-align: center;
    @media @mobile {
      font-size: 16px;
    }
  }
}
</style>

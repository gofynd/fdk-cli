<template>
  <button
    @click="$emit('click')"
    v-bind:style="{
      'background-color': getBackgroundColor(),
      'color': getColor(),
      'border': getBorder()
    }"
    type="button"
    class="tur-btn"
  >
    <slot>Submit</slot>
  </button>
</template>

<script>
export default {
  data: function data() {
    return {};
  },
  props: {
    context: {
      type: Object
    },
    colortype: {
      type: String
    },
    bordertype: {
      type: String
    },
    backgroundcolortype: {
      type: String
    }
  },
  methods: {
    getBackgroundColor() {
      if (this.backgroundcolortype == "primary") {
        return "black";
      }
      if (this.backgroundcolortype == "secondary") {
        return "black";
      }
      if (this.backgroundcolortype == "tertiary") {
        return "#ffffff";
      }
      return "black";
    },

    getColor() {
      if (this.colortype == "tertiary") {
        return "#F38E4D";
      }
      if (this.colortype == "secondary") {
        return "#383838";
      }
      return "#ffffff";
    },
    getBorder() {
      if (this.bordertype == "tertiary") {
        return "1px solid #F38E4D";
      }
      if (this.bordertype == "secondary") {
        return "1px solid #CECECE";
      }
      return "none";
    }
  },
  computed: {},
  mounted: function mounted() {},
  destroyed: function destroyed() {}
};
</script>

<style lang="less" scoped>
@background-color: black;
@tablet-screen: ~"(max-width: 1280px)";
@disabled-background-color: #eaeaea;
@font-color: #ffffff;

.tur-btn {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: none;
  background-color: @background-color;
  font-size: 16px;
  color: @font-color;
  cursor: pointer;
  padding: 10px;
  @media @tablet-screen {
    font-size: 16px;
  }
}

.tur-btn[disabled] {
  background-color: @disabled-background-color !important;
  color: #333333 !important;
}
</style>

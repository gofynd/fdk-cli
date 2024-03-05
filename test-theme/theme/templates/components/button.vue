<template>
  <button
    @click="$emit('click')"
    :class="type"
    type="button"
    class="common-button button"
    :disabled="disabled"
  >
    <slot>{{ type }}</slot>
  </button>
</template>

<script>
export default {
  props: {
    context: {
      type: Object,
    },
    type: {
      type: String,
      validator: (prop) => ["primary", "secondary"].includes(prop),
      default: "primary",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getBackgroundColor() {
      if (this.type == "primary") {
        return "black";
      }
      if (this.backgroundcolortype == "secondary") {
        return "#ffffff";
      }
      return "black";
    },

    getColor() {
      if (this.type == "secondary") {
        return "#000";
      }
      return "#ffffff";
    },
    getBorder() {
      if (this.type == "secondary") {
        return "1px solid #000";
      }
      return "none";
    },
  },
};
</script>

<style lang="less" scoped>
@tablet-screen: ~"(max-width: 1280px)";
@disabled-background-color: #808080;

.common-button {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  font-size: 16px;
  cursor: pointer;
  padding: 10px;
  @media @tablet-screen {
    font-size: 16px;
  }
  border: none;
  transition: all 0.4s ease;
}
.primary {
  background-color: #000;
  border: 1px solid #000;
  color: #fff;
  &:hover {
    background-color: #fff;
    color: #000;
  }
}

.secondary {
  background-color: #fff;
  color: #000;
  border: 1px solid #000;
  &:hover {
    background-color: #000;
    color: #fff;
  }
}
button.common-button[disabled] {
  background-color: @disabled-background-color !important;
  color: #fff !important;
  border: none !important;
  cursor: not-allowed;
}
</style>

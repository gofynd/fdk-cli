<template>
  <button
    @click="$emit('click')"
    :class="type"
    type="button"
    class="common-button"
    :disabled="disabled"
  >
    <slot>{{ type }}</slot>
  </button>
</template>

<script>
export default {
  data: function data() {
    return {};
  },
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
  methods: {},
  computed: {},
  mounted: function mounted() {},
  destroyed: function destroyed() {},
};
</script>

<style lang="less" scoped>
@tablet-screen: ~"(max-width: 1280px)";
@disabled-background-color: #808080;

.common-button {
    text-align: center;
    color: @White;
    cursor: pointer;
    background-color: @PrimaryColor;
    border-radius: 3px;
    margin: 10px auto;
    width: calc(100% - 50px);
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    height: 44px;
}

.primary {
  background-color: @PrimaryColor;
  color: @White;
  letter-spacing: 0 !important;
}

.secondary {
  background-color: @SecondaryColor;
  color: @White;
  letter-spacing: 0 !important;
}

.common-button[disabled] {
  cursor: not-allowed;
}

</style>

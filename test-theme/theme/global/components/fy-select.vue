<template>
  <select
    :disabled="disabled === true"
    class="custom-select"
    v-model="selectedOption"
    @change="changeSelection"
  >
    <option v-for="(opt, index) in options" :key="index" :value="opt.value">{{ opt.display }}</option>
  </select>
</template>

<style lang="less" scoped>
.custom-select {
  width: 100%;
}
</style>

<script>
export default {
  name: "fy-select",
  props: {
    options: {},
    selectedOpt: {},
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedOption: this.selectedOpt
    };
  },
  methods: {
    getSelectedOption() {
      return this.selectedOption;
    },
    changeSelection(event) {
      this.$emit("change-selection", event);
    }
  }
};
</script>

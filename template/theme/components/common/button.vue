<template>
  <button
    @click="$emit('click')"
    :style="`
      background-color: ${getBackgroundColor()};
      color: ${getColor()};
      border: ${getBorder()};
      padding: ${getPadding()};
      --button_tertiary_hover_color: ${global_config ? global_config.props.button_tertiary_hover_color : ''};
      --button_tertiary_hover_text_color: ${global_config ? global_config.props.button_tertiary_hover_text_color : ''};
    `"
    type="button"
    class="emerge-btn"
    :data-btntype="btntype"
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
    },
    padding: {
      type: String
    },
    global_config : {
      type: Object
    },
    btntype : {
      type: String
    }
  },
  methods: {
    getBackgroundColor() {
      if (this.backgroundcolortype == "primary") {
        if(this.global_config) {
          return this.global_config.props.button_primary_color;
        }
        return "black";
      }
      if (this.backgroundcolortype == "secondary") {
        if(this.global_config) {
          return this.global_config.props.button_secondary_color;
        }
        return "black";
      }
      if (this.backgroundcolortype == "tertiary") {
        return "transparent";
      }
      return "black";
    },

    getColor() {
      if (this.colortype == "primary") {
        if(this.global_config) {
          return this.global_config.props.button_primary_label_color;
        }
        return "#2B2A28";
      }
      if (this.colortype == "secondary") {
        if(this.global_config) {
          return this.global_config.props.button_secondary_label_color;
        }
        return "#383838";
      }
      if (this.colortype == "tertiary") {
        if(this.global_config) {
          return this.global_config.props.button_tertiary_label_color;
        }
        return "#383838";
      }
      return "#ffffff";
    },
    getBorder() {
      // if (this.bordertype == "tertiary") {
      //   return "0";
      // }
      if (this.bordertype == "primary") {
        return "0";
      }
      if (this.bordertype == "secondary") {
        if(this.global_config) {
          return `1px solid ${this.global_config.props.button_secondary_color}`;
        }
      }
      if (this.bordertype == "tertiary") {
        if(this.global_config) {
          return `1px solid ${this.global_config.props.button_tertiary_color}`;
        }
        return "#383838";
      }
      return "none";
    },
    getPadding() {
      // if (this.padding == "tertiary") {
      //   return "12px 43px 12px 43px";
      // }
      if (this.padding == "secondary") {
        return "";
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
// @tablet-screen: ~"(max-width: 1280px)";
@disabled-background-color: #eaeaea;
@font-color: #ffffff;

.emerge-btn {
  width: 178px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: none;
  background-color: @background-color;
  font-size: 14px;
  line-height: 18px;
  color: @font-color;
  font-weight: 700;
  cursor: pointer;
  padding: 10px;
  @media @tablet {
    width: 110px;
    font-size: 12px;
    height: 34px;
  }
  @media @mobile {
    width: 110px;
    font-size: 12px;
    // padding: 12px 30px !important;
    height: 34px;
  }
  &[data-btntype='tertiary']:hover {
    background: var(--button_tertiary_hover_color) !important;
    color: var(--button_tertiary_hover_text_color) !important;
  }
}

.emerge-btn[disabled] {
  background-color: @disabled-background-color !important;
  color: #333333 !important;
}
</style>

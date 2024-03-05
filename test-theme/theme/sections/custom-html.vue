<template> 
  <div class="full-width-section section-wrapper" :style="dynamicStyles" v-html="settings.props.code.value">
  </div>
</template>
<settings>
{
  "name": "custom_html",
  "label": "Custom HTML",
  "props": [
    {
      "type": "code",
      "id": "code",
      "label": "Custom HTML",
      "info": "Add Your custom HTML Code below. You can also use the full screen icon to open a code editor and add your code"
    },
    {
      "type": "range",
      "id": "margin_top",
      "min": 0,
      "max": 1000,
      "step": 1,
      "unit": "px",
      "label": "Section Top Margin",
      "default": 0
    },
    {
      "type": "range",
      "id": "margin_bottom",
      "min": 0,
      "max": 1000,
      "step": 1,
      "unit": "px",
      "label": "Section Bottom Margin",
      "default": 0
    }
  ]
}
</settings>

<script>
export default {
  props: ['settings'],
  computed: {
    dynamicStyles() {
      return {
        "--margin-top":`${this.settings?.props?.margin_top?.value}px`,
        "--margin-bottom": `${this.settings?.props?.margin_bottom?.value}px`,
      };
    },
  },
};
</script>

<style lang="less" scoped>
.section-wrapper {
  margin-top: var(--margin-top);
  margin-bottom: var(--margin-bottom);
}
</style>

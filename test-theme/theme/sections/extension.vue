<template>
  <div class="section-extension-root section-wrapper" :style="dynamicStyles">
    <!-- Extension Slot -->
    <fdk-extension :templates="templates" />
  </div>
</template>

<!-- #region  -->
<settings>
{
    "name": "section_extension",
    "label": "Extensions",
    "props": [
        {
          "type": "extension",
          "id": "extension",
          "label": "Extension Positions",
          "info": "Handle extension in these positions",
          "positions": [
            {
              "value": "section_extension",
              "text": ""
            }
          ],
          "default": {}
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
<!-- #endregion -->


<script>
export default {
  props: ["settings"],
  computed: {
    templates() {
      return this.settings.props?.extension?.value?.["section_extension"] || []
    },
    dynamicStyles() {
      return {
        "--margin-top":`${this.settings?.props?.margin_top?.value}px`,
        "--margin-bottom": `${this.settings?.props?.margin_bottom?.value}px`,
      };
    },
  }
};
</script>

<style lang="less" scoped>
.section-wrapper {
  margin-top: var(--margin-top);
  margin-bottom: var(--margin-bottom);
}
</style>

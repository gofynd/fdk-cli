<template>
  <div
    class="app-banner-cont section-wrapper"
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
    :style="dynamicStyles"
  >
    <div class="card-container">
      <div class="top-items" v-if="banner_image">
        <fdk-link :link="settings.props.banner_link && settings.props.banner_link.value || ''">
          <emerge-image 
          v-if="banner_image" 
          :src="banner_image" 
          :sources="[
            { breakpoint: { min:1281, max: 1920 }, width: 1920 },
            { breakpoint: { min:769, max: 1280 }, width: 1280 },
            { breakpoint: { min:361, max: 768 }, width: 768 },
            { breakpoint: { max: 360 }, width: 360 },
          ]" :placeholder="''" />
          <fdk-placeholder v-else type="banner-1" />
        </fdk-link>
      </div>
    </div>
  </div>
</template>
<settings>
{
  "name": "application_banner",
  "label": "Application Banner",
  "props": [
    {
      "type": "url",
      "id": "banner_link",
      "default": "",
      "label": "Redirect Link"
    },
    {
      "type":"checkbox",
      "id":"full_width",
      "default": false,
      "label": "Full width",
      "info":"Check to allow items to take entire width of the viewport"
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
import emergeImage from "../global/components/common/emerge-image.vue";

export default {
  props: ["settings", "context"],
  components: {
    'emerge-image': emergeImage,
  },
  data() {
    return {
      banner_image:
        (this.context.app_config.application.banner && this.context.app_config.application.banner.secure_url) ||
        "",
    };
  },
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
.card-container {
  margin: 0;
}
.top-items {
  border-radius: @border-radius;
  background: @White;
  /deep/ .fy__img {
    width: 100%;
  }
}
.full-width-section {
  .top-items {
    padding: 0;
  }
}
</style>

<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
    class="app-banner-cont"
  >
    <div class="card-container">
      <div class="top-items" v-if="banner_image">
        <fdk-link :link="settings.props.banner_link && settings.props.banner_link.value || ''">
          <!-- <img :src="banner_image" /> -->
          <emerge-image 
          v-if="banner_image" 
          :src="banner_image" 
          :sources="[
            { breakpoint: { min:1441, max: 1920 }, width: 1920 },
            { breakpoint: { min: 1367, max: 1440 }, width: 1440 },
            { breakpoint: { min:1281, max: 1366 }, width: 1366 },
            { breakpoint: { min:1025, max: 1280 }, width: 1280 },
            { breakpoint: { min:769, max: 1024 }, width: 1024 },
            { breakpoint: { min:541, max: 768 }, width: 768 },
            { breakpoint: { min:481, max: 540 }, width: 540 },
            { breakpoint: { min:361, max: 480 }, width: 480 },
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
    }
  ]
}
</settings>
<script>
import emergeImage from "../global/components/common/emerge-image.vue";

export default {
  props: ["settings", "context"],
  mounted() {},
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
  methods: {},
};
</script>
<style lang="less" scoped>
.card-container {
  margin: 0;
}
.top-items {
  // padding: 14px;
  border-radius: @border-radius;
  background: @White;
  // margin: 20px 0px;
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

<template>
  <div class="card-container">
    <div class="top-items" v-if="banner_image">
      <fdk-link :link="settings.props.ctaLink.value">
        <nm-image :src="banner_image" />
      </fdk-link>
    </div>
    <div v-else class="top-items">
      <fdk-placeholder type="banner-1" />
    </div>
  </div>
</template>
<settings>
{
  "name": "ApplicationBanner",
  "label": "App Banner",
  "props": [
    {
      "type": "url",
      "id": "ctaLink",
      "default": "",
      "label": "Redirect Link"
    }
  ]
}
</settings>
<script>
import nmImage from "./../global/components/common/nm-image.vue";
export default {
  components: {
    "nm-image": nmImage,
  },
  props: ["settings", "context"],
  data() {
    return {
      banner_image: this.context.app_config.application.banner.secure_url || "",
    };
  },
};
</script>
<style lang="less" scoped>
.card-container {
  margin: 0;
}
.top-items {
  padding: 14px;
  border-radius: @BorderRadius;
  background: @White;
  margin: 20px 0px;
  /deep/ .nm__img {
    width: 100%;
  }
}
</style>

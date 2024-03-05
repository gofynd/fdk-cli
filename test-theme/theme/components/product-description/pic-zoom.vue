<template>
  <div>
    <div v-if="type === 'image'" class="load-image">
      <img
        v-show="!isLoading"
        :src="source"
        :alt="alt"
        class="pdp-image animated fadeIn"
        @click="openGallery"
        @load="imageOnLoad"
      />
      <img v-show="isLoading" src="../../assets/images/loader.gif" />
    </div>
    <div
      v-if="type === 'video'"
      class="video-container"
      :class="{ 'youtube-video': getOriginalImage().includes('youtube') }"
    >
      <video
        v-if="!getOriginalImage().includes('youtube')"
        class="originalVideo"
        :src="getOriginalImage()"
        data-loaded="false"
        controls
        @mouseover="mouseover"
        @click="openGallery"
      ></video>
      <fdk-loader id="loader" v-if="isFrameLoading"></fdk-loader>
      <iframe
        v-if="getOriginalImage().includes('youtube')"
        class="originalVideo"
        :src="getOriginalImage()"
        allowfullscreen
        @load="iframeload"
      ></iframe>
    </div>
    <div v-if="type === '3d_model' && isMounted" class="type-3d_model">
      <no-ssr>
        <viewer-3d :src="getOriginalImage()"></viewer-3d>
      </no-ssr>
      <div class="expand-btn" @click="openGallery">
        <svg-wrapper :svg_src="'expand'"></svg-wrapper>
      </div>
    </div>
  </div>
</template>

<script>
import { isNode } from "browser-or-node";
import SvgWrapper from '../common/svg-wrapper.vue';
import NoSSR from "vue-no-ssr";

export default {
  name: "piczoom",
  props: {
    source: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    alt: {
      type: String,
    },
    product: {},
    key: null,
  },
  components: {
    "no-ssr": NoSSR,
    "svg-wrapper": SvgWrapper,
    "viewer-3d": () =>
      isNode ? Promise.resolve(null) : Promise.resolve(require("./viewer-3d")),
  },
  data() {
    return {
      isLoading: false,
      imageFullyLoaded: true,
      imageLoading: false,
      isMounted: false,
      isFrameLoading: true,
    };
  },
  watch: {
    source(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.isLoading = true;
      }
    },
  },
  mounted() {
    this.isMounted = true;
    this.isFrameLoading =true;
  },
  computed: {
    getProductColor() {
      if (!this.imageFullyLoaded) {
        return this.product.attributes
          ? "#" + this.product.attributes.primary_color_hex
          : "";
      }
      return "";
    },
    getPDPImageURL() {
      return this.source;
    },
  },
  methods: {
    iframeload() {
      this.isFrameLoading = false;
    },
    imageLoaded(event) {
      this.imageFullyLoaded = true;
    },
    getOriginalImage() {
      return this.source;
    },
    openGallery() {
      this.$emit("clickimage", this.$vnode.key);
    },
    imageOnLoad() {
      this.isLoading = false;
    }
  },
};
</script>

<style lang="less" scoped>
.load-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.bgopacity {
  opacity: 0.5;
}
.pdp-image {
  width: 80%;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.14),
    rgba(0, 0, 0, 0.2)
  );
}
.originalImg {
  left: 0;
  position: absolute;
  top: 0;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  max-width: 720px;
}
.video-container {
  position: relative;
  height: 100%;
  .originalVideo {
    width: 100%;
    height: 100%;
    cursor: pointer;
    @media @mobile {
      min-width: 250px;
      max-width: 250px;
    }
  }
.youtube-video{
  min-height: 75vh;
  @media @mobile {
    min-width: 300px;
    min-height: 200px;
    }
  }
  .thumbnail {
    &::after {
      background-image: url(../../assets/images/play-button.svg);
      width: 60px;
      background-size: contain;
      content: "";
      display: block;
      height: 60px;
      position: absolute;
      background-repeat: no-repeat;
      top: 50%;
      left: 50%;
      margin-left: -30px;
      margin-top: -30px;
    }
  }
}
.type-3d_model {
  position: relative;
  /deep/ model-viewer {
    width: 100%;
    min-height: 400px;
    min-width: 320px;
    @media @mobile {
      min-width: 250px;
    }
  }
  .expand-btn {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    img {
      width: 100%;
    }
  }
}
#loader {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: 93%;
}
</style>

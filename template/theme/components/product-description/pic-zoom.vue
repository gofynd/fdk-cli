<template>
  <div>
    <div v-if="type === 'image'" class="load-image">
      <img
        v-show="!isLoading"
        :src="source"
        class="pdp-image animated fadeIn"
        @mouseover="onMouseOver"
        @click="openGallery"
        @load="OriginalImageLoaded"
      />
      <img v-show="isLoading" src="../../assets/images/loader.gif" />
    </div>
    <div
      v-if="type === 'video'"
      class="video-container"
      @mouseover="mouseover"
      @click="openGallery"
    >
      <video
        class="originalVideo"
        :src="getOriginalImage()"
        data-loaded="false"
        controls
      ></video>
    </div>
    <div v-if="type === '3d_model' && isMounted" class="type-3d_model">
      <no-ssr>
        <viewer-3d :src="getOriginalImage()"></viewer-3d>
      </no-ssr>
      <div class="expand-btn" @click="openGallery">
        <img src="../../assets/images/expand.svg" />
      </div>
    </div>
  </div>
</template>

<script>
import { isBrowser, isNode } from "browser-or-node";
import NoSSR from "vue-no-ssr";
const PLACEHOLDER_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC";

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
    product: {},
    key: null,
  },
  components: {
    "no-ssr": NoSSR,
    "viewer-3d": () =>
      isNode ? Promise.resolve(null) : Promise.resolve(require("./viewer-3d")),
  },
  data() {
    return {
      isLoading: false,
      imageFullyLoaded: true,
      imageLoading: false,
      isMounted: false,
      isLoading: false,
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
    this.loader = true;
    this.isMounted = true;
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
    imageLoaded(event) {
      this.imageFullyLoaded = true;
    },
    getOriginalImage() {
      return this.source;
    },
    openGallery() {
      this.$emit("clickimage", this.$vnode.key);
    },
    onMouseOver() {
      let originalElm = this.$refs["original_" + this.$vnode.key];
      if (originalElm) {
        originalElm.src = this.getOriginalImage(this.source);
      }
    },
    OriginalImageLoaded() {
      let originalElm = this.$refs["original_" + this.$vnode.key];
      if (originalElm) {
        originalElm["data-loaded"] = true;
      }
      this.isLoading = false;
    },
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
  .originalVideo {
    width: 100%;
    height: auto;
    cursor: pointer;
    @media @mobile {
      min-width: 250px;
      max-width: 250px;
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
</style>

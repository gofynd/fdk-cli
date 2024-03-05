<!--Imported from https://github.com/pexea12/vue-image-lightbox-->

<template>
  <div @click.stop="closeLightBox">
    <div
      class="vue-lb-container"
      v-show="lightBoxOn"
      v-if="images && images.length > 0"
      ref="container"
    >
      <div class="vue-lb-content">
        <div class="vue-lb-header">
          <span></span>
          <button type="button" :title="closeText" class="vue-lb-button-close">
            <slot name="close">
              <span>
                <svg-wrapper class="cross-icon" :svg_src="'cross-white'"></svg-wrapper>
              </span>
            </slot>
          </button>
          <!-- .vue-lb-button-close -->
        </div>
        <!-- .vue-lb-header -->
        <div class="vue-lb-figure" @click.stop>
          <transition mode="out-in" name="fade">
            <template v-if="selectLoading"> </template>
            <template v-else>
              <emerge-image
                v-if="images[select].type === 'image'"
                :key="images[select].url"
                :src="images[select].url.replace('resize:w-540', 'original')"
                :alt="images[select].alt"
                class="vue-lb-modal-image"
                :sources="[
                  { breakpoint: {min: 481}, width: 800},
                  { breakpoint: {max: 480}, width: 540}
                ]"
              />
              <video
                v-if="images[select].type === 'video' && !images[select].url.includes('youtube')"
                :key="images[select].url"
                :src="images[select].url"
                :srcset="images[select].srcset || ''"
                class="vue-lb-modal-image"
                controls
                ref="videoPlayer"
              />
               <iframe
                v-if="images[select].type === 'video' && images[select].url.includes('youtube')"
                :key="images[select].url"
                :src="images[select].url+`?enablejsapi=1&html5=1`"
                :srcset="images[select].srcset || ''"
                class="vue-lb-modal-image youtube-video"
                allowfullscreen
              ></iframe>
              <div
                v-if="images[select].type === '3d_model' && isMounted"
                class="vue-lb-modal-image type-3d_model"
              >
                <no-ssr>
                  <viewer-3d :src="images[select].url"></viewer-3d>
                </no-ssr>
              </div>
            </template>
          </transition>
          <div
            class="vue-lb-info"
            v-html="images[select].caption"
            v-show="showCaption && images[select].caption"
          ></div>

          <div class="vue-lb-footer">
            <div class="vue-lb-footer-info"></div>
            <div class="vue-lb-footer-count">
              <slot name="footer" :current="select + 1" :total="images.length"
                >{{ select + 1 }} / {{ images.length }}</slot
              >
            </div>
          </div>
        </div>
      </div>
      <!-- .vue-lb-content -->
      <div class="vue-lb-thumbnail-wrapper">
        <div v-if="showThumbs" class="vue-lb-thumbnail">
          <button
            v-if="images.length > 1"
            type="button"
            class="vue-lb-thumbnail-arrow vue-lb-thumbnail-left"
            :title="previousThumbText"
            @click.stop="previousImage()"
          >
            <slot name="previousThumb">
              <svg-wrapper :svg_src="'arrow-left-white'"></svg-wrapper>
            </slot>
          </button>

          <div
            v-for="(image, index) in imagesThumb"
            :key="typeof image === 'string' ? `${image}${index}` : index"
            v-show="index >= thumbIndex.begin && index <= thumbIndex.end"
            @click.stop="showImage(index)"
          >
            <img
              :src="image.src"
              v-if="image.type === 'image'"
              :class="
                'vue-lb-modal-thumbnail' + (select === index ? '-active' : '')
              "
            />
            <video
              :src="image.src"
              v-else-if="image.type === 'video'&&!image.src.includes('youtube')"
              :class="
                'vue-lb-modal-thumbnail' + (select === index ? '-active' : '')
              "
            ></video>
            <img
              :src="getImageURL(image.src)"
              v-else-if="image.type === 'video'&&image.src.includes('youtube')"
              :class="
                'vue-lb-modal-thumbnail' + (select === index ? '-active' : '')
              "
            />
            <div
              v-if="image.type === '3d_model' && isMounted"
              class="type-3d_model"
              :class="
                'vue-lb-modal-thumbnail' + (select === index ? '-active' : '')
              "
            >
              <svg-wrapper :svg_src="'3D'"></svg-wrapper>
            </div>
          </div>

          <button
            v-if="images.length > 1"
            type="button"
            class="vue-lb-thumbnail-arrow vue-lb-thumbnail-right"
            :title="nextThumbText"
            @click.stop="nextImage()"
          >
            <slot name="nextThumb">
              <svg-wrapper :svg_src="'arrow-right-white'"></svg-wrapper>
            </slot>
          </button>
        </div>
        <!-- .vue-lb-thumbnail -->
      </div>
      <button
        v-if="images.length > 1"
        type="button"
        class="vue-lb-arrow vue-lb-left"
        :title="previousText"
        @click.stop="previousImage()"
      >
        <slot name="previous">
          <svg-wrapper :svg_src="'arrow-left-white'"></svg-wrapper>
        </slot>
      </button>

      <button
        v-if="images.length > 1"
        type="button"
        class="vue-lb-arrow vue-lb-right"
        :title="nextText"
        @click.stop="nextImage()"
      >
        <slot name="next">
          <svg-wrapper :svg_src="'arrow-right-white'"></svg-wrapper>
        </slot>
      </button>
    </div>
    <!-- .vue-lb-container -->
  </div>
</template>

<style lang="less" scoped>
.vue-lb-box {
  width: 100%;
}

.vue-lb-container {
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  box-sizing: border-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0px;
  padding: 10px;
  position: fixed;
  top: 0px;
  width: 100%;
  z-index: 2000;
  -webkit-align-items: center;
  -moz-box-sizing: border-box;
  -webkit-justify-content: center;
  -ms-flex-align: center;
  -webkit-box-align: center;
  -ms-flex-pack: center;
  -webkit-box-pack: center;
  user-select: auto !important;
  -webkit-user-drag: auto !important;
  -webkit-user-select: text !important;
  -ms-user-select: text !important;
  -moz-user-select: text !important;
  touch-action: unset !important;
}

.vue-lb-content {
  margin-bottom: 60px;
  position: relative;
}

.vue-lb-header {
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: space-between;
  height: 40px;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  -webkit-box-pack: justify;
}

.vue-lb-button-close {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  position: relative;
  top: 0px;
  vertical-align: bottom;
  height: 40px;
  margin-right: -10px;
  padding: 10px;
  width: 40px;
}

.vue-lb-figure {
  margin: 0px;
  display: block;
  position: relative;

  /deep/ picture img {
    cursor: pointer;
    max-height: calc(100vh - 140px);
    cursor: pointer;
    display: block;
    height: auto;
    margin: 0 auto;
    max-width: 100%;
  }
}

img.vue-lb-modal-image {
  cursor: pointer;
  max-height: calc(100vh - 140px);
  cursor: pointer;
  display: block;
  height: auto;
  margin: 0 auto;
  max-width: 100%;
}
video.vue-lb-modal-image {
  cursor: pointer;
  max-height: calc(100vh - 140px);
  cursor: pointer;
  display: block;
  height: auto;
  margin: 0 auto;
  max-width: 100%;
}
.vue-lb-modal-image {
  /deep/ model-viewer {
    width: 100%;
    min-height: 500px;
    min-width: 500px;
    @media @mobile {
      min-width: 280px;
      min-height: 280px;
    }
  }
}
.vue-lb-info {
  visibility: initial;
  position: absolute;
  bottom: 25px;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  height: 40px;
  width: 100%;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  text-align: center;
}

.vue-lb-footer {
  box-sizing: border-box;
  color: white;
  cursor: auto;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: space-between;
  left: 0px;
  line-height: 1.3;
  padding-bottom: 5px;
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 5px;
  -moz-box-sizing: border-box;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  -webkit-box-pack: justify;
}

.vue-lb-footer-info {
  display: block;
  flex: 1 1 0;
  -webkit-flex: 1 1 0;
  -ms-flex: 1 1 0;
}

.vue-lb-footer-count {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85em;
  padding-left: 1em;
}

.vue-lb-thumbnail {
  bottom: 10px;
  height: 50px;
  padding: 0 50px;
  text-align: center;
  white-space: nowrap;
  display: flex;
  position: relative;
  justify-content: center;
}

.youtube-video{
  min-width: 80vw;
  min-height: 80vh;
  @media @tablet {
    min-width: 95vw;
    min-height: 60vh;
  }
}

.vue-lb-modal-thumbnail {
  background-position: center;
  background-size: cover;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.2);
  cursor: pointer;
  display: inline-block;
  height: 50px;
  margin: 2px;
  overflow: hidden;
}

.vue-lb-modal-thumbnail-active {
  background-position: center;
  background-size: cover;
  border-radius: 2px;
  box-shadow: inset 0 0 0 2px white;
  cursor: pointer;
  display: inline-block;
  height: 50px;
  margin: 2px;
  overflow: hidden;
}

.vue-lb-modal-thumbnail,
.vue-lb-modal-thumbnail-active {
  &.type-3d_model {
    font-size: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
}

.vue-lb-thumbnail-arrow {
  height: 54px;
  width: 40px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
  padding: 10px;
  -webkit-touch-callout: none;
  user-select: none;
  height: 50px;
  width: 30px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.vue-lb-thumbnail-left {
  left: 10px;
}

.vue-lb-thumbnail-right {
  right: 10px;
}

.vue-lb-arrow {
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
  padding: 10px;
  position: absolute;
  top: 50%;
  -webkit-touch-callout: none;
  user-select: none;
  height: 120px;
  margin-top: -60px;
  width: 40px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.vue-lb-left {
  left: 10px;
}

.vue-lb-right {
  right: 10px;
}

.vue-lb-open {
  overflow: hidden;
}

.vue-lb-thumbnail-wrapper {
  bottom: 10px;
  height: 50px;
  left: 0;
  margin: 0 auto;
  position: absolute;
  right: 0;
  text-align: center;
  top: auto;
}

@media (min-width: 500px) {
  .vue-lb-thumbnail-arrow {
    width: 40px;
  }
}

@media (min-width: 768px) {
  .vue-lb-arrow {
    width: 70px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.no-scroll {
  overflow-y: hidden;
}
.cross-icon{
  height: 20px;
  width: 20px;
}
</style>

<script>
import modal from "./../../global/components/modal.vue";
import { getImageURL } from "./../../helper/image-utils";
import { isNode } from "browser-or-node";
import NoSSR from "vue-no-ssr";
import emergeImage from "../../global/components/common/emerge-image.vue";
import SvgWrapper from "../../components/common/svg-wrapper.vue";

let Hammer;

if (typeof window !== "undefined") {
  Hammer = require("hammerjs");
}

export default {
  name: "lightbox-image",

  props: {
    images: {
      type: Array,
      required: true,
    },

    disableScroll: {
      type: Boolean,
      default: true,
    },

    showLightBox: {
      type: Boolean,
      default: true,
    },

    startAt: {
      type: Number,
      default: 0,
    },

    nThumbs: {
      type: Number,
      default: 7,
    },

    showThumbs: {
      type: Boolean,
      default: true,
    },

    // Mode
    autoPlay: {
      type: Boolean,
      default: false,
    },

    autoPlayTime: {
      type: Number,
      default: 3000,
    },

    siteLoading: {
      default: null,
    },

    showCaption: {
      type: Boolean,
      default: false,
    },

    lengthToLoadMore: {
      type: Number,
      default: 0,
    },

    closeText: {
      type: String,
      default: "Close (Esc)",
    },

    previousText: {
      type: String,
      default: "Previous",
    },

    nextText: {
      type: String,
      default: "Next",
    },

    previousThumbText: {
      type: String,
      default: "Previous",
    },

    nextThumbText: {
      type: String,
      default: "Next",
    },
  },

  extends: modal,
  components: {
    "no-ssr": NoSSR,
    "viewer-3d": () =>
      isNode ? Promise.resolve(null) : Promise.resolve(require("./viewer-3d")),
    "emerge-image": emergeImage,
    "svg-wrapper": SvgWrapper,
  },
  data() {
    return {
      select: this.startAt,
      lightBoxOn: this.showLightBox,
      timer: null,
      isMounted: false,
      selectLoading: false,
    };
  },

  computed: {
    thumbIndex() {
      const halfDown = Math.floor(this.nThumbs / 2);
      if (
        this.select >= halfDown &&
        this.select < this.images.length - halfDown
      )
        return {
          begin: this.select - halfDown + (1 - (this.nThumbs % 2)),
          end: this.select + halfDown,
        };

      if (this.select < halfDown)
        return {
          begin: 0,
          end: this.nThumbs - 1,
        };

      return {
        begin: this.images.length - this.nThumbs,
        end: this.images.length - 1,
      };
    },

    imagesThumb() {
      if (this.siteLoading) {
        return this.images.map((img) => ({
          src: img.url.replace("resize-w:540", "original"),
          type: img.type,
          loading: this.siteLoading,
          error: this.siteLoading,
        }));
        return a;
      }

      return this.images.map((img) => ({
        src: img.url.replace("resize-w:540", "original"),
        type: img.type,
      }));
    },
  },

  watch: {
    lightBoxOn(value) {
      if (document != null) {
        this.onToggleLightBox(value);
      }
    },

    select() {
      if (this.select >= this.images.length - this.lengthToLoadMore - 1)
        this.$emit("onLoad");

      if (this.select === this.images.length - 1) this.$emit("onLastIndex");

      if (this.select === 0) this.$emit("onFirstIndex");

      if (this.select === this.startAt) this.$emit("onStartIndex");
    },
  },

  mounted() {
    if (this.autoPlay) {
      this.timer = setInterval(() => {
        this.nextImage();
      }, this.autoPlayTime);
    }

    this.onToggleLightBox(this.lightBoxOn);

    if (this.$refs.container) {
      const hammer = new Hammer(this.$refs.container);

      hammer.on("swiperight", () => {
        this.previousImage();
      });

      hammer.on("swipeleft", () => {
        this.nextImage();
      });
    }

    this.isMounted = true;
  },

  methods: {
    getImageURL,
    onToggleLightBox(value) {
      if (this.disableScroll) {
        document.querySelector("html").classList.toggle("no-scroll", value);
      }

      document.querySelector("body").classList.toggle("hide-overflow", value);
      this.$emit("onOpened", value);

      if (value) {
        document.addEventListener("keydown", this.addKeyEvent);
      } else {
        document.removeEventListener("keydown", this.addKeyEvent);
      }
    },
    getImageURL(src){
      return `http://img.youtube.com/vi/${src?.substr(src?.lastIndexOf("/")+1)}/0.jpg`
    },
    showImage(index) {
      this.$set(this, "lightBoxOn", true);
      this.$set(this, "selectLoading", true);
      setTimeout(() => {
        this.$set(this, "select", index);
        this.$set(this, "selectLoading", false);
      }, 1);
    },

    addKeyEvent(event) {
      if (event.keyCode === 37) this.previousImage(); // left arrow
      if (event.keyCode === 39) this.nextImage(); // right arrow
      if (event.keyCode === 27) this.closeLightBox(); // esc
    },

    closeLightBox() {
      let iframe = document.querySelector('iframe')
      if (iframe) {
        var iframeSrc = iframe.src
        iframe.src = iframeSrc
      }
      this.$set(this, "lightBoxOn", false);
      if (this.$refs.videoPlayer) this.handleVideoPlayback();
    },
    handleVideoPlayback() {
      this.$refs.videoPlayer.pause();
      this.$refs.videoPlayer.currentTime = 0;
    },

    nextImage() {
      this.$set(this, "selectLoading", true);
      setTimeout(() => {
        this.$set(this, "select", (this.select + 1) % this.images.length);
        this.$set(this, "selectLoading", false);
      }, 1);
    },

    previousImage() {
      this.$set(this, "selectLoading", true);
      setTimeout(() => {
        this.$set(
          this,
          "select",
          (this.select + this.images.length - 1) % this.images.length
        );
        this.$set(this, "selectLoading", false);
      }, 1);
    },
  },

  beforeDestroy() {
    document.removeEventListener("keydown", this.addKeyEvent);

    if (this.autoPlay) {
      clearInterval(this.timer);
    }
  },
};
</script>

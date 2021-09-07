<template>
  <div class="mobile-pdp-carousel-box">
    <div class="glide-cont" :class="'glide' + _uid" ref="glide">
      <div data-glide-el="track" class="glide__track">
        <div
          class="glide__slides"
          :class="{ 'ssr-slides-box': !checkisBrowser() && !isMounted }"
        >
          <div
            class="glide__slide"
            v-for="(img, id) in images"
            :key="'slide' + id"
          >
            <div class="image-wrapper" @click="openGallery(id)">
              <img
                v-if="img.type === 'image'"
                :src="img.url.replace('resize-w:540', 'original')"
              />
              <div v-if="img.type === 'video'" class="video-container">
                <video class="originalVideo" :src="img.url"></video>
                <div class="thumbnail"></div>
              </div>
              <div
                v-if="img.type === '3d_model' && isMounted"
                class="type-3d_model"
              >
                <no-ssr>
                  <viewer-3d :src="img.url" prompt="none"></viewer-3d>
                </no-ssr>
                <div class="overlay-icon">
                  <img src="../assets/images/3D.svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="glide__bullets" data-glide-el="controls[nav]">
        <button
          class="glide__bullet"
          :data-glide-dir="'=' + entry"
          v-for="(entry, index) in glidePaginate(images.length, 1)"
          :key="index"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
import emergeImage from "./../global/components/common/emerge-image.vue";
import { detectMobileWidth, glidePaginate } from "../helper/utils";
import { isBrowser, isNode } from "browser-or-node";
import Glide from "@glidejs/glide";
import "../../node_modules/@glidejs/glide/dist/css/glide.core.min.css";
import "../../node_modules/@glidejs/glide/dist/css/glide.theme.min.css";
import NoSSR from "vue-no-ssr";

export default {
  props: {
    images: {
      type: Array,
    },
  },
  components: {
    "emerge-image": emergeImage,
    "no-ssr": NoSSR,
    "viewer-3d": () =>
      isNode
        ? Promise.resolve(null)
        : Promise.resolve(require("./product-description/viewer-3d")),
  },
  data() {
    return {
      isMounted: false,
      innerCarousalCurrentIndex: 0,
      glideOptions: {
        type: "carousel",
        startAt: 0,
        gap: 0,
        perView: 1,
      },
      carouselHandle: null,
    };
  },
  mounted() {
    this.isMounted = true;
    this.initCarousel();
  },
  watch: {},
  methods: {
    checkisBrowser() {
      return isBrowser;
    },
    glidePaginate,
    initCarousel() {
      //if IsNode OR Layout is horizontal(optional flag) OR carouselHandle(carousel) is not already initialized
      if (isNode || this.carouselHandle) {
        return;
      }
      if (!this.$refs.glide) {
        setTimeout(() => {
          this.initCarousel();
        }, 1000);
        return;
      }
      // waiting for data to render, hence nextTick
      this.$nextTick(() => {
        try {
          this.carouselHandle = new Glide(this.$refs.glide, this.glideOptions);
          let glideClass = this.$refs.glide.getAttribute("class");
          this.carouselHandle.on(["move.after"], () => {
            let allDots = document.querySelectorAll(
              `.${glideClass} [data-glide-dir]`
            );
            if (allDots && allDots.length > 0) {
              allDots.forEach((ele) => {
                ele.classList.remove("glide__bullet--active");
              });
            }
            let currentDot = this.carouselHandle
              ? document.querySelectorAll(
                  `.${glideClass} [data-glide-dir='=${this.carouselHandle.index}']`
                )
              : null;
            if (currentDot && currentDot.length > 0) {
              currentDot[0].classList.add("glide__bullet--active");
            }
          });
          this.carouselHandle.mount();
        } catch (ex) {
          //There is an exception logged, due to rendering delay, so this try,catch is required
        }
      });
    },
    openGallery(id) {
      this.$emit("clickimage", id);
    },
  },
  beforeDestroy() {
    if (isBrowser && this.carouselHandle) {
      this.carouselHandle.destroy();
      this.carouselHandle = null;
    }
  },
};
</script>

<style lang="less" scoped="true">
.mobile-pdp-carousel-box {
  padding: 0 0 30px 0;
  .image-wrapper {
    display: flex;
    padding: 0 0 20px 0;
    .flex-center();
    img {
      width: 100%;
      height: auto;
      max-width: 100%;
    }
    .video-container {
      position: relative;
      .originalVideo {
        width: 100%;
        height: 430px;
        cursor: pointer;
        @media @mobile {
          min-width: 250px;
          max-width: 250px;
        }
      }
      .thumbnail {
        &::after {
          background-image: url(../assets/images/play-button.svg);
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
        min-height: 300px;
        min-width: 320px;
        @media @mobile {
          min-width: 300px;
        }
      }
      .overlay-icon {
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 24px;
        }
      }
    }
  }

  /**
  For styling the Nav Bullets, and Left/Right Arrows
  */

  .glide__bullets {
    position: absolute;
    z-index: 2;
    margin-top: 40px;
    left: 50%;
    display: inline-flex;
    align-items: center;
    list-style: none;
    transform: translateX(-50%);
    @media @mobile {
      margin-top: 20px;
    }
  }
  .glide__bullet {
    background-color: unset;
    border: 1px solid @color-black;
    box-shadow: unset;
    &:hover {
      background-color: @color-black;
    }
    &.glide__bullet--active {
      background-color: @color-black;
    }
  }
  .glide__slides.ssr-slides-box {
    touch-action: unset;
    overflow-x: auto;
    .glide__slide {
      margin-right: 30px;
      width: auto;
    }
  }
}
</style>

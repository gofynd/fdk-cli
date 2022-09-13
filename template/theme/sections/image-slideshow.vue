<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <div class="image-slideshow-container">
      <div class="card-container">
        <div class="top-items">
          <div class="title-block">
            <div
              :style="'color:' + global_config.props.text_heading_link_color"
              class="section-heading"
              v-if="
                settings.props.title.value &&
                  settings.props.title.value.length > 0
              "
            >
              {{ settings.props.title.value }}
            </div>
          </div>
          <template v-if="settings.blocks.length">
            <div class="glide-cont" :class="'glide' + _uid" ref="glide">
              <div data-glide-el="track" class="glide__track">
                <div
                  class="glide__slides"
                  :class="{ 'ssr-slides-box': !checkisBrowser() && !isMounted }"
                >
                  <div
                    :class="
                      'glide__slide slide ' + settings.props.slide_height.value
                    "
                    v-for="(block, index) in settings.blocks"
                    :key="index"
                  >
                    <fdk-link :link="block.props.slide_link.value">
                      <emerge-image
                        v-if="block.props.image.value"
                        :src="block.props.image.value"
                        :sources="[]"
                        :placeholder="''"
                      />
                      <fdk-placeholder v-else type="banner-1" />
                    </fdk-link>
                  </div>
                </div>
              </div>
              <div
                class="glide__bullets"
                data-glide-el="controls[nav]"
                v-if="settings.blocks.length > 1"
              >
                <button
                  class="glide__bullet"
                  :data-glide-dir="'=' + entry"
                  v-for="(entry, index) in glidePaginate(
                    settings.blocks.length,
                    1
                  )"
                  :key="index"
                ></button>
              </div>
              <!-- Arrows -->
              <div class="arrows" v-if="settings.blocks.length > 1">
                <section>
                  <div
                    class="prev-btn btn-nav-ss"
                    ref="prevArrow"
                    @click="prevSlide"
                  >
                    <div class="icon icon-prev"></div>
                  </div>
                  <div
                    class="next-btn btn-nav-ss"
                    ref="nextArrow"
                    @click="nextSlide"
                  >
                    <div class="icon icon-next"></div>
                  </div>
                </section>
              </div>
            </div>
          </template>
          <template v-else>
            <placeholder-items
              :count="3"
              :items_per_row="1"
              type="banner-1"
              text=""
              layout="horizontal"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- #region  -->

<settings>
{
  "name": "image_slideshow",
  "label": "Image Slideshow",
  "props": [
    {
      "type": "text",
      "id": "title",
      "default": "",
      "label": "Title"
    },
    {
      "type": "checkbox",
      "id": "autoplay",
      "default": false,
      "label": "AutoPlay Slides",
      "info": "Check to autoplay slides"
    },
    {
      "type": "range",
      "id": "slide_interval",
      "min": 1,
      "max": 10,
      "step": 1,
      "unit": "sec",
      "label": "Change slides after every",
      "default": 2,
      "info": "Autoplay slide duration"
    },
    {
      "type": "select",
      "id": "slide_height",
      "options": [
        {
          "value": "adapt",
          "text": "Adapt to first image"
        },
        {
          "value": "small",
          "text": "Small"
        },
        {
          "value": "medium",
          "text": "Medium"
        },
        {
          "value": "large",
          "text": "Large"
        }
      ],
      "default": "adapt",
      "label": "Slide height",
      "info": "Size of the slide"
    },
    {
      "type":"checkbox",
      "id":"full_width",
      "default": false,
      "label": "Full width",
      "info":"Check to allow items to take entire width of the viewport"
    }
  ],
  "blocks": [
    {
      "type": "image_slide",
      "name": "Slide",
      "props": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Image"
        },
        {
          "type": "url",
          "id": "slide_link",
          "label": "Slide Link"
        }
      ]
    }
  ],
  "preset": {
    "blocks": [
      {
        "name": "Slide"
      },
      {
        "name": "Slide"
      },
      {
        "name": "Slide"
      }
    ]
  }

}

</settings>
<!-- #endregion -->
<style scoped lang="less">
/* Icons */
.image-slideshow-container {
  margin: 0;
  @media @mobile {
    margin-top: 0;
  }
  .card-container {
    margin: 0;
    .top-items {
      // padding: 14px;
      border-radius: @border-radius;
      background: transparent;
      // margin: 10px 0 0 0;
    }

    .title-block {
      display: flex;
      text-transform: uppercase;
      text-align: center;
      box-sizing: border-box;
      position: relative;
      max-width: @page-width;
      .margin-0-auto();
      > div {
        flex: 0 0 100%;
      }
    }
    .link {
      position: absolute;
      line-height: 35px; //this is used to match the title-block height
      right: 0px;
      bottom: @title-margin-desktop;
      @media @tablet {
        display: none;
      }
    }
  }
  .slide {
    position: relative;
    @media @mobile {
      height: auto !important;
    }
    &.adapt {
      height: auto;
    }
    &.small {
      height: 475px;
    }
    &.medium {
      height: 650px;
    }
    &.large {
      height: 775px;
    }
    @media only screen and (max-width: 360px) {
      &.small {
        height: 175px;
      }
      &.medium {
        height: 270px;
      }
      &.large {
        height: 375px;
      }
    }
  }
  .arrows {
    position: absolute;
    display: flex;
    justify-content: flex-end;
    top: 50%;
    width: 100%;
    margin: -40px 0 0 0;
    @media @tablet {
      display: none;
    }
    section {
      position: relative;
      width: 100%;
      margin: 0 auto;
      display: flex;
      padding: 0 20px;
      box-sizing: border-box;
    }
  }
  .glide__bullets {
    position: relative;
    z-index: 2;
    margin-top: 40px;
    bottom: 0;
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
    }
  }
  .btn-nav-ss {
    z-index: @layer;
    background-color: transparent;
    padding: unset;
    cursor: pointer;
    width: 50px;
    display: flex;
    justify-content: center;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.2);
    }
  }
  .prev-btn {
  }
  .next-btn {
    margin-left: auto;
  }
  .icon {
    display: inline-block;
    width: 45px;
    height: 45px;
    background-size: cover;
  }
  .icon-next {
    background-image: url(../assets/images/nav-arrow.svg);
    transform: rotate(180deg);
  }
  .icon-prev {
    background-image: url(../assets/images/nav-arrow.svg);
  }
}
</style>
<script>
import { isBrowser, isNode } from "browser-or-node";
import { detectMobileWidth, glidePaginate } from "../helper/utils";
import Glide from "@glidejs/glide";
import "../../node_modules/@glidejs/glide/dist/css/glide.core.min.css";
import "../../node_modules/@glidejs/glide/dist/css/glide.theme.min.css";
import emergeImage from "../global/components/common/emerge-image.vue";
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";

export default {
  props: ["settings", "global_config"],
  components: {
    "emerge-image": emergeImage,
    "placeholder-items": placeholderItemsVue,
  },
  watch: {
    settings: function(newVal, oldVal) {
      this.cleanupComponent();
      this.initializeComponent();
    },
  },

  data: function() {
    return {
      isMounted: false,
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
    this.initializeComponent();
  },
  methods: {
    checkisBrowser() {
      return isBrowser;
    },
    glidePaginate,
    prevSlide() {
      this.carouselHandle.go(`<`);
    },
    nextSlide() {
      this.carouselHandle.go(`>`);
    },
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
          this.carouselHandle.mount();
        } catch (ex) {
          //There is an exception logged, due to rendering delay, so this try,catch is required
        }
      });
    },
    initializeComponent() {
      this.isMounted = true;
      if (this.settings.props.autoplay.value) {
        this.glideOptions.autoplay =
          this.settings.props.slide_interval.value * 1000;
      } else {
        this.glideOptions.autoplay = false;
      }
      this.initCarousel();
    },
    cleanupComponent() {
      if (isBrowser && this.carouselHandle) {
        this.carouselHandle.destroy();
        this.carouselHandle = null;
      }
    },
  },
  beforeDestroy() {
    this.cleanupComponent();
  },
};
</script>

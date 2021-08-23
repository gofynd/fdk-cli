<template>
  <div class="container">
    <div class="sticky">
      <div class="image-cont">
        <div class="image-carousal">
          <div>
            <carousel-3d
              :startIndex="1"
              ref="pdpCarousel"
              class="carousel"
              :width="280"
              :height="480"
              :autoplay="false"
              :perspective="180"
              :display="1"
              @after-slide-change="onAfterInnerSlideChange"
            >
              <slide
                class="slide"
                v-for="(img, id) in context.product.media"
                :key="id"
                :index="id"
              >
                <template
                  slot-scope="{
                    imageIndex,
                    imageIsCurrent,
                    imageLeftIndex,
                    imageRightIndex,
                  }"
                >
                  <img v-if="img.type === 'image'" v-bind:src="img.url" />
                  <video
                    v-if="img.type === 'video'"
                    :src="img.url"
                    controls
                    width="280"
                    height="480"
                  />
                </template>
              </slide>
            </carousel-3d>
          </div>
          <span class="bullet-container">
            <template v-for="(img, id) in context.product.media">
              <span
                :key="id"
                v-bind:class="{
                  bullet: true,
                  active: innerCarousalCurrentIndex == id,
                }"
                v-on:click="onCarouselButtonClick(id)"
                v-if="id < 10"
              ></span>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import nmImage from "./common/nm-image.vue";
export default {
  data() {
    return {
      compareWarning: "You have already selected 3 products",
      innerCarousalCurrentIndex: 0,
      zoomCarousalCurrentIndex: 0,
      showZoomModal: false,
    };
  },
  components: {
    "nm-image": nmImage,
  },
  props: {
    context: {
      type: Object,
    },
    browser_meta: {
      type: Object,
    },
  },
  methods: {
    toggleScroll(show) {
      if (show) {
        document.body.style.overflowY = "hidden";
      } else {
        document.body.style.overflowY = "";
      }
    },
    toggleZoomModal() {
      this.showZoomModal = !this.showZoomModal;
      this.toggleScroll(this.showZoomModal);
    },
    onAfterInnerSlideChange(e) {
      this.innerCarousalCurrentIndex = e;
    },
    onAfterZoomSlideChange(e) {
      this.zoomCarousalCurrentIndex = e;
    },
    onCarouselButtonClick(e) {
      this.innerCarousalCurrentIndex = e;
      this.$refs.pdpCarousel.goSlide(e);
    },
    onZoomCarouselButtonClick(e) {
      this.zoomCarousalCurrentIndex = e;
      this.$refs.zoomCarousel.goSlide(e);
    },
    showToast() {
      var x = document.getElementById("toast");
      x.className = "show";
      setTimeout(function() {
        x.className = x.className.replace("show", "hide");
      }, 3000);
    },
  },
  computed: {
    getPopupHeight: function() {
      return this.browser_meta.screenHeight * 0.8 - 40 - 100;
    },
  },
  watch: {
    context: function(data, oldData) {
      if (data.product.slug !== oldData.product.slug) {
        this.innerCarousalCurrentIndex = 0;
        this.zoomCarousalCurrentIndex = 0;
        if (this.$refs && this.$refs.pdpCarousel) {
          this.$refs.pdpCarousel.goSlide(0);
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.carousel-3d-container {
  margin: 0 auto !important;
}
.carousel-3d-slide .slide {
  width: 100%;
  align-items: center !important;
  display: flex !important;
}

.bullet-container .bullet {
  width: 8px !important;
  height: 8px !important;
  margin: 0px 5px !important;
}

.container {
  height: 100%;
}

.action-btns {
  margin: 10px 0;
  .btn {
    margin: 5px 0;
  }
}

.sticky {
  position: sticky;
  top: 100px;
  padding: 0px 30px 30px 30px;
}

.modal {
  display: flex; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 10; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  overflow-y: hidden;
  @media @mobile {
    top: 70px;
  }
  .modal-content {
    background-color: #fefefe;
    width: 100%;
    height: 100%;
    min-height: 600px;
    position: relative;

    .close {
      position: absolute;
      top: 0;
      right: 0;
      float: right;
      width: 15px;
      height: 15px;
      margin: 15px;
      &:hover,
      &:focus {
        cursor: pointer;
      }
    }
  }
}

@media @mobile {
  .modal {
    top: 0px;
  }
}

.bullet-container {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  .bullet {
    width: 16px;
    height: 16px;
    display: inline-block;
    border-radius: 100%;
    opacity: 0.2;
    margin: 0px 8px;
    background: #888;
    cursor: pointer;
    &.active {
      width: 20px;
      height: 20px;
      background: #000000;
      opacity: 1;
    }
  }
}
.carousel-3d-slide img {
  width: 100%;
}

.image-carousal {
  .carousel {
    width: 280px;
    height: 480px;
  }

  .slide {
    width: 280px;
    height: 480px;
    border: none;
    display: flex;
    align-items: center;
    background: transparent;
  }
}

.pdp-zoom {
  display: flex;
  // border-radius: 10px;
  .image-cont {
    flex: 1;
    .carousel {
      // width:600px;
      // min-height: 600px;
      // min-height: 60%;
      // height:800px;
    }

    .slide {
      // width:600px;
      // height:800px;
      // min-height: 60%;
      display: flex;
      align-items: center;
      border: none;
      background: transparent;
      & > img {
        width: 90%;
      }
    }

    .image-carousal {
      display: flex;
      flex-direction: row;
      height: 100%;
      align-items: center;
    }
    .small-image-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: auto;
      height: 100%;
      .sm-image {
        margin: 10px;
        width: 60px;
        &.selected {
          border: 1px solid black;
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
      .active {
        border: 1px solid #000;
      }
    }
  }
}
</style>

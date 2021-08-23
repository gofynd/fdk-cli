<template>
  <div>
    <div class="group-cards" v-if="layout === 'grid'">
      <placeholder-item
        v-for="index in count"
        :type="type"
        :key="index"
        :text="`${text} ${index}`"
      ></placeholder-item>
    </div>
    <div v-else-if="layout === 'horizontal'">
      <div class="brand-items">
        <VueSlickCarousel ref="slick" v-bind="slickOptions">
          <fdk-link
            :link="`#`"
            v-for="index in count"
            :key="index"
            class="item"
          >
            <div class="item__image">
              <fdk-placeholder :type="type" />
              <div class="overlay" v-if="brand && brand.logo && brand.logo.url">
                &nbsp;
              </div>
            </div>
            <p class="item__name">{{ `${text} ${index}` }}</p>
          </fdk-link>
        </VueSlickCarousel>
        <div class="arrows">
          <div class="prev-btn btn" ref="prevArrow" @click="prevSlide">
            <fdk-inline-svg :src="'arrow-pdp-left'"></fdk-inline-svg>
          </div>
          <div class="next-btn btn" ref="nextArrow" @click="nextSlide">
            <fdk-inline-svg :src="'arrow-pdp'"></fdk-inline-svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import placeholderItemVue from "./placeholder-item.vue";
import VueSlickCarousel from "vue-slick-carousel";
import { detectMobileWidth } from "../../../helper/utils";
export default {
  name: "placeholder-items",
  components: {
    "placeholder-item": placeholderItemVue,
    VueSlickCarousel,
  },
  props: {
    count: {
      type: Number,
    },
    type: {
      type: String,
    },
    text: {
      type: String,
    },
    layout: {
      type: String,
      default: "grid",
    },
  },
  data() {
    return {
      slickOptions: {
        arrows: false,
        dots: false,
        swipeToSlide: true,
        slidesToShow: 4,
        slidesToScroll: 2,
      },
    };
  },
  methods: {
    prevSlide() {
      if (detectMobileWidth()) {
        this.$refs.slick.goTo(
          this.$refs.slick.$refs.innerSlider.currentSlide - 1
        );
      } else {
        this.$refs.slick.goTo(
          this.$refs.slick.$refs.innerSlider.currentSlide - 4
        );
      }
    },
    nextSlide() {
      if (detectMobileWidth()) {
        this.$refs.slick.goTo(
          this.$refs.slick.$refs.innerSlider.currentSlide + 1
        );
      } else {
        this.$refs.slick.goTo(
          this.$refs.slick.$refs.innerSlider.currentSlide + 4
        );
      }
    },
  },
};
</script>

<style lang="less" scoped>
.group-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15%, 1fr));
  grid-auto-rows: auto;
  grid-gap: 2em;
}
@media screen and (max-width: 768px) {
  .group-cards {
    grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
    grid-gap: 0.5em;
    padding: 0 10px;
  }
}

.brand-items {
  position: relative;
  @media @mobile {
    padding: 0;
  }

  // Horizontal View CSS

  .slick-slide img {
    display: unset !important;
  }

  .btn {
    position: absolute;
    top: 50%;
    z-index: @layer;
    transform: translate(0%, -50%);
    background-color: transparent;
    padding: unset;
    cursor: pointer;
    @media @mobile {
      width: 30px;
    }
  }
  .next-btn {
    right: 15px;
  }
  .prev-btn {
    left: 15px;
  }

  .item {
    &__image {
      position: relative;
      min-height: 300px;
      margin: 10px;
      @media @mobile {
        min-height: 230px;
      }
    }
    &__brand-image {
      /deep/ .fy__img {
        width: 100%;
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC");
      }
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 99.5%;
      background-color: black;
      opacity: 0.3;
      border-radius: 3px;
      &:hover {
        opacity: 0.7;
      }
    }
    &__logo {
      top: 70%;
      position: absolute;
      width: 50px;
      left: 50%;
      transform: translateX(-50%);
    }
    &__name {
      font-weight: bold;
      color: #41434c;
      font-size: 14px;
      text-align: center;
      @media @mobile {
        font-size: 12px;
      }
    }
  }
  @media @mobile {
    /deep/ .item {
      width: 100% !important;
      margin-bottom: 20px;

      &:not(:nth-child(2n + 0)) {
        margin-right: 19px !important;
      }
    }
  }
}
</style>

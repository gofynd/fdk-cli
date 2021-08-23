<template>
  <div>
    <div
      v-for="(items, index) in similars"
      :key="index"
      class="similiar-container coll-cont"
    >
      <div class="similiar-title">{{ items.title }}</div>
      <div class="similiar-desc regular-xxs">
        {{ items.subtitle }}
      </div>
      <div class="similar-image-carousel">
        <VueSlickCarousel ref="slick" v-bind="slickOptions">
          <div class="item" v-for="(item, index) in items.items" :key="index">
            <fdk-link :link="`/product/${item.slug}`">
              <div class="container">
                <div class="product-container">
                  <div class="image-container">
                    <nm-image :src="getImageUrl(item.medias[0].url)" :alt="item.name" />
                  </div>
                  <div class="details-container">
                    <div class="spacing">
                      <p class="product-title" :title="item.name">
                        {{ item.name }}
                      </p>
                      <div class="price-box">
                        <div class="sales">
                          <span class="value">
                            {{ getPrice(item, "effective") | currencyformat }}
                          </span>
                        </div>
                        <span
                          class="product-total-discount list"
                          v-if="hasDiscount(item)"
                        >
                          <span class="value">{{ item.discount }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fdk-link>
          </div>
        </VueSlickCarousel>
        <div class="arrows">
          <button
            type="button"
            class="prev-arrow"
            ref="prevArrow"
            @click="prevSlide"
          ></button>
          <button
            type="button"
            class="next-arrow"
            ref="nextArrow"
            @click="nextSlide"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isBrowser, isNode } from "browser-or-node";
import placeholderImage from "./../../assets/images/placeholder.png";
import { detectMobileWidth } from "./../../helper/utils";
import VueSlickCarousel from "vue-slick-carousel";
import nmImage from "./common/nm-image.vue";

export default {
  data() {
    return {
      slickOptions: {
        arrows: false,
        dots: false,
        swipeToSlide: true,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 4,
              slidesToScroll: 4,
            },
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            },
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            },
          },
        ],
      },
      selectedSlideIndex: 0,
    };
  },
  components: {
    "nm-image": nmImage,
    VueSlickCarousel,
  },
  props: {
    similars: {
      type: Array,
    },
  },
  methods: {
    detectMobileWidth,
    getImageUrl(url) {
      return url;
    },
    setActiveSlide(index) {
      this.$refs.slick[0].goTo(index);
    },
    prevSlide() {
      if (detectMobileWidth()) {
        this.$refs.slick[0].goTo(
          this.$refs.slick[0].$refs.innerSlider.currentSlide - 1
        );
      } else {
        this.$refs.slick[0].goTo(
          this.$refs.slick[0].$refs.innerSlider.currentSlide - 4
        );
      }
    },
    nextSlide() {
      if (detectMobileWidth()) {
        this.$refs.slick[0].goTo(
          this.$refs.slick[0].$refs.innerSlider.currentSlide + 1
        );
      } else {
        this.$refs.slick[0].goTo(
          this.$refs.slick[0].$refs.innerSlider.currentSlide + 4
        );
      }
    },
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
    getPrice(product, key) {
      if (product && product.price) {
        return product.price[key].min !== product.price[key].max
          ? this.$options.filters.currencyformat(product.price[key].min) +
              " - " +
              this.$options.filters.currencyformat(product.price[key].max)
          : this.$options.filters.currencyformat(product.price[key].min);
      }
    },
    hasDiscount(product) {
      return (
        this.getPrice(product, "effective") !== this.getPrice(product, "marked")
      );
    },
  },
};
</script>
<style lang="less" scoped>
@import "../../../node_modules/vue-slick-carousel/dist/vue-slick-carousel.css";
@import "../../../node_modules/vue-slick-carousel/dist/vue-slick-carousel-theme.css";
::-webkit-scrollbar {
  display: none;
}
.similiar-container {
  padding: 20px 0 0 0;
  @media @mobile {
    padding: 0;
    margin-top: 30px;
  }
  .similiar-title {
    font-weight: bold;
    font-size: 20px;
    padding-left: 10px;
  }
  .similiar-desc {
    padding: 10px 0 0 0;
    padding-left: 10px;
  }
  .similar-image-carousel {
    position: relative;
    .item {
      .container {
        .product-container {
          padding: 10px;
          color: #000000;
          text-align: center;
          &:hover {
            color: #ff0000;
          }
          .image-container {
            max-height: 425px;
            min-height: 425px;
            display: flex;
            align-items: center;
            /deep/ .nm__img{
              max-width: 100%;
              max-height: 100%;
            }
          }
          .details-container {
            padding: 10px 0px;
            .spacing {
              .product-title {
                font-size: 15px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .price-box {
                font-size: 14px;
                .strike-through {
                  text-decoration: line-through;
                  color: #cacaca;
                }
                .product-total-discount {
                  padding: 0 10px;
                }
                .sales {
                  padding: 5px 0;
                  font-weight: 400;
                  .value {
                    font-size: 15px;
                    font-weight: bold;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.arrows {
  .next-arrow,
  .prev-arrow {
    position: absolute;
    top: 50%;
    background: transparent;
    transform: translateY(-50%);
    background: none;
    z-index: 1;
    cursor: pointer;
    margin: auto;
    border: 1px solid #ddd;
    box-shadow: 0 1px 5px 0 #d4d4d4;
    padding: 24px 8px;
    background: #ffffff;
    &:hover {
      opacity: 0.8;
    }
  }
  .next-arrow {
    right: 5px;
    &::after {
      content: "\f105";
      font: 40px/1 FontAwesome;
    }
    @media @mobile {
      right: 2px;
    }
  }
  .prev-arrow {
    left: 5px;
    &::after {
      content: "\f104";
      font: 40px/1 FontAwesome;
    }
    @media @mobile {
      left: 2px;
    }
  }
}
</style>
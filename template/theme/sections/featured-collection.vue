<template>
  <div class="section-main-container">
    <h2
      v-if="settings.props.title.value.length > 0"
      class="section-heading"
      :style="'color:' + global_config.props.text_heading_link_color"
    >
      {{ settings.props.title.value }}
    </h2>
    <template v-if="products.items && products.items.length > 0">
      <div
        class="section-carousel"
        v-if="settings.props.layout.value === 'horizontal'"
      >
        <div class="glide-cont" :class="'glide' + _uid" ref="glide">
          <div data-glide-el="track" class="glide__track">
            <div
              class="glide__slides"
              :class="{ 'ssr-slides-box': !checkisBrowser() && !isMounted }"
            >
              <div
                class="glide__slide"
                v-for="(product, index) in products.items"
                :key="index"
              >
                <fdk-link :link="`/product/${product.slug}`" v-if="product">
                  <div class="product-card">
                    <div class="img">
                      <emerge-image
                        v-if="product && product.medias[0]"
                        :src="
                          product.medias.length > 0 ? product.medias[0].url : ''
                        "
                        :sources="[{ width: 492 }]"
                        :title="product.name"
                        :alt="product.name"
                      />
                      <fdk-placeholder v-else type="product-2" />
                    </div>
                    <div class="details">
                      <div
                        class="title"
                        :style="
                          `color: ${global_config.props.text_heading_link_color}`
                        "
                        :title="product.name"
                      >
                        {{ product.name }}
                      </div>
                      <div class="price">
                        <span
                          class=""
                          :style="
                            hasDiscount(product)
                              ? 'color:' +
                                global_config.props.text_sale_price_color
                              : 'color:' + global_config.props.text_price_color
                          "
                        >
                          {{ product.price.effective.currency_symbol }}
                          {{ getPrice(product, "effective") }}
                        </span>
                        <span
                          :style="
                            'color:' +
                              global_config.props.text_strikethrough_price_color
                          "
                          v-if="hasDiscount(product)"
                          class="price-marked strikethrough"
                        >
                          {{ product.price.marked.currency_symbol }}
                          {{ product.price.marked.max }}
                        </span>
                        <span
                          class="product-total-discount"
                          v-if="hasDiscount(product)"
                        >
                          <span class="">{{ product.discount }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </fdk-link>
                <fdk-placeholder v-else type="product-2" />
              </div>
            </div>
          </div>
          <div
            class="glide__bullets"
            data-glide-el="controls[nav]"
            v-if="
              products.items &&
                products.items.length > settings.props.items_per_row.value
            "
          >
            <button
              class="glide__bullet"
              :data-glide-dir="'=' + entry"
              v-show="checkGlide(entry, settings.props.items_per_row.value)"
              v-for="(entry, index) in glidePaginate(
                products.items.length,
                settings.props.items_per_row.value
              )"
              :key="index"
            ></button>
          </div>
          <div class="arrows" v-if="!this.settings.props.autoplay.value">
            <section>
              <div
                class="prev-btn btn-nav-cat"
                ref="prevArrow"
                @click="prevSlide"
              >
                <div class="icon icon-prev"></div>
              </div>
              <div
                class="next-btn btn-nav-cat"
                ref="nextArrow"
                @click="nextSlide"
              >
                <div class="icon icon-next"></div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div
        class=""
        v-if="
          products.items &&
            products.items.length > 0 &&
            settings.props.layout.value === 'grid'
        "
      >
        <group-list
          :cardlist="products.items"
          :cardtype="'PRODUCT'"
          :itemcount="settings.props.items_per_row.value"
          :global_config="global_config"
        ></group-list>
      </div>
    </template>
    <template v-else-if="products.items && products.items.length === 0">
      <placeholder-items
        :count="10"
        :items_per_row="settings.props.items_per_row.value"
        type="product-2"
        text="Product"
        :layout="settings.props.layout.value"
      />
    </template>
  </div>
</template>
<!-- #region  -->

<settings>
{
    "name":"featured_collection",
    "label":"Featured Collection",
    "props":[
        {
            "type": "text",
            "id": "title",
            "default": "Featured Collection",
            "label": "Title"
        },
         {
            "type": "collection",
            "id": "collection",
            "label": "Collection",
            "info":"Select a collection to display its products"
        },
        {
            "type": "range",
            "id": "items_per_row",
            "min": 2,
            "max": 5,
            "step": 1,
            "unit": "",
            "label": "Products per row",
            "default": 2,
            "info": "Maximum items allowed per row"
        },
        {
          "id": "layout",
          "type": "select",
          "options": [
            {
              "value": "grid",
              "text" : "Grid View"
            },
            {
              "value": "horizontal",
              "text" : "Horizontal View"
            }
          ],
          "default": "horizontal",
          "label": "Layout",
          "info":"Alignment of content"
        },
      {
          "type": "checkbox",
          "id": "autoplay",
          "default": false,
          "label": "AutoPlay Slides",
          "info":"Check to autoplay slides"
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
      }
    ]
}

</settings>
<!-- #endregion -->
<script>
import { isBrowser, isNode } from "browser-or-node";
import { detectMobileWidth, glidePaginate } from "../helper/utils";
import Glide from "@glidejs/glide";
import "../../node_modules/@glidejs/glide/dist/css/glide.core.min.css";
import "../../node_modules/@glidejs/glide/dist/css/glide.theme.min.css";
import emergeImage from "./../global/components/common/emerge-image.vue";
import groupList from "./../global/components/group-list.vue";
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";

export default {
  props: ["settings", "apiSDK", "serverProps", "global_config"],
  components: {
    "group-list": groupList,
    "emerge-image": emergeImage,
    "placeholder-items": placeholderItemsVue,
  },
  initializeServerProps({ apiSDK, settings }) {
    const collection = settings?.props?.collection?.value;

    return apiSDK.catalog
      .getCollectionItemsBySlug({
        slug: collection,
      })
      .then((res) => {
        return res || {};
      })
      .catch((e) => console.log(e));
  },
  watch: {
    settings: function(newVal, oldVal) {
      if (newVal.props.collection.value !== oldVal.props.collection.value) {
        this.products = [];
      }
      this.cleanupComponent();
      this.initializeComponent();
    },
  },
  mounted() {
    this.initializeComponent();
  },
  data: function() {
    return {
      products: this.serverProps || [],
      isMounted: false,
      glideOptions: {
        type: "carousel",
        startAt: 0,
        gap: 30,
        perView: this.settings.props.items_per_row.value,
        breakpoints: {
          1024: {
            perView: 3,
          },
          600: {
            perView: 2,
          },
          480: {
            perView: 1,
          },
        },
      },
      carouselHandle: null,
    };
  },
  methods: {
    checkGlide(a, b) {
      if (a && b) {
        return parseInt(a) % b === 0 ? true : false;
      }
    },
    checkisBrowser() {
      return isBrowser;
    },
    glidePaginate,
    getProducts(slug) {
      if (slug) {
        return this.$apiSDK.catalog.getCollectionItemsBySlug({
          slug: slug,
        });
      } else {
        return Promise.resolve([]);
      }
    },
    getPrice(product, key) {
      if (product && product.price) {
        return product.price[key].min !== product.price[key].max
          ? product.price[key].min + " - " + product.price[key].max
          : product.price[key].min;
      }
    },
    hasDiscount(product) {
      return (
        this.getPrice(product, "effective") !== this.getPrice(product, "marked")
      );
    },
    prevSlide() {
      // item_count variable holds the value of number of items to show
      let item_count = this.settings.props.items_per_row.value;

      if (detectMobileWidth()) {
        if (this.carouselHandle.index - 1 >= 0) {
          this.carouselHandle.go(`=${this.carouselHandle.index - 1}`);
        }
      } else {
        if (this.carouselHandle.index - item_count >= 0) {
          this.carouselHandle.go(`=${this.carouselHandle.index - item_count}`);
        } else {
          this.carouselHandle.go(`<<`);
        }
      }
    },
    nextSlide() {
      let item_count = this.settings.props.items_per_row.value;
      if (detectMobileWidth()) {
        ///this.categories.length has to be replaced by the length of items in carousel
        if (this.carouselHandle.index + 1 >= this.products?.items.length - 1) {
          this.carouselHandle.go(`=${this.carouselHandle.index + 1}`);
        }
      } else {
        if (
          this.carouselHandle.index + item_count <
          this.products?.items.length
        ) {
          this.carouselHandle.go(`=${this.carouselHandle.index + item_count}`);
        } else {
          this.carouselHandle.go(`>>`);
        }
      }
    },
    initCarousel() {
      //if IsNode OR Layout is horizontal(optional flag) OR carouselHandle(carousel) is not already initialized
      if (
        isNode ||
        this.settings.props.layout.value !== "horizontal" ||
        this.carouselHandle
      ) {
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

    initializeComponent() {
      if (window.screen.width > 600 && window.screen.width <= 1024) {
        this.settings.props.items_per_row.value = 3;
      } else if (window.screen.width > 480 && window.screen.width <= 600) {
        this.settings.props.items_per_row.value = 2;
      } else if (window.screen.width <= 480) {
        this.settings.props.items_per_row.value = 1;
      }
      this.glideOptions.perView = this.settings.props.items_per_row.value;

      if (this.settings.props.autoplay.value) {
        this.glideOptions.autoplay =
          this.settings.props.slide_interval.value * 1000;
      } else {
        this.glideOptions.autoplay = false;
      }
      if (this.products.length == 0) {
        const collection = this.settings?.props?.collection?.value;

        this.getProducts(collection)
          .then((results) => {
            this.products = results || {};
            this.isMounted = true;
            this.initCarousel();
          })
          .catch((e) => console.log(e));
      } else {
        this.isMounted = true;
        this.initCarousel();
      }
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

<style lang="less" scoped>
.item {
  .product-image {
    width: 100%;
  }
  .product-brand {
    font-size: 12px;
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .product-name {
    font-size: 18px;
    margin-top: 5px;
    font-weight: 700;
  }

  .price {
    margin-top: 10px;
    font-size: 14px;
    .strike-through {
      text-decoration: line-through;
      color: #cacaca;
    }
    .product-total-discount {
      padding: 0 10px;
    }
    .sales {
      font-weight: 400;
      .value {
        font-size: 15px;
        font-weight: bold;
      }
    }
  }
}
// .section-heading {
//   font-weight: 400;
// }
.section-carousel {
  position: relative;
  // padding: 30px 0 0 0;
  @media @tablet {
    // padding: 30px 70px;
  }
  @media @mobile {
    // padding: 24px 0 0 0;
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
  .prev-btn {
    margin-right: 22px;
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
  .glide__slide {
    height: auto;
    a {
      display: flex;
      height: 100%;
      justify-content: center;
    }
  }
  .glide__slides.ssr-slides-box {
    touch-action: unset;
    overflow-x: auto;
    .glide__slide {
      margin-right: 30px;
      width: auto;
      max-width: 384px;
    }
  }
  .btn-nav-cat {
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

  .product-card {
    background-color: #fff;
    overflow: hidden;
    cursor: pointer;
    // margin-right: 15px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .img {
      transition: all 0.4s;
      min-height: 300px;

      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: @White;
      height: 100%;
      @media @tablet {
        min-height: 250px;
      }
      @media @mobile {
        min-height: 200px;
      }
      img {
        width: 100%;
        max-width: 100%;
      }
    }
    .details {
      height: 90px;
      box-sizing: border-box;
      padding: 15px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      .title {
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        line-height: 27.2px;
      }
      .price {
        font-size: 14px;
        display: flex;
        justify-content: center;
        margin-top: 5px;
        letter-spacing: 2px;
        flex-wrap: wrap;
        > span {
          display: inline-block;
          padding-right: 10px;
        }
        .product-total-discount {
          color: #ee478d;
        }
        .strikethrough {
          text-decoration: line-through;
        }
        .price-marked {
          font-weight: 600;
          color: #c33;
        }
      }
    }
  }
  // .product-card:not(:last-child) {
  //   margin-right: 20px;
  // }
  .product-card:hover .img {
    opacity: 0.7;
  }
}
</style>

<template>
  <fdk-product-card>
    <template slot-scope="productData">
      <div class="product" data-pid="00ADS3083AC">
        <div
          class="product-tile"
          itemscope
          itemtype="http://schema.org/Product"
        >
          <div class="image-container">
            <fdk-link
              class="tile-image-link pointer"
              :href="'/product/' + product.slug"
              tabindex="0"
              :title="product.name"
            >
              <img
                class="tile-image"
                v-bind:src="getImageURL"
                :alt="product.name"
                :title="product.name"
                :style="{ backgroundColor: getProductColor }"
                itemprop="image"
              />
            </fdk-link>
            <div class="discount-container" v-if="product.discount">
              <div class="discount">
                <div class="special-offer-text bold-xxxxs">
                  {{ product.discount }}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="product-desc">
              <!-- Product Rating -->
              <div style="height: 27px;">
                <fy-rating v-if="product.rating" :rating="product.rating"></fy-rating>
              </div>

              <!-- End of Product Rating -->
              <h5 class="wrap-text">
                <b class="bold-xs cl-Mako brand-name" :style="'color:' + global_config.props.text_heading_link_color">{{ product.brand.name }}</b>
                <span class="regular-xxs cl-DoveGray text-seperator">|</span>
                <span class="regular-xxs cl-DoveGray" :style="'color:' + global_config.props.text_heading_link_color">{{ product.name }}</span>
              </h5>
              <div>
                <span class="regular-xs cl-Profit">
                  <span v-if="product.price && product.price.effective" 
                  :style="hasDiscount() ? 'color:' + global_config.props.text_sale_price_color : 'color:' + global_config.props.text_price_color">
                    {{ getProductPrice("effective") | currencyformat }}</span
                  >
                </span>
                <span
                  class="regular-xxxs text-seperator"
                  v-if="getProductPrice('effective') !== getProductPrice('marked')"
                ></span>
                <span
                  :style="'color:' + global_config.props.text_strikethrough_price_color"
                  class="strike-through regular-xxxs cl-DustyGray2"
                  v-if="getProductPrice('effective') !== getProductPrice('marked')"
                >
                  {{ product.price.marked.max | currencyformat }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </fdk-product-card>
</template>

<script>
import fyrating from "./../../../global/components/fy-rating.vue";
const PLACEHOLDER_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC";
export default {
  props: {
    product: {},
    context: {},
    global_config: {},
  },
  components: {
    "fy-rating": fyrating,
  },
  data() {
    return {
      imageLoading: false,
      imageFullyLoaded: false,
    };
  },
  methods: {
    getProductPrice(key) {
      if (this.product.price) {
        return this.$options.filters.currencyformat(
          this.product.price[key].min
        );
      }
      return "";
    },
    imageLoaded(event) {
      this.imageFullyLoaded = true;
    },
    stopRouting: function stopRouting(event) {
      event.stopPropagation();
      event.preventDefault();
    },
    getPrice(key) {
      if (this.product.price) {
        return this.product.price[key].min !== this.product.price[key].max
          ? this.product.price[key].min + " - " + this.product.price[key].max
          : this.product.price[key].min;
      }
    },
    hasDiscount() {
      return this.getPrice("effective") !== this.getPrice("marked");
    },
  },
  computed: {
    getProductColor() {
      return this.product.attributes
        ? "#" + this.product.primary_color_hex
        : "";
    },
    getImageURL() {
      let imageURL =
          this.product && this.product.medias.length > 0
        ? this.product.medias[0].url
        : "";

      if (this.imageFullyLoaded) {
        return imageURL;
      }
      if (imageURL && !this.imageLoading) {
        let img = new Image();
        img.src = imageURL;
        img.onload = this.imageLoaded.bind(this);
        this.imageLoading = true;
      }
      return PLACEHOLDER_SRC;
    },
  },
};
</script>

<style scoped lang="less">
.product {
  * {
    
  }
}
.fy-lazy-img {
  transition: all 0.5s ease-in-out;
  -webkit-transform: scale(1);
  transform: scale(1);
  background-repeat: no-repeat;
  background-position: center;
  background-blend-mode: darken;
  background-size: contain;
  background-color: #f1f0ee;
  max-width: 100%;
  max-height: 100%;
}

.background-image {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMV…AAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC);
  height: 100%;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.product-tile {
  position: relative;
}

.product-tile,
.product-tile * {
  box-sizing: border-box;
}

.product-tile .tile-body {
  min-height: 58px;
  min-height: 3.625rem;
}

.image-container {
  display: -ms-grid;
  display: grid;
  position: relative;
}

.image-container .tile-image-link {
  display: -ms-grid;
  display: grid;
}

.image-container .tile-image {
  height: auto;
  width: 100%;
  max-height: inherit;
}

.pdp-link {
  
  font-size: 0.75rem;
}

@media (min-width: 992px) {
  .pdp-link {
    line-height: 16px;
    line-height: 0.625rem;
  }
}

.pdp-link .product-link {
  display: inline-block;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
  line-height: 16px;
  line-height: 1rem;
  text-transform: underline;
  cursor: pointer;
}

@media (min-width: 992px) {
  .pdp-link .product-link {
    font-size: 0.875rem;
    line-height: 18px;
    line-height: 1.125rem;
  }
}

.tile-promo__extra-info,
.product-color {
  color: #000;
  text-transform: uppercase;
  display: block;
  font-size: 0.5625rem;
  letter-spacing: 0.29px;
  letter-spacing: 0.01812rem;
  line-height: 16px;
  line-height: 0.625rem;
  padding-top: 4px;
  padding-top: 0.25rem;
}

@media (min-width: 992px) {
  .tile-promo__extra-info,
  .product-color {
    font-size: 0.625rem;
    letter-spacing: 0.42px;
    letter-spacing: 0.02625rem;
    padding-top: 9px;
    padding-top: 0.5625rem;
    line-height: 14px;
    line-height: 0.875rem;
  }
}

.tile-promo__extra-info .product-badge-promotion__icon {
  transform: translateY(-3px);
  padding-right: 5px;
}
.tile-promo__extra-info {
  display: flex;
}

.tile-promo__extra-info,
.product-color {
  color: #000;
  text-transform: uppercase;
  display: block;
  font-size: 0.5625rem;
  letter-spacing: 0.29px;
  letter-spacing: 0.01812rem;
  line-height: 16px;
  line-height: 0.625rem;
  padding-top: 4px;
  padding-top: 0.25rem;
}

@media (min-width: 992px) {
  .tile-promo__extra-info,
  .product-color {
    font-size: 0.625rem;
    letter-spacing: 0.42px;
    letter-spacing: 0.02625rem;
    padding-top: 9px;
    padding-top: 0.5625rem;
    line-height: 14px;
    line-height: 0.875rem;
  }
}

.tile-promo__extra-info .product-badge-promotion__icon {
  transform: translateY(-3px);
}

.price {
  font-size: 0.75rem;
}

@media (min-width: 992px) {
  .price {
    font-size: 0.875rem;
    line-height: 14px;
    line-height: 0.875rem;
  }
}

.price .strike-through {
  text-decoration: line-through;
  color: #cacaca;
  margin-right: 0;
}

.price .product-total-discount {
  color: #cacaca;
  padding: 0 12px;
  padding: 0 0.75rem;
}

.price .sales {
  font-weight: 400;
}

.video-container {
  display: -ms-grid;
  display: grid;
  position: relative;
}

.product-video {
  width: 100%;
  display: block;
}

.product-badge {
  position: absolute;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 18px;
  line-height: 1.125rem;
  letter-spacing: 0.31px;
  letter-spacing: 0.01937rem;
  padding: 0 5px;
  padding: 0 0.3125rem;
  z-index: 0;
  text-transform: uppercase;
  overflow: hidden;
}

.product-badge-top {
  background-color: #000;
  color: #fff;
}

.product-badge-middle {
  top: 50%;
  color: #fff;
  background-color: #c31212;
  width: 100%;
  text-align: center;
}

.product-badge-middle-rotate {
  display: inline-block;
  position: relative;
  width: inherit;
  animation: badgerotate 6s linear 2s infinite;
  transform: translateX(-100%);
}

@media (min-width: 768px) and (max-width: 991.98px) {
  .product-badge-middle-rotate {
    animation: badgerotate 12s linear 2s infinite;
  }
}

@media (min-width: 1200px) {
  .product-badge-middle-rotate {
    animation: badgerotate 12s linear 2s infinite;
  }
}

.product-badge-bottom {
  bottom: 0;
  left: 0;
  background-color: #000;
  color: #fff;
}

.product-badge-promotion {
  margin: 0;
  display: block;
}

.product-badge-promotion p {
  margin: 0;
  line-height: 18px;
  line-height: 1.125rem;
  letter-spacing: 0.31px;
  letter-spacing: 0.01937rem;
  padding: 0;
}

.product-badge--upper {
  bottom: 1.875rem;
}

@keyframes badgerotate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.product-desc {
  // padding: 8px 0 0 6px;
  display: block;
  .wrap-text {
    text-overflow: ellipsis;
    overflow: hidden;
    width: 99%;
    height: 1.2em;
    white-space: nowrap;
  }
  .text-seperator {
    padding: 0 5px;
  }
  .rupeeSymbol {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    font-size: 10px;
    color: inherit;
    padding: 0 2px 0 0;
  }
  .cl-Profit {
    color: #fb406b;
  }

  .strike-through {
    text-decoration: line-through;
  }
}
.discount-container {
  position: absolute;
  bottom: 3px;
  color: white;
  width: 100%;
  height: 25px;
  .discount {
    background: url("../../../assets/images/special-badge.png")
      bottom left no-repeat;
  }
  .special-offer-text {
    text-align: left;
    line-height: 25px;
    padding-left: 8px;
  }
}


</style>

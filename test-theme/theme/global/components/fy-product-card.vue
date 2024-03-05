<template>
  <fdk-product-card class="product-card-container">
    <template slot-scope="productData">
      <div
        class="product-card animated fadeIn"
        :class="{ 'disable-cursor': !product.sellable }"
        @mouseover="showSizeContainer()"
        @mouseleave="closeSizeContainer()"
        @click="shouldRedirect()"
      >
        <div class="overlay" v-if="disable"></div>
        <fdk-accounts>
          <template slot-scope="accountsData">
            <div
              class="wishlist-container"
              v-if="showWishlist && isMounted"
              @click.prevent="
                accountsData.is_logged_in
                  ? onClickWishlist($event, productData, product)
                  : accountsData.openLogin()
              "
            >
              <div v-if="product.follow" style="text-align: center">
                <!-- wishlist Pink -->
                <svg-wrapper :svg_src="'wishlist-active'"></svg-wrapper>
              </div>
              <div v-else style="text-align: center">
                <!-- Wishlist Transparent -->
                <svg-wrapper :svg_src="'wishlist'"></svg-wrapper>
              </div>
            </div> </template
        ></fdk-accounts>

        <div class="product-image">
          <emerge-image
            :src="imageUrl"
            :alt="imageAlt"
            class="imgClass"
            :sources="[
                    { breakpoint: { min: 1024 }, width: 360 },
                    { breakpoint: { min: 769 }, width: 360 },
                    { breakpoint: { max: 768 }, width: 360 },
                    { breakpoint: { max: 480 }, width: 360 },
                  ]"
          />
        </div>
      </div>
      <div
        class="discount-container"
        v-if="product.discount && product.sellable"
      >
        <div class="discount">
          <div class="special-offer-text bold-xxxxs">
            {{ product.discount }}
          </div>
        </div>
      </div>
      <div class="out-of-stock-container" v-if="!product.sellable">
        <div class="out-of-stock">
          <div class="out-of-stock-text bold-xxxxs">SOLD OUT</div>
        </div>
      </div>
      <div
        class="product-desc"
        :class="{ 'disable-cursor': !product.sellable }"
      >
        <!-- Product Rating -->
        <div style="height: 20px" v-if="product.rating">
          <fy-rating :rating="product.rating"></fy-rating>
        </div>
        <!-- End of Product Rating -->
        <div class="card-desc">
          <h6
            v-if="!hideBrandName"
            class="ukt-title"
            :style="`color: ${global_config.props.text_heading_link_color}`"
          >
            {{ product.brand.name }}
          </h6>
          <div
            class="info regular-xxxs"
            :style="`color: ${global_config.props.text_heading_link_color}`"
            :title="product.name"
          >
            {{ product.name }}
          </div>
          <div class="price">
            <span class="effective-price">
              <div>
                <span class="regular-xs cl-Profit">
                  <span
                    v-if="product.price.effective"
                    :style="
                      getProductPrice('effective') !== getProductPrice('marked')
                        ? 'color:' + global_config.props.text_sale_price_color
                        : 'color:' + global_config.props.text_price_color
                    "
                  >
                    {{
                      getListingPrice("effective") ||
                      getProductPrice("effective")
                    }}</span
                  >
                </span>
                <span
                  class="regular-xxxs text-seperator"
                  v-if="
                    getProductPrice('effective') !== getProductPrice('marked')
                  "
                ></span>
                <span
                  :style="
                    'color:' +
                    global_config.props.text_strikethrough_price_color
                  "
                  class="strike-through regular-xxxs cl-DustyGray2"
                  v-if="
                    getProductPrice('effective') !== getProductPrice('marked')
                  "
                >
                  {{ getListingPrice("marked") || getProductPrice("marked") }}
                </span>
              </div>
            </span>
          </div>
        </div>
      </div>
    </template>
  </fdk-product-card>
</template>


<script>
import fyrating from "./../../global/components/fy-rating.vue";
import { isBrowser } from "browser-or-node";
import emergeImage from "../../global/components/common/emerge-image.vue";
import SvgWrapper from "./../../components/common/svg-wrapper.vue";

export default {
  components: {
    "fy-rating": fyrating,
    "emerge-image": emergeImage,
    "svg-wrapper": SvgWrapper,
  },
  props: {
    product: {},
    showWishlist: {
      type: Boolean,
      default: false,
    },
    isWishListPage: {
      type: Boolean,
      default: false,
    },
    activeProductId: {
      default: 0,
    },
    global_config: {},
    listing_price_config: {
      type: String,
    },
    page_config: {},
  },

  mounted() {
    this.isMounted = true;
  },
  data() {
    return {
      disable: false,
      isMounted: false,
    };
  },
  methods: {
    onClickWishlist(event, productData, product) {
      this.isWishlist();
      productData.updateWishList(event, product);
    },
    getListingPrice(key) {
      let price = "";
      switch (this.listing_price_config) {
        case "min":
          price = this.$options.filters.currencyformat(
            this.product.price[key].min
          );
          break;
        case "max":
          price = this.$options.filters.currencyformat(
            this.product.price[key].max
          );
          break;
        case "range":
          //not handling this as its the default behaviour of getProductPrice
          break;
        default:
          break;
      }
      return price;
    },
    getProductPrice(key) {
      if (this.product.price) {
        return this.product.price[key].min !== this.product.price[key].max
          ? this.$options.filters.currencyformat(this.product.price[key].min) +
              " - " +
              this.$options.filters.currencyformat(this.product.price[key].max)
          : this.$options.filters.currencyformat(this.product.price[key].min);
      }
      return "";
    },
    closeSizeContainer() {
      if (!this.showSizes) {
        this.product.is_active = false;
        // this.$forceUpdate();
      }
    },
    showSizeContainer() {
      this.product.is_active = true;
      // this.$forceUpdate();
    },
    shouldRedirect() {
      if (this.showSizes) {
        event.preventDefault();
      }
    },
    isWishlist() {
      if (this.isWishListPage) {
        this.disable = true;
      }
    },
  },
  computed: {
    hideBrandName() {
      return this.page_config?.props?.hidebrandname;
    },
    imageUrl() {
      return this.product && this.product.medias.length > 0
        ? this.product.medias[0].url
        : "";
    },
    imageAlt() {
      return (
        this.product?.medias?.[0]?.alt ||
        `${this.product.brand.name} | ${this.product.name}`
      );
    },
    showSizes: {
      get: function () {
        return this.product.uid === this.activeProductId;
      },
    },
  },
};
</script>

<style scoped lang="less">
.opacity-card {
  opacity: 0.5;
}
/deep/.imgClass {
  .fy__img {
    border-radius: 2px;
  }
}

.product-card-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
  position: relative;
  border: 1px solid #e4e5e6;
}

.product-card {
  width: 100%;
  position: relative;
  border-radius: 5%;
  cursor: pointer;

  .overlay {
    background: white;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0.6;
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }

  .product-image {
    border-radius: 0;
    overflow: hidden;
    // min-height: 286px;
    height: 302px;
    display: flex;
    align-items: center;
    justify-content: center;
    @media @mobile {
      height: 242px;
    }
    @media @sm-mobile {
      height: 242px;
    }
  }
}
.infinite-list {
  .product-image {
    min-height: 386px;
    @media @mobile {
      height: unset;
      min-height: 300px;
    }
    @media @sm-mobile {
      height: unset;
      min-height: 255px;
    }
  }
}
.wishlist-container {
  width: 20%;
  height: 10%;
  position: absolute;
  top: 0;
  display: block;
  left: 0;
  z-index: 1;
  padding: 10px 0;
  cursor: pointer;
}
.discount-container {
  position: absolute;
  bottom: 27%;
  color: white;
  width: 100%;
  height: 25px;
  @media @mobile {
    bottom: 32%;
  }
}
.discount {
  background: url("../../assets/images/special-badge.png") bottom left no-repeat;
}
.special-offer-text {
  text-align: left;
  line-height: 25px;
  padding-left: 8px;
}
.out-of-stock-container {
  position: absolute;
  bottom: 27%;
  color: red;
  width: 100%;
  height: 25px;
  @media @mobile {
    bottom: 32%;
  }
}
.out-of-stock {
  background: url("../../assets/images/special-badge-white.png") bottom left
    no-repeat;
}
.out-of-stock-text {
  text-align: left;
  line-height: 25px;
  padding-left: 8px;
}

.product-desc {
  // padding: 8px 0 0 6px;
  display: block;
}
.wrap-text {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 99%;
  height: 1.2em;
  white-space: nowrap;
}
.card-desc {
  margin-top: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
  padding: 5px 10px 5px 10px;
  box-sizing: border-box;
  .ukt-title {
    font-weight: bold;
    // color: #41434C;
    font-size: 14px;
  }
  .info {
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    padding: 5px 0 2px 0;
    white-space: normal;
    box-sizing: border-box;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-height: normal;
  }
  .price {
    text-align: left;
    padding: 5px 0;
  }
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
  // color: #fb406b;
}

.strike-through {
  text-decoration: line-through;
}
.disable-cursor {
  cursor: not-allowed !important;
}
</style>

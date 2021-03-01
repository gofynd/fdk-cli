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
            <div
              class="product-badge product-badge-bottom product-badge-promotion"
              style="background-color: #1D6A9E; "
              v-if="product.attributes.discount"
            >
              {{ product.attributes.discount }}
            </div>
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
          </div>
          <div class="tile-body">
            <div
              class="tile-promo__extra-info"
              v-if="product.attributes.discount"
            >
              <!-- <img
              class="product-badge-promotion__icon"
              src="https://shop.diesel.com/on/demandware.static/-/Sites/default/dwe9c94b6c/icons/lock-opened.svg"
              alt
              aria-hidden="true"
            /> -->
              <span style="color: #1D6A9E; ">{{
                product.attributes.discount
              }}</span>
            </div>
            <div
              class="tile-promo__extra-info"
              v-if="product.attributes.primary_color"
            >
              <div class="product-color">
                {{ product.attributes.primary_color }}
              </div>
            </div>
            <div></div>
            <div class="pdp-link" itemprop="name">
              <fdk-link
                class="product-link"
                :href="'/product/' + product.slug"
                title="Bootcut - Zatiny"
                tabindex="0"
                itemprop="url"
                >{{ product.name }}</fdk-link
              >
            </div>
            <div
              class="price"
              itemprop="offers"
              itemscope
              itemtype="http://schema.org/Offer"
            >
              <span>
                <meta
                  itemprop="priceCurrency"
                  :content="product.price.marked.currency_code"
                  v-if="hasDiscount()"
                />
                <span class="strike-through list" v-if="hasDiscount()">
                  <span
                    class="value"
                    itemprop="price"
                    :content="product.price.marked.max"
                  >
                    {{ product.price.marked.currency_symbol }}
                    {{ product.price.marked.max }}
                  </span>
                </span>
                <span class="product-total-discount list" v-if="hasDiscount()">
                  <span class="value">{{ product.discount }}</span>
                </span>
                <span class="sales" v-if="product.price">
                  <span
                    class="value"
                    itemprop="price"
                    :content="getPrice('effective')"
                    >{{ product.price.effective.currency_symbol }}
                    {{ getPrice('effective') }}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- <template slot-scope="productData">
      <div class="product-card animated fadeIn">
        <div
          class="wishlist-container"
          v-if="context.isLoggedIn"
          @click="productData.updateWishList($event, product)"
        >
          <div v-if="product.follow" style="text-align:center">
            <img src="./../../assets/images/heart-filled.svg" />
          </div>
          <div v-else style="text-align:center">
            <img src="./../../assets/images/heart-empty.svg" />
          </div>
        </div>
        <fdk-accounts class="wishlist-container" v-else-if="!context.isLoggedIn">
          <template slot-scope="accountsData">
            <div @click="accountsData.openLogin(); stopRouting($event)" style="text-align:center">
              <img src="./../../assets/images/heart-empty.svg" />
            </div>
          </template>
        </fdk-accounts>

        <div class="product-image">
          <img
            class="fy-lazy-img background-image"
            :style="{ backgroundColor: getProductColor }"
            v-bind:src="getImageURL"
          />
        </div>
      </div>
      <div class="product-desc">
        <p class="product-name">{{ product.name }}</p>
        <p class="price">₹ {{ product.price.marked.max }}</p>
      </div>
    </template> -->
  </fdk-product-card>
</template>

<script>
const PLACEHOLDER_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC';
export default {
  props: {
    product: {},
    context: {},
  },

  mounted() {},
  data() {
    return {
      imageLoading: false,
      imageFullyLoaded: false,
    };
  },
  methods: {
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
          ? this.product.price[key].min + ' - ' + this.product.price[key].max
          : this.product.price[key].min;
      }
    },
    hasDiscount() {
      return this.getPrice('effective') !== this.getPrice('marked');
    },
  },
  computed: {
    getProductColor() {
      return this.product.attributes
        ? '#' + this.product.primary_color_hex
        : '';
    },
    getImageURL() {
      let imageURL =
        this.product && this.product.images
          ? this.product.images[0].secure_url
          : '';
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
// .product-card {
//   width: 100%;
//   position: relative;
//   cursor: pointer;
// }
// .wishlist-container {
//   position: absolute;
//   z-index: 1;
//   right: 15px;
//   top: 15px;
// }
.product {
  * {
    font-family: Roboto, sans-serif;
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
  /* // display: block; remove extra space below image */
}

.background-image {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMV…AAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC);
  height: 100%;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

// .product-desc {
//   display: block;
//   letter-spacing: 0.14px;
//   line-height: 23px;
//   padding: 12px 5px 5px 5px;

//   .product-name {
//     font-size: 20px;
//     margin-bottom: 8px;
//   }
//   .price {
//     font-size: 14px;
//     font-weight: bold;
//     letter-spacing: 0.71px;
//     line-height: 17px;
//   }
//   @media screen and (max-width: 768px) {
//     .product-name {
//       font-size: 15px;
//       margin-bottom: 5px;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//     }
//   }
// }

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
  font-family: Roboto, sans-serif;
  font-size: 0.75rem;
}

@media (min-width: 992px) {
  .pdp-link {
    line-height: 16px;
    line-height: 1rem;
  }
}

.pdp-link .product-link {
  display: inline-block;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  font-family: Roboto, sans-serif;
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
  line-height: 1rem;
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
  line-height: 1rem;
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
  font-family: roboto condensed, sans-serif;
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
</style>

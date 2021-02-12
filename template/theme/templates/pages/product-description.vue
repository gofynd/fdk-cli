<template>
  <div
    class="container-fluid product-detail product-wrapper back-in-stock-notification"
    v-if="
      context &&
        context.product &&
        context.product.attributes &&
        context.product_meta.price
    "
  >
    <div class="row">
      <div class="col-12">
        <div class="breadcrumb-container">
          <div class="backtoplp d-none d-lg-block">
            <a
              href="#"
              class="back-to js_back-to"
              @click.prevent="$router.go(-1)"
              >Back</a
            >
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div
        class="container-fluid product-fullscreen-images-overlay "
        :class="{ active: zoom }"
      >
        <div
          class="product-fullscreen-images-wrapper "
          :class="{ active: zoom }"
        >
          <span
            class="product-fullscreen-close-button"
            role="button"
            tabindex="0"
            @click="zoomHandler(false)"
          ></span>
          <div
            class="product-fullscreen-images  "
            v-for="(image, index) in context.product.images"
            :key="'product-image-full-' + index"
          >
            <img
              :src="image.secure_url"
              :alt="context.product.name + ' Image ' + index"
              itemprop="image"
            />
          </div>
        </div>
        <div class="product-fullscreen-image-wrapper-mobile">
          <span
            class="product-fullscreen-close-button"
            role="button"
            tabindex="0"
          ></span>
          <img src="#" class="product-fullscreen-image-mobile" />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="product-images col-12 col-lg-8">
        <div class="carousel slide">
          <div
            class="swiper-container product-slider-container swiper-container-multirow"
          >
            <div
              class="swiper-wrapper product-slides col-5-5"
              role="list"
              aria-label="Product slides"
              style=" translate3d(0px, 0px, 0px);"
              v-for="(image, index) in context.product.images"
              :key="'product-image-' + index"
            >
              <a
                class="swiper-slide product-slide swiper-slide-active "
                role="listitem"
                tabindex="0"
              >
                <div class="swiper-zoom-container" @click="zoomHandler(true)">
                  <img
                    class="d-block img-fluid product-image"
                    :src="image.secure_url"
                    :alt="context.product.name + ' Image ' + index"
                    :title="
                      context.product.brand.name + ',' + context.product.name
                    "
                    itemprop="image"
                  />
                </div>
              </a>
            </div>
            <div class="swiper-pagination product-carousel-pagination"></div>
            <span
              class="swiper-notification"
              aria-live="assertive"
              aria-atomic="true"
            ></span>
          </div>
          <!-- can be used for showing product video
          <div
            class="swiper-slide product-slide product-video-wrapper"
            role="button"
            tabindex="0"
            aria-label="Open product video"
          >
            <span class="product-mobile-video-text d-lg-none">Video</span>
            <div class="product-video-slide">
              <span class="product-fullscreen-close-button" role="button" tabindex="0"></span>
              <video class="product-video" playsinline autoplay loop muted name="media">
                <source src="" type="video/mp4" />
              </video>
            </div>
          </div> -->
        </div>
      </div>
      <div class="product-content col-12 col-lg-4">
        <h1 class="product-title">{{ context.product.name }}</h1>

        <h2 class="product-short-description">
          {{ context.product.attributes.product_fit }}
        </h2>
        <fdk-share>
          <template slot-scope="share">
            <div @click="getShareLink(share)" class="share-button">
              <img src="./../../assets/images/share.svg" />
            </div>
          </template>
        </fdk-share>

        <div class="prices">
          <div
            class="price"
            itemprop="offers"
            itemscope
            itemtype="http://schema.org/Offer"
          >
            <span>
              <meta
                itemprop="priceCurrency"
                :content="context.product_meta.price.marked.currency_code"
                v-if="
                  context.product_meta.price.effective.min !=
                    context.product_meta.price.marked.min
                "
              />
              <span
                class="strike-through list"
                v-if="
                  context.product_meta.price.effective.min !=
                    context.product_meta.price.marked.min
                "
              >
                <span
                  class="value"
                  itemprop="price"
                  :content="context.product_meta.price.marked.min"
                >
                  {{
                    context.product_meta.price.marked.currency_symbol +
                      context.product_meta.price.marked.min
                  }}</span
                >
              </span>
              <span class="product-total-discount list">
                <span class="value">{{ context.product_meta.discount }}</span>
              </span>
              <meta
                itemprop="priceCurrency"
                :content="context.product_meta.price.effective.currency_code"
              />
              <span class="sales">
                <span
                  class="value"
                  itemprop="price"
                  :content="context.product_meta.price.effective.min"
                  >{{
                    context.product_meta.price.effective.currency_symbol +
                      context.product_meta.price.effective.min
                  }}</span
                >
              </span>
            </span>
          </div>
        </div>
        <div class="main-attributes"></div>
        <ul
          id="sticky-error-scroll-to"
          class="product-attributes js_product-attributes"
        >
          <li
            class="variation-attribute color"
            data-attr="color"
            data-attr-value="02"
          >
            <span class="attribute-labelff color">COLOR:</span>
            <span
              class="attribute-label-value single-val selected"
              data-attr-value="null"
              >{{ context.product.attributes.color }}</span
            >
          </li>
          <li class="variation-attribute size" data-attr="size" data-attr-value>
            <span
              class="attribute-label size"
              style="display: flex; flex-flow: row wrap; justify-content: space-between;"
              >Choose SIZE</span
            >
            <a
              class="find-your-size"
              style=""
              @click="showSizeGuide = true"
              v-if="
                context.product_meta.size_chart &&
                  context.product_meta.size_chart.sizes &&
                  context.product_meta.size_chart.sizes.length > 0
              "
            >
              <span
                class="fitanalytics__button-text"
                onmouseover='this.style.textDecoration="none";return false;'
                onmouseleave='this.style.textDecoration="underline";return false;'
                style=""
                >Find your size</span
              >
            </a>
            <fdk-pdp-size-stores ref="pdpSizeStores">
              <template slot-scope="sellerData">
                <ul class="attribute-values size">
                  <li
                    class="attribute-value"
                    tabindex="0"
                    v-for="(size, index) in context.product_meta.sizes"
                    :key="'p-size-' + index"
                    :class="{ selected: selectedSize === size.display }"
                    @click="
                      selectedSize = size.display;
                      sizeError = false;
                      loadSellerFunction = sellerData.loadSellers;
                      sizeClicked(sellerData.loadSellers);
                    "
                  >
                    <template v-if="size.is_available"
                      >{{ size.display }}
                    </template>
                  </li>
                </ul>
                <p class="error" v-if="sizeError">Select a size first</p>
                <div class="sold-by-section" v-if="showSoldByModal">
                  <span class="title">Sold By:</span>
                  <div class="seller-name">
                    {{ storeInfoSelected.store.name + ',' }}
                    {{ storeInfoSelected.seller.name }}
                    <span
                      class="bold"
                      style="cursor:pointer;font-weight:bold"
                      v-if="storeInfoSelected.store_count > 1"
                      @click="
                        showStoreModal = true;
                        loadStoreFunction = sellerData.loadStores;
                        getStores(sellerData.loadStores);
                      "
                    >
                      & {{ storeInfoSelected.store_count }} Others</span
                    >
                  </div>
                  <store-modal
                    :isOpen="showStoreModal"
                    :activeStoreInfo="storeInfo"
                    :allStoresInfo="allStoresInfo"
                    :productName="context.product.name"
                    v-on:closedialog="showStoreModal = false"
                    v-on:store-filter="updateStoreFilter"
                    v-on:store-item-select="setStoreInfo"
                  ></store-modal>
                </div>
              </template>
            </fdk-pdp-size-stores>
            <size-guide
              class="size-guide"
              v-if="context.product_meta"
              :isOpen="showSizeGuide"
              :product_meta="context.product_meta"
              @closedialog="showSizeGuide = false"
            ></size-guide>
            <span class="error-label">Please select SIZE</span>

            <div class="help light-xxs" v-if="context.isLoggedIn">
              Couldn't find your size?
              <a class="link bold-xxs" @click="showProductRequestModal = true"
                >Product Request</a
              >
            </div>
            <product-request-modal
              :isOpen="showProductRequestModal"
              :productInfo="context.product"
              :isPdpPage="true"
              v-on:closedialog="showProductRequestModal = false"
            ></product-request-modal>
          </li>
        </ul>
        <div class="js_additional-msg-container"></div>

        <div class="add-to-cart-section" style>
          <!-- <div class="d-block d-lg-none add-to-cart-section" style>
            
            <div class="d-flex add-to-cart-sticky">
              <button class="add-to-cart primary-btn"  @click="addToCart" tabindex="0">Add to bag</button>
              <div
                class="add-to-wish-list js_add-to-wish-list d-flex"
                role="button"
                tabindex="0"
              >
                <span class="add-to-wish-list-icon" title="Add to Wishlist">Add to Wishlist</span>
              </div>
            </div>
          </div> -->
          <div class="js_scroll-to-pdp-button product-button-wrapper">
            <fdk-product-card>
              <template slot-scope="productData">
                <button
                  class="add-to-cart primary-btn"
                  @click="addToCart"
                  data-action="add-to-cart"
                >
                  Add to bag
                </button>
                <div
                  class="add-to-wish-list js_add-to-wish-list d-flex"
                  role="button"
                  tabindex="0"
                >
                  <fdk-accounts v-if="context.isLoggedIn" class="wishlist-btn">
                    <template slot-scope="accountsData">
                      <div
                        @click="
                          productData.updateWishList($event, context.product)
                        "
                      >
                        <div>
                          <div
                            style="text-align:center"
                            v-if="!context.product.follow"
                          >
                            <span
                              class="add-to-wish-list-icon"
                              title="Add to Wishlist"
                              >Add to Wishlist</span
                            >
                          </div>
                          <div
                            v-else-if="context.product.follow"
                            style="text-align:center"
                          >
                            <span
                              class="add-to-wish-list-icon active"
                              title="Add to Wishlist"
                              >Add to Wishlist</span
                            >
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="!context.isLoggedIn"
                        class="wishlist-btn"
                        @click="accountsData.openLogin"
                      >
                        <div>
                          <div
                            style="text-align:center"
                            v-if="!context.product.follow"
                          >
                            <span
                              class="add-to-wish-list-icon"
                              title="Add to Wishlist"
                              >Add to Wishlist</span
                            >
                          </div>
                        </div>
                      </div>
                    </template>
                  </fdk-accounts>
                </div>
              </template>
            </fdk-product-card>
          </div>
        </div>

        <fdk-pincode ref="pdp-pincode">
          <template slot-scope="pincodeAct">
            <div class="pincode-container">
              <p class="delivery-options">Delivery Option</p>
              <span style="position:relative">
                <input
                  class="pincode-input"
                  placeholder="Enter pincode"
                  v-model="pincode"
                />
                <p
                  class="check-btn"
                  @click="checkPincode(pincodeAct.validatePincode)"
                >
                  Check
                </p>
              </span>
              <p class="error" v-if="pincodeError">Pincode not serviceable</p>
              <p class="success" v-if="!pincodeError && pincodeSuccess">
                Pincode is serviceable
              </p>
            </div>
          </template>
        </fdk-pincode>
        <div class="product-description-and-detail">
          <div class="product-description">
            <div
              class="value content"
              v-if="context.product.attributes.style_note !== '-'"
              v-html="context.product.attributes.style_note"
            ></div>
            <br v-if="context.product.attributes.style_note" />
            <div
              class="value content"
              v-if="context.product.attributes.product_details"
              v-html="context.product.attributes.product_details"
            ></div>
            <br v-if="context.product.attributes.product_details" />
          </div>
          <div
            class="product-details"
            v-if="
              context.product.grouped_attributes &&
                context.product.grouped_attributes[0]
            "
          >
            <div
              class="value content"
              v-for="(grouped_attribute, index) in context.product
                .grouped_attributes"
              :key="index"
            >
              <div
                class="product-details-element"
                v-for="(attr, index) in grouped_attribute.details"
                :key="index"
              >
                <template v-if="attr.key !== 'Product Details'">
                  <span class="title"> {{ attr.key }} : </span>
                  <span v-if="attr.type === 'html'" v-html="attr.value"></span>
                  <span class="desc" v-else>{{ attr.value }} </span>
                </template>
              </div>
            </div>
          </div>
          <review-list
            v-if="
              context &&
                context.reviews &&
                context.reviews.data &&
                context.reviews.data.length &&
                context.reviews.data.length > 0
            "
            :reviews="context.reviews.data.slice(0, 3)"
            :product="context.product"
          />
          <div
            class="view-all-ratings"
            @click="redirectToReview"
            v-if="
              context &&
                context.reviews &&
                context.reviews.data &&
                context.reviews.data.length &&
                context.reviews.data.length > 3
            "
          >
            <p>View all</p>
            <span>&#8594; </span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="product-carousel-container carousel-container"
      v-if="
        isMounted && context.similar_products && context.similar_products[0]
      "
    >
      <h2 class="product-carousel-title">
        {{ context.similar_products[0].title }}
      </h2>
      <div class="product-carousel-products">
        <div class="swiper-container similar-slider-container">
          <div
            class="swiper-wrapper product-slides "
            role="list"
            aria-label="Product slides"
            style=" translate3d(0px, 0px, 0px);"
            ref="scrollContainer"
          >
            <fdk-link
              class="swiper-slide product-slide swiper-slide-active "
              v-for="(product, index) in context.similar_products[0] &&
                context.similar_products[0].items"
              :key="'product-image-' + index"
              :link="product.url"
            >
              <product-card
                :product="product"
                :context="context"
              ></product-card>
            </fdk-link>
          </div>
          <div
            class="swiper-button swiper-button-next"
            tabindex="0"
            role="button"
            aria-label="Next slide"
            @click="slideRight()"
          >
            <span class="swiper-button-next-icon icon-arrow-black-left"></span>
          </div>
          <div
            class="swiper-button swiper-button-prev"
            tabindex="0"
            role="button"
            aria-label="Previous slide"
            @click="slideLeft()"
          >
            <span class="swiper-button-prev-icon icon-arrow-black-left"></span>
          </div>
        </div>
      </div>
    </div>
    <toast :id="'toast-message'" :content="toast_message"></toast>
  </div>
</template>
<script>
import productcard from './../../global/components/product-card.vue';
import pdpcarousel from './../../global/components/pdp-carousal.vue';
import sizeguide from './../../global/components/size-guide.vue';
import storemodal from './../../global/components/store-modal.vue';
import toast from './../../global/components/toast.vue';

import ratinglist from './../../global/components/reviews/review-list';
import button from './../../global/components/common/button';
// import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import { detectMobileWidth, copyToClipboard } from './../../helper/utils';
import productRequestModal from './../../global/components/product-request-modal.vue';
import * as _ from 'lodash';

export default {
  components: {
    'product-card': productcard,
    'pdp-carousel': pdpcarousel,
    'size-guide': sizeguide,
    'store-modal': storemodal,
    'product-request-modal': productRequestModal,
    toast,
    'review-list': ratinglist,
    'namaste-button': button,
    // Swiper,
    // SwiperSlide
  },
  props: {
    context: {},
  },
  // directives: {
  //   swiper: directive
  // },
  data() {
    return {
      url: window.location.href,
      showMoreProductDetails: false,
      showShippingDetails: false,
      selectedSize: '',
      sizeError: false,
      isMounted: false,
      showSizeGuide: false,
      showStoreModal: false,
      pincodeError: false,
      pincodeSuccess: false,
      pincode: this.context.user_pincode || '',
      zoomCarousalCurrentIndex: 0,
      showZoomModal: false,
      showSoldByModal: false,
      allStoresInfo: null,
      storeCompanyFilter: null,
      storeInfo: {},
      storeInfoSelected: {},
      loadStoreFunction: null,
      loadSellerFunction: null,
      toast_message: '',
      zoom: false,
      reviewsToggle: {},
      trimLength: 50,
      showReview: false,
      reviews: null,
      reviewsData: [],
      showProductRequestModal: false,
    };
  },
  computed: {
    getPopupHeight: function() {
      return this.browser_meta.screenHeight * 0.8 - 40 - 100;
    },
  },
  watch: {
    storeInfo() {
      this.storeInfoSelected = Object.assign(
        {},
        this.storeInfoSelected,
        this.storeInfo
      );
    },
    loadStoreFunction(newValue) {
      this.loadStoreFunction = newValue;
    },
    loadSellerFunction(newValue) {
      this.loadSellerFunction = newValue;
    },
    $route(to, from) {
      this.storeInfoSelected = this.storeInfo;
    },
  },
  methods: {
    getShareLink(share) {
      share.getShareLink(this.url).then((res) => {
        this.copyToClipboard(res);
      });
    },
    copyToClipboard(data) {
      copyToClipboard(data);
      this.$toasted.global.showToaster('Link Copied to Clipboard', 1000);
    },
    updateStoreFilter(filtertype) {
      this.storeCompanyFilter = filtertype;
      this.getStores(this.loadStoreFunction);
    },
    redirectToReview() {
      this.$router.push({
        path: `${this.$route.path}/reviews`,
        query: { type: 'product', uid: this.context.product.uid },
      });
    },
    setStoreInfo(store) {
      this.storeInfoSelected = Object.assign({}, this.storeInfoSelected, store);
      this.storeInfo = this.storeInfoSelected;
      this.showStoreModal = false;
    },
    toggleZoomModal() {
      this.showZoomModal = !this.showZoomModal;
      this.toggleScroll(this.showZoomModal);
    },
    toggleScroll(show) {
      if (show) {
        document.body.style.overflowY = 'hidden';
      } else {
        document.body.style.overflowY = '';
      }
    },
    getImageUrl: function getImageUrl(images) {
      return images[0].secure_url;
    },
    onZoomCarouselButtonClick(e) {
      this.zoomCarousalCurrentIndex = e;
      this.$refs.zoomCarousel.goSlide(e);
    },
    changeImage(event) {
      let activeImage = document.getElementById('activeImage');
      activeImage.src = event.target.src;
      let imageListItem = document.getElementById('imageListItem');
      this.isMounted &&
        imageListItem &&
        imageListItem.forEach((image) => {
          activeImage.src === image.src
            ? (image.style.opacity = 1)
            : (image.style.opacity = 0.5);
        });
    },
    checkPincode(validatePincode) {
      validatePincode(this.pincode)
        .then((valid) => {
          this.pincodeError = !valid;
          this.pincodeSuccess = true;
          if (this.selectedSize && valid) {
            debugger;
            this.sizeClicked(this.loadSellerFunction);
          }
        })
        .catch((err) => {
          this.pincodeSuccess = false;
          this.pincodeError = true;
        });
    },
    sizeClicked(loadSellers) {
      let options = {
        size: this.selectedSize,
        slug: this.context.product.slug,
        pincode: this.pincode,
      };
      loadSellers(options)
        .then((res) => {
          this.storeInfo = res;
          this.showSoldByModal = true;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getStores(loadStores) {
      let options = {
        strategy: this.storeCompanyFilter || '',
        page: 1,
      };
      loadStores(options)
        .then((res) => {
          this.allStoresInfo = res;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    addToCart() {
      if (this.selectedSize === '') {
        this.sizeError = true;
        if (window.innerWidth < 780) {
          var top = document.getElementById('sizeContainer').offsetTop;
          window.scrollTo(0, top - 400);
        }
        return;
      }
      if (!this.pincode || this.pincodeError) {
        this.pincodeError = true;
        return;
      }
      let data = {
        slug: this.context.product.slug,
        size: this.selectedSize,
        pincode: this.pincode,
      };
      // this.$themeAction
      //   .dispatch(this.context.THEME_ACTIONS.FETCH_PRODUCT_SIZE_PRICE, data)
      //   .then((res) => {
      // let sizePrice = res.data;
      let addItemData = {
        items: [
          {
            item_id: this.context.product.uid,
            item_size: this.selectedSize,
            quantity: 1,
            article_assignment: this.storeInfo.article_assignment,
            seller_id: this.storeInfo.seller.uid,
            store_id: this.storeInfo.store.uid,
          },
        ],
      };
      this.$themeAction
        .dispatch(this.context.THEME_ACTIONS.ADD_CART_ITEMS, {
          body: addItemData,
        })
        .then(({ data }) => {
          if (data.success) {
            this.$router.push('/cart/bag');
          } else {
            this.showToast(data.message || 'Something went wrong');
          }
        });
      // })
      // .catch(console.error);
    },
    isVariantSelected(item) {
      return item.slug === this.context.product.slug;
    },
    getAttributes() {
      let keys = Object.keys(this.context.product.attributes) || [];
      if (keys && keys.length) {
        keys = keys.filter((entry) => {
          return !(entry === 'style_note' || entry === 'product_details');
        });
      }
      return keys.sort();
    },
    slideRight() {
      let scrollStep = 300;
      let content = this.$refs['scrollContainer'];
      let sl = content.scrollLeft,
        cw = content.scrollWidth;
      if (sl + scrollStep >= cw) {
        content.scrollTo(cw, 0);
      } else {
        content.scrollTo(sl + scrollStep, 0);
      }
    },
    slideLeft() {
      let scrollStep = 300;
      let content = this.$refs['scrollContainer'];
      let sl = content.scrollLeft;

      if (sl - scrollStep <= 0) {
        content.scrollTo(0, 0);
      } else {
        content.scrollTo(sl - scrollStep, 0);
      }
    },
    showToast: function showToast(message) {
      if (message) {
        this.toast_message = message;
      }
      var x = document.getElementById('toast-message');
      x.className = 'toast show';
      setTimeout(function() {
        x.className = x.className.replace('toast show', 'toast hide');
      }, 3000);
    },
    zoomHandler(yes) {
      let body = document.querySelector('body');
      if (yes) {
        body.style.overflow = 'hidden';
        this.zoom = true;
      } else {
        body.style = '';
        this.zoom = false;
      }
    },
  },
  mounted() {
    let imageListItem = document.getElementById('imageListItem');
    imageListItem && imageListItem[0] && imageListItem[0].style.opacity == 1;
    this.isMounted = true;
    let atc2 = document.getElementById('atc2');
    let dumbDiv = document.getElementById('dumbDiv');
    let YOffset = atc2 && atc2.offsetTop;
    window.addEventListener('scroll', () => {
      {
        if (atc2) {
          if (dumbDiv.offsetTop - window.pageYOffset < 690) {
            atc2.classList.remove('sticky');
          } else {
            atc2.classList.add('sticky');
            dumbDiv.style.marginBottom = '25px';
          }
        }
      }
    });
    // var swiper = this.$swiper('.swiper-container', {
    //   slidesPerView: 3,
    //   spaceBetween: 30,
    //   slidesPerGroup: 3,
    //   loop: true,
    //   loopFillGroupWithBlank: true,
    //   navigation: {
    //     nextEl: '.swiper-button-next',
    //     prevEl: '.swiper-button-prev',
    //   },
    // });
  },
};
</script>

<style scoped lang="less">
.view-all-ratings {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  border-bottom: 1px solid;
  cursor: pointer;
  p {
    margin-right: 10px;
  }
}
.help {
  padding: 10px 0 0 0;
  .link {
    cursor: pointer;
  }
}
.hide-more {
  display: none;
}
.show-more {
  display: block;
}
.carousel-3d-slide {
  background-color: #fff;
}
.product-detail,
.product-recommendations-detail {
  margin: 0 auto;
  max-width: 1300px;
  max-width: 81.25rem;
  @media @mobile {
    margin-top: 50px;
  }
}
.value.content {
  min-height: auto;
  font-family: roboto condensed;
}
.find-your-size {
  padding: 0 0 15px 0;
  display: block;
  text-decoration: underline;
}
.sold-by-section {
  margin: 30px 0 0 0;
  .title {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .seller-name {
    margin: 15px 0 0 0;
  }
}
.pincode-container {
  margin: 35px 0 20px;
  .delivery-options {
    color: #1d1d1d;
    font-size: 14px;
    letter-spacing: 0.78px;
    line-height: 18px;
    text-transform: uppercase;
    font-weight: 700;
  }
  .pincode-input {
    width: 200px;
    height: 40px;
    margin: 1em 0;
    padding: 0 1em;
    font-size: 14px;
    border: 1px solid #000000;
    -webkit-user-select: all;
    color: #000000;
  }
  .check-btn {
    position: absolute;
    top: 2px;
    left: 75%;

    color: black;
    font-size: 14px;
    letter-spacing: 0.06px;
    cursor: pointer;
  }
  .success {
    color: green;
  }
  .error {
    color: red;
  }
}
.swiper-container {
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  list-style: none;
  padding: 0;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .swiper-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: -ms-flexbox;
    display: flex;
    transition-property: transform;
    box-sizing: content-box;
    margin-bottom: 20px;
  }
  .swiper-slide {
    -ms-flex-negative: 0;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    position: relative;
    transition-property: transform;
  }
  .swiper-zoom-container {
    width: 100%;
    height: 100%;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-align: center;
    align-items: center;
    text-align: center;
  }

  .swiper-zoom-container > canvas,
  .swiper-zoom-container > img,
  .swiper-zoom-container > svg {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .swiper-button-next,
  .swiper-button-prev {
    position: absolute;
    top: 50%;
    width: 27px;
    height: 44px;
    margin-top: -22px;
    z-index: 10;
    cursor: pointer;
    background-size: 27px 44px;
    background-position: center;
    background-repeat: no-repeat;
  }

  .swiper-button-next.swiper-button-disabled,
  .swiper-button-prev.swiper-button-disabled {
    opacity: 0.35;
    cursor: auto;
    pointer-events: none;
  }

  .swiper-button-prev.swiper-button-white,
  .swiper-container-rtl .swiper-button-next.swiper-button-white {
    background-image: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNyA0NCc+PHBhdGggZD0nTTAsMjJMMjIsMGwyLjEsMi4xTDQuMiwyMmwxOS45LDE5LjlMMjIsNDRMMCwyMkwwLDIyTDAsMjJ6JyBmaWxsPScjZmZmZmZmJy8+PC9zdmc+);
  }

  .swiper-button-next.swiper-button-white,
  .swiper-container-rtl .swiper-button-prev.swiper-button-white {
    background-image: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNyA0NCc+PHBhdGggZD0nTTI3LDIyTDI3LDIyTDUsNDRsLTIuMS0yLjFMMjIuOCwyMkwyLjksMi4xTDUsMEwyNywyMkwyNywyMnonIGZpbGw9JyNmZmZmZmYnLz48L3N2Zz4=);
  }

  .swiper-button-prev.swiper-button-black,
  .swiper-container-rtl .swiper-button-next.swiper-button-black {
    background-image: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNyA0NCc+PHBhdGggZD0nTTAsMjJMMjIsMGwyLjEsMi4xTDQuMiwyMmwxOS45LDE5LjlMMjIsNDRMMCwyMkwwLDIyTDAsMjJ6JyBmaWxsPScjMDAwMDAwJy8+PC9zdmc+);
  }

  .swiper-button-next.swiper-button-black,
  .swiper-container-rtl .swiper-button-prev.swiper-button-black {
    background-image: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNyA0NCc+PHBhdGggZD0nTTI3LDIyTDI3LDIyTDUsNDRsLTIuMS0yLjFMMjIuOCwyMkwyLjksMi4xTDUsMEwyNywyMkwyNywyMnonIGZpbGw9JyMwMDAwMDAnLz48L3N2Zz4=);
  }

  &.similar-slider-container {
    flex-wrap: nowrap;
    overflow: unset;
    width: 100%;
    .swiper-wrapper {
      overflow-y: hidden;
      &::-webkit-scrollbar {
        display: none;
      }
    }

    /deep/ .swiper-slide {
      max-width: 290px;
      box-sizing: border-box;
      .image-container .tile-image {
        width: auto;
        height: auto;
      }
    }
  }
}

.rev-title {
  font-size: 14px;
  font-family: inherit;
  font-weight: 700;
}

@media (min-width: 0px) and (max-width: 991.98px) {
  .review-slider {
    width: 100%;
    height: 85%;
    min-height: unset;
    position: fixed;
    top: 67px;
    left: 0;
    .review-entry {
      flex-wrap: wrap;
      .left {
        flex: unset;
        height: 60%;
        width: 100%;
      }
      .right {
        width: 100%;
        margin-left: unset;
        padding: 20px 30px 20px 30px;
      }
    }
    h5 {
      max-height: 68%;
    }
  }
}
@media (min-width: 0px) and (max-width: 991.98px) {
  .swiper-container {
    flex-wrap: nowrap;
    overflow-x: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    .swiper-wrapper {
      width: 100vw;
    }
    .col-5-5 {
      flex: unset;
      max-width: unset;
    }
    .swiper-slide {
      width: 70vw;
    }
    .product-slide {
      margin: 15px 15px 0 0;
    }
    .swiper-zoom-container {
      width: 70vw;
    }
  }
}

.price {
  font-size: 1.5rem;
}

.product-content {
  height: 100%;
  position: -webkit-sticky;
  position: sticky;
  z-index: 2;
  top: 0;
}

@media (min-width: 992px) {
  .product-content {
    padding-left: 48px;
    padding-left: 3rem;
  }

  .product-content .tile-promo__extra-info {
    margin: 0.9375rem 0;
  }
}

.product-title {
  font-size: 1.5rem;
  margin: 0;
  line-height: 34px;
  line-height: 2.125rem;
  letter-spacing: 0.8px;
  letter-spacing: 0.05rem;
}

.product-description-and-detail {
  line-height: 26px;
  line-height: 1.625rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
  font-family: Roboto, sans-serif;
}

.product-short-description {
  font-family: Roboto, sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  margin: 0;
  line-height: 24px;
  line-height: 1.5rem;
}
.share-button {
  position: absolute;
  right: 30px;
  top: 0;
  cursor: pointer;
}

.prices {
  margin-bottom: 20px;
  margin-bottom: 1.25rem;
}

.prices .value {
  font-family: roboto condensed, sans-serif;
  font-weight: 700;
  font-size: 1rem;
  line-height: 28px;
  line-height: 1.75rem;
}

.prices .strike-through {
  color: #cacaca;
  -webkit-text-decoration-line: line-through;
  text-decoration-line: line-through;
  -webkit-text-decoration-color: #cacaca;
  text-decoration-color: #cacaca;
}

.prices .product-total-discount {
  color: #cacaca;
  padding: 0 12px;
}

.attribute-labelff {
  font-size: 14px;
  font-weight: 700;
  padding: 0 5px 0 0;
}

.product-images {
  padding: 0;
  margin-bottom: 25px;
  margin-bottom: 1.5625rem;
}

@media (min-width: 992px) {
  .product-images {
    padding: 0 15px;
    padding: 0 0.9375rem;
  }
}

.product-slide .product-image {
  width: 100%;
  cursor: zoom-in;
}

.product-slide:first-child {
  visibility: hidden;
}

.product-slide.swiper-slide-active {
  visibility: visible;
}

.product-slider-container.swiper-container-horizontal
  > .swiper-pagination-bullets {
  left: 15px;
  left: 0.9375rem;
}

.product-carousel-pagination {
  opacity: 1;
  text-align: left;
}

.product-carousel-pagination .swiper-pagination-bullet {
  background-color: transparent;
  border: 1px solid #888;
  margin: 0 7px;
  margin: 0 0.4375rem;
}

.product-carousel-pagination
  .swiper-pagination-bullet.swiper-pagination-bullet-active {
  background-color: #888;
}

.product-carousel-pagination .swiper-pagination-bullet:focus {
  outline: none;
  border: none;
}

.product-video-slide,
.product-video-container,
.product-fullscreen-image-first {
  display: none;
}

.product-slider-container .product-video-slide {
  display: block;
}

.product-main-overlay {
  overflow: hidden;
}

.product-mobile-video-text {
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 0.44px;
  letter-spacing: 0.0275rem;
}

.product-mobile-video-text::before {
  content: '';
  display: block;
  transform: scale(0.66);
  position: absolute;
  background-repeat: no-repeat;
  top: 8px;
  top: 0.5rem;
  left: 3px;
  left: 0.1875rem;
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -545px -224px;
  background-repeat: no-repeat;
  width: 24px;
  width: 1.5rem;
  height: 24px;
  height: 1.5rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
}

.product-fullscreen-image {
  width: 100%;
}

.product-video-wrapper {
  z-index: 100;
  background-color: #f6f6f6;
  padding: 15px 25px;
  padding: 0.9375rem 1.5625rem;
}

@media (min-width: 992px) {
  .product-video-wrapper {
    background-color: transparent;
    padding: 0;
  }
}

.product-video-wrapper.active {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 103;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  padding: 0;
}

.product-video-wrapper.active .product-video-slide {
  display: block;
}

.product-video-wrapper.active .product-mobile-video-text {
  display: none;
}

.product-video-wrapper.active .product-fullscreen-close-button {
  visibility: visible;
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -1032px -2px;
  background-repeat: no-repeat;
  width: 21px;
  width: 1.3125rem;
  height: 21px;
  height: 1.3125rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
}

.product-fullscreen-images-overlay.active {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.product-fullscreen-close-button {
  visibility: hidden;
  position: fixed;
  z-index: 103;
  cursor: pointer;
  background-repeat: no-repeat;
  top: 30px;
  top: 1.875rem;
  right: 35px;
  right: 2.1875rem;
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -957px 0;
  background-repeat: no-repeat;
  width: 22px;
  width: 1.375rem;
  height: 22px;
  height: 1.375rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
}

.product-fullscreen-images-wrapper {
  display: none;
}

.product-fullscreen-images-wrapper.active {
  display: block;
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 102;
  background-color: #fff;
  overflow: hidden;
  overflow-y: auto;
}

.product-fullscreen-images-wrapper.active .product-fullscreen-images {
  padding: 10px 0;
  padding: 0.625rem 0;
  text-align: center;
}

@media (min-width: 0px) and (max-width: 991.98px) {
  .product-fullscreen-images-wrapper.active .product-fullscreen-images img {
    width: 100%;
  }
}

.product-fullscreen-images-wrapper.active .product-fullscreen-image-first {
  display: block;
  width: 100%;
}

.product-fullscreen-images-wrapper.active .product-fullscreen-close-button {
  visibility: visible;
}

.product-fullscreen-images-wrapper.active .product-video-container {
  display: block;
}

.product-fullscreen-images-wrapper.active
  .product-video-container
  .product-video-fullscreen {
  width: 100%;
}

.product-fullscreen-image-wrapper-mobile {
  display: none;
}

.product-fullscreen-image-wrapper-mobile.active {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #fff;
  z-index: 101;
  width: 100vw;
  height: 100vh;
}

.product-fullscreen-image-wrapper-mobile.active
  .product-fullscreen-close-button {
  visibility: visible;
}

.product-fullscreen-image-wrapper-mobile.active
  .product-fullscreen-image-mobile {
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: auto;
}

.zoom {
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.product-attributes,
.variation-attribute,
.attribute-values,
.attribute-value,
.swatch-attribute-values,
.swatch-attribute-value {
  list-style-type: none;
  padding: 0;
}

.variation-attribute {
  margin-bottom: 15px;
  margin-bottom: 0.9375rem;
}

.variation-attribute.error .attribute-label {
  color: #ff1010;
}

.variation-attribute.error .error-label {
  display: inline;
}

.product-attributes {
  font-family: roboto condensed, sans-serif;
  padding: 0;
  margin-bottom: 35px;
  margin-bottom: 2.1875rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
}

.attribute-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  margin: 0;
  display: inline-block;
  line-height: 25px;
  line-height: 1.5625rem;
  margin-bottom: 7px;
  margin-bottom: 0.4375rem;
}

@media (min-width: 992px) {
  .attribute-label {
    font-size: 0.875rem;
  }
}

.attribute-label-value {
  font-size: 0.75rem;
}

@media (min-width: 992px) {
  .attribute-label-value {
    font-size: 0.875rem;
  }
}

.attribute-values {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-flow: row wrap;
  flex-flow: row wrap;
  margin-left: -3px;
  margin-left: -0.1875rem;
}

.attribute-value {
  font-size: 1rem;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-align: center;
  align-items: center;
  border: 1px solid #cacaca;
  min-width: calc(25% - 6px);
  cursor: pointer;
  height: 41px;
  height: 2.5625rem;
  margin: 3px;
  margin: 0.1875rem;
  padding: 0 5px;
  padding: 0 0.3125rem;
}

@media (min-width: 992px) {
  .attribute-value {
    min-width: calc(20% - 6px);
  }
}

.attribute-value:hover {
  border: 1px solid #000;
}

.attribute-value.selected {
  color: #fff;
  background-color: #000;
}

.attribute-value.unavailable {
  color: #cacaca;
}

.back-in-stock-notification .attribute-value.unavailable::before {
  content: '';
  margin: 0 5px 2px 0;
  margin: 0 0.3125rem 0.125rem 0;
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -1550px -224px;
  background-repeat: no-repeat;
  width: 19px;
  width: 1.1875rem;
  height: 14px;
  height: 0.875rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
  width: 20px;
  width: 1.25rem;
}

.back-in-stock-notification .attribute-value.selected.unavailable::before {
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -1600px -224px;
  background-repeat: no-repeat;
  width: 19px;
  width: 1.1875rem;
  height: 14px;
  height: 0.875rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
  width: 20px;
  width: 1.25rem;
}

.swatch-attribute-values {
  margin-top: 10px;
  margin-top: 0.625rem;
}

@media (min-width: 992px) {
  .swatch-attribute-values {
    margin-top: 0;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-flow: row wrap;
    flex-flow: row wrap;
    margin-left: -6px;
    margin-left: -0.375rem;
  }
}

.swatch-attribute-value {
  cursor: pointer;
}

.swatch-attribute-value.selected::after {
  content: '';
  display: block;
  position: relative;
  width: 100%;
  background-color: #000;
  bottom: 6px;
  bottom: 0.375rem;
  height: 3px;
  height: 0.1875rem;
}

@media (min-width: 992px) {
  .swatch-attribute-value {
    width: calc(20% - 12px);
    margin: 6px;
    margin: 0.375rem;
  }
}

.swatch-image {
  width: 100%;
}

.error-label {
  display: none;
  color: #ff1010;
  font-size: 0.625rem;
  text-transform: uppercase;
}

.product-button-wrapper {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-align: center;
  align-items: center;
  position: relative;
  z-index: 106;
  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}

.add-to-wish-list {
  -ms-flex: 2;
  flex: 2;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-align: center;
  align-items: center;
}

.add-to-wish-list-icon {
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  text-indent: -9999px;
  text-indent: -624.9375rem;
  transform: scale(1.22);
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -194px -227px;
  background-repeat: no-repeat;
  width: 19px;
  width: 1.1875rem;
  height: 19px;
  height: 1.1875rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
}

.add-to-wish-list-icon:hover,
.add-to-wish-list-icon.active {
  transform: scale(1.22);
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -102px -227px;
  background-repeat: no-repeat;
  width: 20px;
  width: 1.25rem;
  height: 20px;
  height: 1.25rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
}

button.add-to-cart,
button.find-stockists,
button.btn-update-wishlist-product,
button.notify-open,
button.notify-submit {
  -ms-flex: 8;
  flex: 8;
  text-transform: uppercase;
  height: 40px;
  height: 2.5rem;
}

@media (min-width: 992px) {
  button.add-to-cart,
  button.find-stockists,
  button.btn-update-wishlist-product,
  button.notify-open,
  button.notify-submit {
    height: 45px;
    height: 2.8125rem;
  }
}

.back-to {
  text-transform: uppercase;
  font-weight: 700;
  position: relative;
}

.back-to::before {
  position: relative;
  transform: rotate(90deg);
  transition: transform 0.8s;
  content: '';
  display: inline-block;
  background-image: url(./../../assets/images/sprite-icons.svg);
  background-position: -580px 0;
  background-repeat: no-repeat;
  width: 24px;
  width: 1.5rem;
  height: 24px;
  height: 1.5rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
}

.breadcrumb-container {
  position: relative;
}

.breadcrumb-container .backtoplp {
  padding: 13px 0;
  padding: 0.8125rem 0;
}

.breadcrumbs-no-js {
  text-transform: uppercase;
  font-weight: 700;
}

.pdp-promotion-banner {
  background: #c00;
  color: #fff;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: distribute;
  justify-content: space-around;
  cursor: pointer;
  z-index: 10;
  width: 100%;
  height: 36px;
  height: 2.25rem;
  max-width: 219px;
  max-width: 13.6875rem;
  padding: 5px 0 5px 10px;
  padding: 0.3125rem 0 0.3125rem 0.625rem;
  margin-top: 15px;
  margin-top: 0.9375rem;
}

.promo-container {
  height: auto;
  width: auto;
  overflow: hidden;
  transition: all 0.3s ease-out;
  margin-bottom: 15px;
  margin-bottom: 0.9375rem;
  max-height: 0;
  max-height: 0;
  width: 292px;
  width: 18.25rem;
}

.promo-container.show {
  max-height: 500px;
  max-height: 31.25rem;
}

.promo-button-text {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700 400;
  width: 159px;
  width: 9.9375rem;
  line-height: 20px;
  line-height: 1.25rem;
  letter-spacing: 0.38px;
  letter-spacing: 0.02375rem;
}

.promo-text {
  line-height: 1.7;
  font-size: 0.75rem;
  border: 0.0625rem solid #cacaca;
  width: 292px;
  width: 18.25rem;
  padding: 10px 15px;
  padding: 0.625rem 0.9375rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
}

.size-chart-modal {
  padding: 0;
}

.size-chart-modal-body {
  height: -webkit-fit-content;
  height: -moz-fit-content;
  height: fit-content;
}

.size-chart-table {
  border-collapse: collapse;
  width: 100%;
}

.product-notify {
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
}

.product-notify-message {
  margin: 0 0 20px;
  margin: 0 0 1.25rem;
}

.product-notify-head {
  margin-bottom: 30px;
  margin-bottom: 1.875rem;
}

.product-notify-body {
  display: none;
  background-color: #f6f6f6;
  padding: 15px 21px 20px;
  padding: 0.9375rem 1.3125rem 1.25rem;
  margin-bottom: 30px;
  margin-bottom: 1.875rem;
}

.product-notify p {
  font-size: 0.875rem;
  line-height: 26px;
  line-height: 1.625rem;
  margin: 0 0 10px;
  margin: 0 0 0.625rem;
}

.product-notify .form-group {
  margin-bottom: 19px;
  margin-bottom: 1.1875rem;
}

.product-notify-content.success .success-message {
  display: initial;
  color: #10b351;
}

.product-notify-content.success .form-footer {
  display: none;
}

.product-notify .success-message {
  display: none;
  font-size: 0.875rem;
  line-height: 26px;
  line-height: 1.625rem;
  margin: 0 0 10px;
  margin: 0 0 0.625rem;
}

.product-notify .custom-checkbox {
  margin-bottom: 15px;
  margin-bottom: 0.9375rem;
}

.product-notify .custom-checkbox label {
  font-size: 0.625rem;
  line-height: 20px;
  line-height: 1.25rem;
}

.product-carousel-title {
  font-family: roboto condensed, sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0;
  letter-spacing: 0.83px;
  letter-spacing: 0.05187rem;
  margin: 20px 0;
  margin: 1.25rem 0;
}

@media (min-width: 992px) {
  .product-carousel-title {
    font-size: 2.5rem;
    margin: 30px 0;
    margin: 1.875rem 0;
  }
}

.product-carousel-container {
  position: relative;
  z-index: 0;
  margin-top: 35px;
  margin-top: 2.1875rem;
  margin-bottom: 30px;
  margin-bottom: 1.875rem;
}

.carousel-container .swiper-button {
  top: 40%;
  cursor: pointer;
  z-index: 10;
  height: 35px;
  height: 2.1875rem;
  width: 35px;
  width: 2.1875rem;
}

@media (min-width: 992px) {
  .carousel-container .swiper-button {
    top: 50%;
  }
}

.carousel-container .swiper-button-next,
.carousel-container .swiper-button-prev {
  display: none;
  background-image: none;
}

@media (min-width: 1360px) {
  .carousel-container .swiper-button-next,
  .carousel-container .swiper-button-prev {
    display: block;
  }
}

.carousel-container .swiper-button-next {
  right: -35px;
}

.carousel-container .swiper-button-prev {
  left: -35px;
}

.carousel-container .swiper-button-next-icon,
.carousel-container .swiper-button-prev-icon {
  position: absolute;
  top: 15%;
}

.carousel-container .swiper-button-next-icon {
  transform: rotate(270deg);
  right: 25%;
}

.carousel-container .swiper-button-prev-icon {
  left: 25%;
}

.review.carousel-container .swiper-button-next-icon,
.review.carousel-container .swiper-button-prev-icon {
  position: absolute;
  top: 50%;
}

.review.carousel-container .swiper-button-next-icon {
  transform: rotate(270deg);
  right: 5%;
}

.review.carousel-container .swiper-button-prev-icon {
  left: 5%;
}

@media (min-width: 0px) and (max-width: 991.98px) {
  .review.carousel-container .swiper-button-next {
    right: 0;
  }

  .review.carousel-container .swiper-button-prev {
    left: 0;
  }

  .review.carousel-container .swiper-button-next,
  .review.carousel-container .swiper-button-prev {
    display: block;
  }
}
.product-carousel-padding {
  margin: auto;
  max-width: 1300px;
  max-width: 81.25rem;
  padding: 0 15px;
  padding: 0 0.9375rem;
}

.print-wrapper {
  display: none;
}

@media print {
  * {
    transition: none !important;
  }

  body > *:not(#page-main-wrapper) {
    display: none !important;
  }

  #page-main-wrapper > *:not(.print-wrapper) {
    display: none !important;
  }

  .print-wrapper {
    display: block !important;
  }

  .pdp-print-sec {
    width: 100%;
    font-family: Arial, sans-serif;
  }

  .pdp-print-sec .pdp-print-left-sec {
    width: 40%;
    float: left;
  }

  .pdp-print-sec .pdp-print-right-sec {
    width: 60%;
    float: left;
    position: relative;
  }

  .pdp-print-sec .pdp-print-right-sec img {
    width: 100%;
  }
}

.slot-margin {
  margin-bottom: 25px;
  margin-bottom: 1.5625rem;
}

@media (min-width: 992px) {
  .slot-margin {
    margin-bottom: 50px;
    margin-bottom: 3.125rem;
  }
}

.module-head,
.module-head-small,
.module-head-big,
.module-head-huge {
  font-family: roboto condensed, sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1.875rem;
  line-height: 1.1;
  margin: 0;
  letter-spacing: 0.8px;
  letter-spacing: 0.05rem;
}

@media (min-width: 992px) {
  .module-head,
  .module-head-small,
  .module-head-big,
  .module-head-huge {
    font-size: 2.5rem;
  }
}

.module-head-small {
  font-size: 1.375rem;
  letter-spacing: 0.65px;
  letter-spacing: 0.04063rem;
}

@media (min-width: 992px) {
  .module-head-small {
    font-size: 1.5rem;
    letter-spacing: 0.8px;
    letter-spacing: 0.05rem;
  }
}

.module-head-big {
  font-size: 46px;
  font-size: 2.875rem;
}

@media (min-width: 992px) {
  .module-head-big {
    font-size: 70px;
    font-size: 4.375rem;
    letter-spacing: 1.5px;
    letter-spacing: 0.09375rem;
  }
}

.module-head-huge {
  font-size: 80px;
  font-size: 5rem;
  letter-spacing: 0.85px;
  letter-spacing: 0.05312rem;
}

@media (min-width: 992px) {
  .module-head-huge {
    font-size: 126px;
    font-size: 7.875rem;
    letter-spacing: 2.6px;
    letter-spacing: 0.1625rem;
  }
}

.module-link {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  font-family: roboto condensed, sans-serif;
  letter-spacing: 1.05px;
  letter-spacing: 0.06563rem;
}

.module-link:hover {
  text-decoration: underline;
}

.link-underline {
  font-size: 0.75rem;
  text-decoration: underline;
  color: inherit;
}

@media (min-width: 992px) {
  .link-underline {
    font-size: 0.875rem;
  }
}

.module-text,
.module-text-no-margin {
  font-size: 0.75rem;
  line-height: 2;
  margin: 10px 0;
  margin: 0.625rem 0;
}

@media (min-width: 992px) {
  .module-text,
  .module-text-no-margin {
    font-size: 0.875rem;
    line-height: 1.9;
    margin: 20px 0;
    margin: 1.25rem 0;
  }
}

.module-text-no-margin {
  margin: 0;
}

.list-no-style {
  font-size: 0.75rem;
  padding: 0;
}

.list-no-style > li {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 20px 0;
  margin: 1.25rem 0;
}

@media (min-width: 992px) {
  .list-no-style {
    font-size: 0.875rem;
  }
}

.dynamic-title-small,
.dynamic-title-medium,
.dynamic-title-big,
.dynamic-title-huge {
  font-family: roboto condensed, sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.1;
  margin: 0;
  font-size: calc(50% + 3vw);
  letter-spacing: 1.5px;
  letter-spacing: 0.09375rem;
}

.dynamic-title-medium {
  font-size: calc(100% + 4vw);
}

.dynamic-title-big {
  font-size: calc(150% + 6vw);
}

.dynamic-title-huge {
  font-size: calc(200% + 8vw);
}

.heading-24 {
  font-size: 1.125rem;
}

@media (min-width: 992px) {
  .heading-24 {
    font-size: 1.5rem;
  }
}

.text-uppercase {
  text-transform: uppercase;
}

.border-box {
  box-sizing: border-box;
}

.alert {
  color: #ff1010;
}

.fullbleed-top-left,
.fullbleed-top-center,
.fullbleed-top-right,
.fullbleed-center-left,
.fullbleed-center-center,
.fullbleed-center-right,
.fullbleed-bottom-left,
.fullbleed-bottom-center,
.fullbleed-bottom-right {
  position: absolute;
  box-sizing: border-box;
  padding: 15px 15px 45px;
  padding: 0.9375rem 0.9375rem 2.8125rem;
}

.fullbleed-top-left {
  top: 0;
  left: 0;
  text-align: left;
}

.fullbleed-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.fullbleed-top-right {
  top: 0;
  right: 0;
  text-align: right;
}

.fullbleed-center-left {
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  text-align: left;
}

.fullbleed-center-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.fullbleed-center-right {
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  text-align: right;
}

.fullbleed-bottom-left {
  bottom: 0;
  left: 0%;
  text-align: left;
}

.fullbleed-bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.fullbleed-bottom-right {
  bottom: 0;
  right: 0;
  text-align: right;
}

.fullbleed-asset {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 1330px;
  max-width: 83.125rem;
}

.fullbleed-asset.mobile {
  display: block;
}

@media (min-width: 992px) {
  .fullbleed-asset.mobile {
    display: none;
  }
}

.fullbleed-asset.desktop {
  display: none;
}

@media (min-width: 992px) {
  .fullbleed-asset.desktop {
    display: block;
  }
}

.fullbleed-asset[data-href] {
  cursor: pointer;
}

.fullbleed-asset .button {
  box-sizing: border-box;
  margin: 0 10px 10px 0;
  margin: 0 0.625rem 0.625rem 0;
}

.fullbleed-slot .swiper-pagination {
  text-align: left;
}

@media (min-width: 992px) {
  .fullbleed-slot .swiper-pagination {
    text-align: right;
  }
}

.fullbleed-slot .swiper-pagination-bullet {
  opacity: 1;
  background-color: transparent;
  border: 1px solid #fff;
  width: 7px;
  width: 0.4375rem;
  height: 7px;
  height: 0.4375rem;
}

.fullbleed-slot .swiper-pagination-bullet-active {
  background-color: #fff;
}

.fullbleed-slot > .swiper-pagination-bullets {
  width: calc(100% - 60px);
  padding: 0 30px 20px;
  padding: 0 1.875rem 1.25rem;
}

.fullbleed-slot > .swiper-pagination-bullets .swiper-pagination-bullet {
  margin: 0 8px;
  margin: 0 0.5rem;
}

.fullbleed-video {
  width: 100%;
  height: 100%;
}

.fullbleed-video.mobile {
  display: block;
}

@media (min-width: 992px) {
  .fullbleed-video.mobile {
    display: none;
  }
}

.fullbleed-video.desktop {
  display: none;
}

@media (min-width: 992px) {
  .fullbleed-video.desktop {
    display: block;
  }
}

.fullbleed-video-controls {
  cursor: pointer;
  box-sizing: border-box;
  border-color: transparent transparent transparent #fff;
  transition: 100ms all ease;
  will-change: border-width;
  padding: 0;
  height: 50px;
  height: 3.125rem;
  margin: 15px 15px 55px;
  margin: 0.9375rem 0.9375rem 3.4375rem;
  border-style: solid;
  border-width: 25px 0 25px 40px;
  border-width: 1.5625rem 0 1.5625rem 2.5rem;
}

.fullbleed-video-controls.playing {
  border-style: double;
  border-width: 0 0 0 40px;
  border-width: 0 0 0 2.5rem;
}

.fullbleed-video-controls.black {
  border-color: transparent transparent transparent #000;
}

.fullbleed-video-controls.red {
  border-color: transparent transparent transparent #ff1010;
}

.two-images-mobile {
  display: block;
  position: relative;
}

@media (min-width: 992px) {
  .two-images-mobile {
    display: none;
  }
}

.two-images-desktop {
  display: none;
  position: relative;
}

@media (min-width: 992px) {
  .two-images-desktop {
    display: block;
  }
}

.two-images-content {
  z-index: 3;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 1330px;
  max-width: 83.125rem;
}

.two-images-img {
  padding: 50px;
  padding: 3.125rem;
}

.two-images-img .main-image,
.two-images-img .secondary-image {
  float: left;
  position: relative;
}

.two-images-asset .button {
  box-sizing: border-box;
  margin: 0 10px 10px 0;
  margin: 0 0.625rem 0.625rem 0;
}

@media (min-width: 992px) {
  .productlook {
    display: -ms-grid;
    display: grid;
    -ms-grid-columns: 50% 50%;
    grid-template-columns: 50% 50%;
    -ms-grid-rows: auto auto;
    grid-template-rows: auto auto;
    margin-left: auto;
    margin-right: auto;
    padding: 0 10px;
    padding: 0 0.625rem;
    max-width: 1300px;
    max-width: 81.25rem;
  }
}

.productlook-content {
  margin: 0 15px 25px;
  margin: 0 0.9375rem 1.5625rem;
}

@media (min-width: 992px) {
  .productlook-content {
    -ms-grid-column: 1;
    grid-column: 1;
    -ms-grid-row: 1;
    grid-row: 1;
    margin: 0;
  }
}

.productlook-image {
  width: 100%;
}

@media (min-width: 992px) {
  .productlook-image {
    display: block;
    width: 85%;
    -ms-grid-column: 2;
    grid-column: 2;
    -ms-grid-row-span: 2;
    -ms-grid-row: 1;
    grid-row: 1 / span 2;
    -ms-grid-column-align: end;
    justify-self: end;
    margin: 0;
  }
}

.productlook-products {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: end;
  align-items: flex-end;
  margin: 25px 10px 0;
  margin: 1.5625rem 0.625rem 0;
}

@media (min-width: 992px) {
  .productlook-products {
    -ms-grid-column: 1;
    grid-column: 1;
    -ms-grid-row: 2;
    grid-row: 2;
    margin: 0;
  }
}

.productlook .button {
  box-sizing: border-box;
  margin: 0 10px 10px 0;
  margin: 0 0.625rem 0.625rem 0;
}

.productlook .product {
  display: inline-block;
  box-sizing: border-box;
  width: 50%;
}

.productlook .product:nth-child(odd) {
  margin-right: 10px;
  margin-right: 0.625rem;
}

.productlook .product-tile {
  margin: 0;
}

.productlook .tile-body {
  min-height: unset;
}

.productlook .module-text,
.productlook .module-text-no-margin {
  margin: 10px 0;
  margin: 0.625rem 0;
}

.productlook .image {
  width: 100%;
}

.two-banners {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}

@media (min-width: 769px) {
  .two-banners {
    max-width: 1330px;
    max-width: 83.125rem;
  }
}

.two-banners .category {
  -ms-flex: auto;
  flex: auto;
  box-sizing: border-box;
  padding: 15px;
  padding: 0.9375rem;
  margin-bottom: 25px;
  margin-bottom: 1.5625rem;
}

@media (min-width: 769px) {
  .two-banners .category {
    -ms-flex: 1;
    flex: 1;
    padding: 0;
    padding-right: 15px;
    padding-right: 0.9375rem;
  }

  .two-banners .category:nth-child(2) {
    padding-left: 15px;
    padding-left: 0.9375rem;
  }
}

.two-banners .category-wrapper {
  margin: 50px 0;
  margin: 3.125rem 0;
}

.two-banners .category-heading {
  box-sizing: border-box;
  text-transform: uppercase;
  width: 100%;
  font-size: 1.875rem;
  padding: 15px;
  padding: 0.9375rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
}

@media (min-width: 769px) {
  .two-banners .category-heading {
    text-align: center;
    margin: 0 0 20px;
    margin: 0 0 1.25rem;
  }
}

.two-banners .category-image {
  width: 100%;
  height: auto;
}

.two-banners .category .module-title {
  text-transform: uppercase;
  font-size: 1.125rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
  margin: 10px 0;
  margin: 0.625rem 0;
}

.two-banners .category .module-link {
  font-size: 0.6875rem;
  letter-spacing: normal;
}

.display-none {
  display: none;
}

.product-content .store-locator {
  position: relative;
  left: -4px;
  left: -0.25rem;
}

.attribute-label.error {
  color: #ff1010;
}

.hidden {
  overflow: hidden;
}

.text-strong {
  margin: 0;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
  font-family: roboto condensed, sans-serif;
  letter-spacing: 0.44px;
  letter-spacing: 0.0275rem;
}

.col-right {
  text-align: center;
}

@media (min-width: 992px) {
  .col-left {
    padding-right: 22px;
    padding-right: 1.375rem;
  }

  .col-right {
    text-align: unset;
    padding-left: 22px;
    padding-left: 1.375rem;
  }
}

.nowrap {
  white-space: nowrap;
}

.pre-order-pdp-message {
  color: #476f19;
  font-size: 0.625rem;
  text-transform: uppercase;
  margin-top: 25px;
  margin-top: 1.5625rem;
}

.what-is-pre-order {
  text-decoration: underline;
  font-size: 0.75rem;
}

.what-is-pre-order:hover {
  text-decoration: none;
}

.add-preorder-to-cart-section .estimated-delivery {
  margin: 10px 0 0;
  margin: 0.625rem 0 0;
}

.estimated-delivery {
  font-size: 0.625rem;
}

.add-to-cart.preorder {
  background-color: #000;
  color: #fff;
  margin-top: 25px;
  margin-top: 1.5625rem;
}

.add-to-cart.preorder:hover {
  background-color: #fff;
  color: #000;
}

.preorder-limitation-message {
  color: #d0021b;
  text-transform: uppercase;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-top: 15px;
  margin-top: 0.9375rem;
}
</style>

<template>
  <div
    class="main-container"
    :style="`--text_heading_link_color: ${global_config.props.text_heading_link_color};--button_tertiary_hover_color: ${global_config.props.button_tertiary_hover_color};--button_tertiary_hover_text_color:${global_config.props.button_tertiary_hover_text_color};--button_tertiary_color:${global_config.props.button_tertiary_color};--button_tertiary_label_color:${global_config.props.button_tertiary_label_color}; color: ${global_config.props.text_body_color}`"
  >
    <div
      class="product-desc-container"
      v-if="context && context.product && context.product.medias"
    >
      <div class="left">
        <image-gallery :images="getMedias" v-on:paint-canvas="showPreview" />
      </div>
      <div class="right">
        <canvas width="200" height="200" ref="preview" class="preview"></canvas>
        <div class="share-like-box">
          <div
            class="mark-fav"
            v-if="page_config && page_config.props.wishlist"
          >
            <favourite :item="context.product"></favourite>
          </div>
          <fdk-share
            v-click-outside="hideShare"
            v-if="page_config && page_config.props.share"
          >
            <template slot-scope="share">
              <div class="share-button" @click="getShareLink(share)">
                <img src="../../assets/images/share.svg" class="share-img" />
                <transition name="fade">
                  <share
                    :title="`Spread the shopping delight! Scan QR & share this ${context.product.brand.name} product with
                              your loved ones`"
                    :shareLoading="shareLoading"
                    :qr_code="qr_code"
                    @close-share="showShare = false"
                    v-if="showShare"
                    :share_link="share_link"
                  />
                </transition>
              </div>
            </template>
          </fdk-share>
        </div>
        <div class="product">
          <h1
            class="product__title"
            :style="'color:' + global_config.props.text_heading_link_color"
          >
            {{ context.product.name }}
          </h1>
          <div class="product__price">
            <span
              class="product__price--effective"
              :style="
                getProductPrice('effective') !== getProductPrice('marked')
                  ? 'color:' + global_config.props.text_sale_price_color
                  : 'color:' + global_config.props.text_price_color
              "
              >{{ getProductPrice("effective") | currencyformat }}</span
            >
            <span
              class="product__price--marked"
              :style="
                'color:' + global_config.props.text_strikethrough_price_color
              "
              v-if="getProductPrice('effective') !== getProductPrice('marked')"
              >{{ getProductPrice("marked") | currencyformat }}</span
            >
          </div>
          <div
            v-if="
              context &&
              context.product &&
              context.product.rating &&
              context.product.rating_count &&
              page_config &&
              page_config.props.ratings
            "
            class="product-rating-count"
          >
            <span>
              <rating-star :stars="context.product.rating" :size="'small'" />
            </span>
            <span style="font-size: 14px">
              {{ context.product.rating_count }} ratings
            </span>
          </div>
          <store-coupon
            :bulkPrices="context.bulk_prices"
            v-if="!context.bulk_prices.loading && page_config.props.bulk_prices"
            :global_config="global_config"
          ></store-coupon>
          <product-variants
            class="spaces"
            v-if="
              context.product_variants &&
              context.product_variants.variants &&
              context.product_variants.variants.variants &&
              page_config.props.variants
            "
            :product="context.product"
            :variants="context.product_variants.variants.variants"
          ></product-variants>
          <fdk-pdp-size-stores class="product__size" ref="sizeContainer">
            <template slot-scope="sellerData">
              <p class="product__size--text">Size</p>
              <ul class="size-list">
                <li
                  v-for="(size, index) in context.product_meta.sizes"
                  :key="index"
                  class="size-list__item"
                  :class="{
                    'size-list__item--selected': selectedSize === size.display,
                    inactive: !size.is_available,
                  }"
                  @click="
                    selectedSize = size.display;
                    onSizeClicked(sellerData);
                    sizeError = false;
                  "
                >
                  <p>{{ size.display }}</p>
                </li>
              </ul>
              <div
                class="spacing regular-xxs"
                v-if="
                  isProductRequestEnabled && page_config.props.product_request
                "
              >
                Couldn't find your size?
                <a
                  class="ukt-links regular-xxs"
                  @click="showProductRequestModal = true"
                  >Product Request</a
                >
              </div>
              <p class="u-error" v-if="sizeError">Select a size first</p>

              <p
                @click="showSizeGuide = true"
                class="product__size--guide"
                v-if="
                  page_config.props.size_guide &&
                  context.product_meta.size_chart &&
                  context.product_meta.size_chart.sizes &&
                  context.product_meta.size_chart.sizes.length > 0
                "
              >
                Size Guide
              </p>
              <size-guide
                class="size-guide"
                v-if="context.product_meta"
                :isOpen="showSizeGuide"
                :product_meta="context.product_meta"
                @closedialog="showSizeGuide = false"
              ></size-guide>

              <div
                class="seller-info"
                v-if="
                  storeInfoSelected &&
                  storeInfoSelected.store &&
                  storeInfoSelected.store.name
                "
              >
                <div class="seller-name regular-xxs" v-if="showSellers">
                  <div class="store-seller">
                    Sold By:
                    {{ storeInfoSelected.store.name + "," }}
                    {{ storeInfoSelected.seller.name }}
                    <span
                      class="ukt-links bold-xs"
                      style="color: var(--text_heading_link_color)"
                      v-if="
                        store_count > 1 &&
                        page_config &&
                        page_config.props &&
                        page_config.props.store_selection
                      "
                      @click="
                        showStoreModal = true;
                        loadStoreFunction = sellerData.loadStores;
                        getStores(sellerData.loadStores);
                      "
                    >
                      & {{ store_count - 1 }} Others</span
                    >
                  </div>
                  <store-modal
                    :isOpen="showStoreModal"
                    :activeStoreInfo="storeInfo"
                    :all_stores_info="all_stores_info"
                    :sellerData="sellerData"
                    :productName="context.product.name"
                    v-on:closedialog="closedDialog"
                    v-on:store-filter="updateStoreFilter"
                    v-on:store-item-select="setStoreInfo"
                  ></store-modal>
                </div>
              </div>
            </template>
          </fdk-pdp-size-stores>
          <!-- Product Request -->
          <product-request-modal
            :isOpen="showProductRequestModal"
            :productInfo="context.product"
            :isPdpPage="true"
            v-on:closedialog="showProductRequestModal = false"
          ></product-request-modal>
          <!-- Size Set Info -->
          <size-set-info
            v-if="isSizeSet"
            :storeInfo="storeInfo"
          ></size-set-info>

          <fdk-cart class="product__actions">
            <template slot-scope="cart">
              <button
                class="button"
                @click="addToCart(cart)"
                v-if="
                  context.product_meta &&
                  context.product_meta.sellable &&
                  !global_config.props.disable_cart
                "
                :style="`background-color: ${global_config.props.button_add_to_cart_color};color:${global_config.props.button_add_to_cart_label_color}`"
              >
                <p>Add to cart</p>
              </button>
            </template>
          </fdk-cart>

          <fdk-notify
            class="product__actions notify-btn"
            v-if="
              context.product_meta &&
              checkSelleble &&
              !context.product_meta.sellable &&
              !global_config.props.disable_cart
            "
          >
            <template slot-scope="notifyProduct">
              <button
                class="button"
                @click="productNotify(notifyProduct)"
                :style="`background-color: ${global_config.props.button_add_to_cart_color};color:${global_config.props.button_add_to_cart_label_color}`"
              >
                <img
                  :style="`vertical-align: bottom;`"
                  src="../../assets/images/bell.png"
                  alt=""
                />
                <span>Notify Me</span>
              </button>
            </template>
          </fdk-notify>

          <!--Delivery Info-->
          <delivery-info
            v-if="showUserPincodeModal || storeInfo"
            :showUserPincodeModal="showUserPincodeModal"
            :isExplicitelySelectedStore="isExplicitelySelectedStore"
            :storeInfo="storeInfo"
            :productName="context.product.product_name"
            level="l3"
            :id="getCategoryId"
            @dialogClosed="onDialogClosed"
            @pincodeChanged="onPincodeChanged($event)"
            @showTatError="onTatError($event)"
            @hideTatError="onHideTatError"
          ></delivery-info>

          <compare-action-modal
            v-if="showCompareActionModal"
            :compare_slugs="context.compare_slugs"
            :compare_msg="compareMsg"
            :product_uid="context.product.slug"
            :global_config="global_config"
            @hide-compare-action-modal="hideCompareModal"
          ></compare-action-modal>
          <!-- Product Description -->
          <div class="book-appt-n-compare">
            <fdk-compare-action
              v-if="page_config && page_config.props.add_to_compare"
            >
              <template slot-scope="compare">
                <div
                  class="compare-container compare-text"
                  @click="
                    addCompareProducts(compare.addCompare, context.product.slug)
                  "
                >
                  <div class="compare-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17.54"
                      height="11"
                      viewBox="0 0 17.54 11"
                    >
                      <g transform="translate(-179 -222)">
                        <g transform="translate(-87 -63)">
                          <g class="a" transform="translate(266 285)">
                            <circle class="c" cx="5.5" cy="5.5" r="5.5" />
                            <circle class="d" cx="5.5" cy="5.5" r="5.1" />
                          </g>
                          <g class="a" transform="translate(272.64 285)">
                            <ellipse
                              class="c"
                              cx="5.45"
                              cy="5.5"
                              rx="5.45"
                              ry="5.5"
                            />
                            <ellipse
                              class="d"
                              cx="5.45"
                              cy="5.5"
                              rx="5.05"
                              ry="5.1"
                            />
                          </g>
                          <path
                            class="b"
                            d="M0,4.4A5.486,5.486,0,0,1,2.2,0,5.486,5.486,0,0,1,4.4,4.4a5.486,5.486,0,0,1-2.2,4.4A5.486,5.486,0,0,1,0,4.4Z"
                            transform="translate(272.593 286.099)"
                          />
                        </g>
                      </g>
                    </svg>
                    <!-- <svg xmlns="http://www.w3.org/2000/svg" width="17.54" height="11" viewBox="0 0 17.54 11">
                        <g transform="translate(-179 -222)">
                          <g transform="translate(-87 -63)" >
                              <g transform="translate(266 285)" :stroke="global_config.props.button_tertiary_color" :fill="'none'">
                              <circle  cx="5.5" cy="5.5" r="5.5" :stroke="'none'"/>
                              <circle  cx="5.5" cy="5.5" r="5.1" :fill="'none'"/>
                              </g>
                              <g transform="translate(272.64 285)" :stroke="global_config.props.button_tertiary_color" :fill="'none'">
                                <ellipse  cx="5.45" cy="5.5" rx="5.45" ry="5.5" :stroke="'none'"/>
                                <ellipse  cx="5.45" cy="5.5" rx="5.05" ry="5.1" :fill="'none'"/>
                              </g>
                              <path :fill="global_config.props.button_tertiary_color" d="M0,4.4A5.486,5.486,0,0,1,2.2,0,5.486,5.486,0,0,1,4.4,4.4a5.486,5.486,0,0,1-2.2,4.4A5.486,5.486,0,0,1,0,4.4Z" transform="translate(272.593 286.099)"/>
                          </g>
                        </g>
                    </svg> -->
                  </div>
                  <p>Add to Compare</p>
                </div>
              </template>
            </fdk-compare-action>
          </div>
          <div class="mt-5" v-if="context.product.grouped_attributes">
            <product-desc
              :product="context.product"
              :storeInfo="storeInfo"
              :global_config="global_config"
            />

            <!-- <ul>
              <li
                class="product__attributes--item"
                :class="{ 'attr-para': attr.type === 'paragraph' }"
                v-for="(attr, index) in context.product.grouped_attributes[0]
                  .details"
                :key="index"
              >
                <span class="atr_key mr-4" v-if="attr.key.length > 1">{{
                  attr.key
                }}</span>
                <span
                  class="html"
                  v-if="attr.type === 'html'"
                  v-html="attr.value"
                ></span>
                <span v-else>{{ attr.value }}</span>
              </li>
            </ul> -->
          </div>
        </div>
      </div>
    </div>
    <!-- Product Description -->
    <div class="product-details" v-if="context.product.description">
      <h2
        class="bold-lg title"
        :style="'color:' + global_config.props.text_heading_link_color"
      >
        Product Description
      </h2>
      <fdk-html-content
        class="product-long-description"
        :content="context.product.description"
      ></fdk-html-content>
    </div>
    <div>
      <no-ssr>
        <fdk-accounts class="rate-prod-btn">
          <template slot-scope="accountsData">
            <fdk-add-review
              :product_type="context.product.type"
              :product_uid="context.product.uid"
            >
              <template slot-scope="reviewData">
                <div
                  class="review-container"
                  v-if="
                    checkReview ||
                    (context.is_logged_in &&
                      page_config &&
                      page_config.props.reviews &&
                      reviewData.isEligible)
                  "
                >
                  <div>
                    <p
                      class="review-container__title"
                      :style="
                        'color:' + global_config.props.text_heading_link_color
                      "
                    >
                      Ratings & Reviews
                    </p>

                    <a
                      class="add-review"
                      v-if="reviewData.isEligible && context.is_logged_in"
                      @click="
                        context.is_logged_in
                          ? redirectToAddReview()
                          : accountsData.openLogin()
                      "
                    >
                      Rate Product
                    </a>

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
                      :showtitle="false"
                    />
                    <div v-else-if="reviewData.isEligible" class="no-reviews">
                      No reviews found
                    </div>
                  </div>

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
              </template>
            </fdk-add-review>
          </template>
        </fdk-accounts>
      </no-ssr>
    </div>
    <div
      class="similar"
      v-if="
        context.similar_products &&
        page_config &&
        page_config.props.similar_products
      "
    >
      <div v-for="(similar, index) in context.similar_products" :key="index">
        <h1
          class="similar__title"
          :style="'color:' + global_config.props.text_heading_link_color"
        >
          {{ similar.title }}
        </h1>
        <div class="similar__products" v-if="similar.items">
          <group-list
            :cardlist="similar.items"
            :cardtype="'PRODUCT'"
            :itemcount="4"
            :global_config="global_config"
          ></group-list>
        </div>
      </div>
    </div>
    <div
      v-if="
        context.frequently_compared_products &&
        context.frequently_compared_products.products &&
        context.frequently_compared_products.products.length > 0 &&
        page_config.props.compare_products
      "
    >
      <compare-products
        :compare="context.frequently_compared_products"
        :global_config="global_config"
      ></compare-products>
    </div>
    <toast :id="'pdp'" ref="pdpToast" :content="toast_message"></toast>
  </div>
</template>
<!-- #region  -->

<settings>
{
"props": [
    {
      "type": "checkbox",
      "id": "wishlist",
      "label": "Wishlist",
      "default": true,
      "info": "Show Wishlist for product"
    },
    {
      "type": "checkbox",
      "id": "reviews",
      "label": "Review",
      "default": true,
      "info": "Show Reviews of product"
    },
    {
      "type": "checkbox",
      "id": "add_to_compare",
      "label": "Add to Compare",
      "default": true,
      "info": "Allow comparison of products"
    },
    {
      "type": "checkbox",
      "id": "size_guide",
      "label": "Size Guide",
      "default": true,
      "info": "Show Size Guide"
    },
    {
      "type": "checkbox",
      "id": "product_request",
      "label": "Product Request",
      "default": true,
      "info": "Show Product Request"
    },
    {
      "type": "checkbox",
      "id": "share",
      "label": "Share",
      "default": true,
      "info": "Enable Sharing product"
    },
    {
      "type": "checkbox",
      "id": "store_selection",
      "label": "Seller Store Selection",
      "default": true,
      "info": "Allow to explicitly select stores"
    },
    {
      "type": "checkbox",
      "id": "compare_products",
      "label": "Compare Products",
      "default": true,
      "info": "Show Most Compared Products"
    },
    {
      "type": "checkbox",
      "id": "variants",
      "label": "Product Variants",
      "default": true,
      "info": "Show Product Variants"
    },
    {
      "type": "checkbox",
      "id": "ratings",
      "label": "Product Rating",
      "default": true,
      "info": "Show Product Ratings"
    },
    {
      "type": "checkbox",
      "id": "similar_products",
      "label": "Similar Products",
      "default": true,
      "info": "Show Similar Products"
    },
    {
      "type": "checkbox",
      "id": "bulk_prices",
      "label": "Bulk Prices",
      "default": true,
      "info": "Show Bulk Prices"
    },
     {
      "type": "checkbox",
      "id": "show_sellers",
      "label": "Show Sellers",
      "default": true,
      "info": "Show sellers"
    }
]
}
</settings>
<!-- #endregion -->
<script>
import sizeguide from "../../components/size-guide.vue";
import toast from "../../components/common/toast.vue";
import productRequestModal from "../../components/product-description/product-request/product-request-modal.vue";
import storeCoupon from "../../components/product-description/store/coupon.vue";
import storemodal from "../../components/product-description/store/store-modal.vue";
import productVariants from "../../components/product-description/product-variants.vue";
import imageGallery from "../../components/product-description/image-gallery.vue";
import sizeSetInfo from "../../components/product-description/size/size-set-info.vue";
import deliveryInfo from "../../components/product-description/delivery-info.vue";
import ratingstar from "./../../global/components/reviews/rating-star.vue";
import compareActionModalVue from "./../../global/components/compare-action-modal.vue";
import Favourite from "../components/product-description/favourite.vue";
import share from "./../../global/components/share.vue";
import productDesc from "../../templates/components/product-description/product-desc.vue";
import groupList from "./../../global/components/group-list.vue";
import NoSSR from "vue-no-ssr";
import reviewList from "./../../global/components/reviews/review-list.vue";
import compareproducts from "../../components/product-description/compare-products.vue";

import {
  LocalStorageService,
  STORAGE_KEYS,
} from "./../../templates/services/localstorage.service";

export default {
  components: {
    "size-guide": sizeguide,
    "product-request-modal": productRequestModal,
    "product-variants": productVariants,
    "store-coupon": storeCoupon,
    "image-gallery": imageGallery,
    "size-set-info": sizeSetInfo,
    "delivery-info": deliveryInfo,
    "rating-star": ratingstar,
    "compare-action-modal": compareActionModalVue,
    "product-desc": productDesc,
    "group-list": groupList,
    favourite: Favourite,
    "no-ssr": NoSSR,
    "review-list": reviewList,
    toast,
    share,
    "store-modal": storemodal,
    "compare-products": compareproducts,
  },
  props: {
    context: {},
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    showSizeGuide(newValue) {
      if (newValue) {
        document.querySelector("body").style.overflow = "hidden";
      }
    },
    storeInfo() {
      this.storeInfoSelected = Object.assign(
        {},
        this.storeInfoSelected,
        this.storeInfo
      );
    },
    context(newValue) {
      this.context = newValue;
    },
    $route(to, from) {
      if (to.path != from.path) {
        (this.storeInfoSelected = {}), (this.storeInfo = null);
      }
    },
  },
  data() {
    return {
      selectedSize: "",
      shippable: false,
      showSizeGuide: false,
      pincodeError: false,
      sizeError: false,
      pincodeSuccess: false,
      // pincode: this.context.user_pincode || "",
      pincode: LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE) || "",
      isMounted: false,
      fromPincode: null,
      toast_message: "",
      storeInfo: null,
      sizePrice: null,
      showProductRequestModal: false,
      showUserPincodeModal: "",
      message: "",
      showMessage: false,
      showCompareActionModal: false,
      shareLoading: false,
      qr_code: "",
      share_link: "",
      showShare: false,
      compareMsg: {
        title: "",
      },
      checkingPin: false,
      isExplicitelySelectedStore: false,
      loadSpinner: false,
      storeInfoSelected: {},
      all_stores_info: null,
      notifMsg: "Saved, We'll notify you when this product is back in Stock",
      store_count: null,
      showStoreModal: false,
      showSoldByModal: false,
    };
  },
  computed: {
    showSellers(){
      return this.page_config?.props?.show_sellers
    },
    checkSelleble() {
      return this.context.product_meta.hasOwnProperty("sellable");
    },
    checkReview() {
      if (
        this.page_config &&
        this.page_config.props.reviews &&
        this.context &&
        this.context.reviews &&
        this.context.reviews.data &&
        this.context.reviews.data.length &&
        this.context.reviews.data.length > 0
      ) {
        return true;
      }
      return false;
    },
    getMedias() {
      let images = [];
      if (this.context?.product?.medias.length > 0) {
        return this.context?.product?.medias;
      } else {
        images.push({
          type: "image",
          url: "https://hdn-1.fynd.com/company/884/applications/000000000000000000000001/theme/pictures/free/original/theme-image-1623307821127.png",
        });
        return images;
      }
    },

    isSizeSet() {
      return this.storeInfo && this.storeInfo.is_set;
    },
    isProductRequestEnabled() {
      if (
        this.isMounted &&
        this.context.is_logged_in &&
        this.context.app_features &&
        this.context.app_features.feature &&
        this.context.app_features.feature.product_detail &&
        this.context.app_features.feature.product_detail.request_product
      ) {
        return true;
      }
      return false;
    },
    getCategoryId() {
      let product = this.context.product;
      if (product.categories && product.categories.length) {
        return product.categories[0].id;
      }
      return "";
    },
  },
  methods: {
    productNotify(notifyProduct) {
      let payload = {
        id: this.context.product.uid,
      };
      notifyProduct.notify(payload);
      this.$toasted.success(this.notifMsg, {
        position: "bottom-center",
        duration: 2000,
      });
    },
    getShareLink(share) {
      this.shareLoading = true;
      this.showShare = true;
      share.getShareLink(window.location.href).then((res) => {
        share.generateQRCode(res).then((data) => {
          this.qr_code = `
                <div style="width: 250px;">
                  ${data.svg}
                </div>
                `;
          this.share_link = res;
          this.shareLoading = false;
        });
      });
    },
    formatAttr(key) {
      return key.split("_").join(" ");
    },
    getAttributes() {
      let keys = Object.keys(this.context.product.attributes) || [];
      if (keys && keys.length) {
        keys = keys.filter((entry) => {
          return !(
            entry === "style_note" ||
            entry === "product_details" ||
            entry === "description"
          );
        });
      }
      return keys.sort();
    },
    getProductPrice(key) {
      if (this.storeInfo && this.storeInfo.price) {
        const { is_set } = this.storeInfo;
        if (is_set) {
          return this.storeInfo.price_per_piece[key];
        }
        return this.storeInfo.price[key];
      }
      if (this.context.product_meta?.price) {
        return this.context.product_meta.price[key].min !==
          this.context.product_meta.price[key].max
          ? this.$options.filters.currencyformat(
              this.context.product_meta.price[key].min
            ) +
              " - " +
              this.$options.filters.currencyformat(
                this.context.product_meta.price[key].max
              )
          : this.context.product_meta.price[key].max;
      }
    },
    getPrice(price) {
      if (price.min === price.max) {
        return this.$options.filters.currencyformat(price.min);
      }
      return (
        this.$options.filters.currencyformat(price.min) +
        " - " +
        this.$options.filters.currencyformat(price.max)
      );
    },

    checkLength() {
      if (`${this.pincode}`.length > 6) this.pincode = this.pincode.slice(0, 6);
    },
    updateStoreFilter(filtertype) {
      this.storeCompanyFilter = filtertype;
      this.getStores(this.loadStoreFunction);
    },
    setStoreInfo(store) {
      this.storeInfoSelected = Object.assign({}, this.storeInfoSelected, store);
      this.storeInfo = this.storeInfoSelected;
      this.showStoreModal = false;
      this.isExplicitelySelectedStore = true;
    },
    getStores(loadStores) {
      let options = {
        strategy: this.storeCompanyFilter || "",
        page: 1,
      };
      loadStores(options)
        .then((res) => {
          this.all_stores_info = res;
        })
        .catch((err) => {});
    },
    onSizeClicked(sellerData) {
      this.isExplicitelySelectedStore = false;
      this.loadSellerFunction = sellerData.loadSellers;
      if (!LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE)) {
        this.showUserPincodeModal = true;
      } else {
        this.sizeClicked(sellerData.loadSellers);
      }
    },
    sizeClicked(loadSellers) {
      let promises = [];
      let options = {
        size: this.selectedSize,
        slug: this.context.product.slug,
        pincode: this.pincode,
      };

      this.loadSpinner = true;

      loadSellers(options)
        .then((res) => {
          this.storeInfo = res;
          this.store_count = res.store.count;
          this.showSoldByModal = true;
          this.loadSpinner = false;
        })
        .catch((err) => {
          this.loadSpinner = false;
        });
    },
    redirectToReview() {
      this.$router.push({
        path: `${this.$route.path}/reviews`,
        query: { type: "product", uid: this.context.product.uid },
      });
    },
    redirectToAddReview() {
      this.$router.push({
        path: `${this.$route.path}/add-review`,
        query: { type: "product", uid: this.context.product.uid },
      });
    },
    addToCart(cart) {
      if (this.product_meta?.sizes?.length == 0) {
        this.message = "No sizes available. Product Out of Stock";
        this.showMessage = true;
        return;
      } else if (!this.selectedSize) {
        this.sizeError = true;
        if (window.innerWidth < 780) {
          var top = this.$refs.sizeContainer.offsetTop;
          window.scrollTo(0, 0);
        }
        return;
      }

      let data = {
        slug: this.context.product.slug,
        size: this.selectedSize,
        pincode: this.pincode,
      };
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
      cart.addToCart(addItemData).then((data) => {
        if (data.success) {
          if (this.$refs.carousel) {
            this.$refs.carousel.$el.style.visibility = "hidden";
          }
          this.$router.push("/cart/bag");
        } else {
          this.toast_message = "Something went wrong";
          this.$refs.pdpToast.showToast();
        }
      });
      // })
      // .catch(console.error);
    },
    onDialogClosed() {
      this.showUserPincodeModal = false;
      if (
        LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE) &&
        this.selectedSize
      ) {
        this.sizeClicked(this.loadSellerFunction);
      } else if (!LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE)) {
        this.selectedSize = "";
      }
    },
    onPincodeChanged(event) {
      this.pincode = event;
      this.sizeClicked(this.loadSellerFunction);
    },
    hideShare() {
      this.showShare = false;
    },
    onTatError(err) {
      this.message = err;
      this.showMessage = true;
    },
    onHideTatError() {
      this.message = "";
      this.showMessage = false;
    },
    addCompareProducts(promiseFn, productUid) {
      if (this.context.compare_slugs.length < 3) {
        promiseFn(productUid)
          .then((res) => {
            //todo
          })
          .catch((err) => {
            //show error
            this.compareMsg.title = err.message || "Something went wrong";
            this.showCompareActionModal = true;
          });
      } else {
        //show popup max upto 3
        this.compareMsg.title = "You can only compare 3 products at a time";
        this.showCompareActionModal = true;
      }
    },
    closedDialog() {
      this.showStoreModal = false;
    },
    hideCompareModal() {
      this.showCompareActionModal = false;
      this.compareMsg.title = "";
    },
    setCanvasDimension() {
      let canvas = this.$refs["preview"];
      canvas.style.top = window.scrollY + "px";
    },
    showPreview(data) {
      let canvas = this.$refs["preview"];
      if (canvas) {
        if (data.show) {
          this.setCanvasDimension();
          canvas.style.display = "block";
        } else {
          canvas.style.display = "none";
          return;
        }

        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
          data.image,
          (data.image.naturalWidth * data.gridRect.left) /
            data.imageInGrid.width,
          (data.image.naturalHeight * data.gridRect.top) /
            data.imageInGrid.height,
          (data.image.naturalWidth * data.gridRect.width) /
            data.imageInGrid.width,
          (data.image.naturalHeight * data.gridRect.height) /
            data.imageInGrid.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    },
  },
};
</script>

<style lang="less" scoped>
.notify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    margin-right: 10px;
  }
}
.inactive {
  opacity: 0.4;
  cursor: auto;
  pointer-events: none;
}
.share-like-box {
  position: absolute;
  right: 30px;

  .mark-fav {
    cursor: pointer;
    margin-bottom: 10px;
    margin-left: 2px;
  }
  .share-button {
    cursor: pointer;
    .share-img {
      position: relative;
    }
  }
}
.review-container {
  background-color: @White;
  padding: 20px 20px 20px 0;
  margin-top: 20px;
  .rate-prod-btn {
    display: block;
    text-align: center;
    margin: 10px 0 0 0;
  }
  &__title {
    font-size: 1.5625rem;
    font-weight: 600;
    margin: 10px 0 0 0;
    text-transform: capitalize;
    display: flex;
    justify-content: center;
    color: @color-black;
    @media @mobile {
      font-size: 1.2rem;
    }
    a {
      padding: 0 0 0 20px;
      text-transform: capitalize;
    }
  }
  .add-review {
    // text-transform: uppercase;
    font-size: 14px;
    text-decoration: underline;
    // color: @Black;
    cursor: pointer;
    text-align: center;
    margin: 10px 0 0 0;
    display: block;
  }

  .no-reviews {
    margin: 20px 0;
    text-align: center;
  }

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
}
.product-rating-count {
  // margin-bottom: 20px;
  margin-bottom: 0.78125rem;
}
.book-appt-n-compare {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 25px 0 0 0;
  @media @tablet {
    flex-direction: column;
  }
  > :first-child {
    flex: 0 0 51%;
    @media @tablet {
      width: 100%;
    }
  }
  > :nth-child(2) {
    flex: 0 0 43%;
    @media @tablet {
      width: 100%;
      margin-top: 20px;
    }
  }
}
.seller-info {
  margin-bottom: 5px;
  line-height: 20px;
  .seller-name {
    // color: #41434c;
    padding: 5px 0;
    .store-seller {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
.compare-container {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--button_tertiary_label_color);
  border: 1px solid var(--button_tertiary_color);
  font-size: 14px;
  padding: 12.5px 0;
  cursor: pointer;
  .compare-icon {
    padding: 0 5px;
    .a,
    .d {
      fill: none;
    }
    .a {
      stroke: var(--button_tertiary_label_color);
      stroke-width: 0.8px;
    }
    .b {
      fill: var(--button_tertiary_label_color);
    }
    .c {
      stroke: none;
    }
    img {
      width: 18px;
    }
  }
}

.product-details-right {
  -webkit-column-count: 1; /* Chrome, Safari, Opera */
  -moz-column-count: 1; /* Firefox */
  column-count: 1;
  @media @mobile {
    -webkit-column-count: 12; /* Chrome, Safari, Opera */
    -moz-column-count: 1; /* Firefox */
    column-count: 1;
  }
  &.columns1 {
    -webkit-column-count: 12; /* Chrome, Safari, Opera */
    -moz-column-count: 1; /* Firefox */
    column-count: 1;
  }
  .product-attr-table {
    min-width: 320px;
    box-sizing: border-box;
    tr {
      // border-bottom: 1px solid #e4e4e4;
      text-align: left;
      font-size: 14px;
      -webkit-column-break-inside: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
      td {
        height: 40px;
        text-align: left;
        vertical-align: middle;
        padding: 5px 10px 10px 0;
        line-height: 20px;
        word-wrap: break-word;
        word-break: break-word;
        text-transform: capitalize;
      }
      .key {
        font-weight: 700;
        // background-color: #f3f3f3;
        width: 40%;
      }
    }
  }
}

/deep/.product-details {
  margin-top: 20px;
  padding: 0 20px 20px 20px;
  h2 {
    text-align: center;
    padding: 20px 0;
    font-size: 1.5625rem;
    font-weight: 600;
  }
  .product-long-description {
    line-height: 20px;
    font-size: 14px;
    overflow-wrap: break-word;
    b {
      font-weight: 700;
      margin-top: 25px;
      display: block;
    }
    br {
      content: "";
      display: block;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 10px;
      line-height: 20px;
      img {
        margin: 10px 0;
      }
    }
    video {
      max-width: 100% !important;
    }
  }
}
.product__attributes--item {
  display: flex;
  align-items: center;
}
.main-container {
  background-color: @color-white;
  padding: 1.5625rem;
  margin-top: 1.5625rem;
  @media @mobile {
    padding: 0;
    margin-top: 0;
  }
  .product-desc-container {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    overflow: hidden;
    @media @mobile {
      flex-direction: column;
    }
    .left {
      flex: 0 0 58%;
      overflow: hidden;
    }
    .right {
      flex: 0 0 40.5%;
      padding: 20px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      @media @mobile {
        width: 100%;
        padding: 1.25rem;
        box-sizing: border-box;
      }
      .preview {
        display: none;
        position: absolute;
        z-index: 1;
        margin-top: 15px;
        width: 100%;
      }
      .product {
        &__title {
          font-size: 1.5625rem;
          margin-bottom: 0.3125rem;
          padding-right: 35px;
          @media @tablet {
            padding-right: 45px;
          }
        }
        &__price {
          font-size: 1.125rem;
          display: flex;
          align-items: flex-end;
          margin-bottom: 0.625rem;
          &--marked {
            margin-left: 0.9375rem;
            font-size: 0.875rem;
            text-decoration: line-through;
            opacity: 0.8;
            line-height: 1.1rem;
          }
        }
        &__size {
          margin-bottom: 0.625rem;
          &--text {
            // color: @color-gray-2;
            font-size: 0.75rem;
            line-height: 1.0625rem;
          }
          &--guide {
            cursor: pointer;
            margin-top: 0.625rem;
            font-weight: bold;
            width: 110px;
          }
          .size-list {
            display: flex;
            font-size: 1rem;
            margin-top: 0.625rem;
            flex-wrap: wrap;
            &__item {
              padding: 0.3125rem 4px;
              margin-right: 0.625rem;
              min-width: 3.125rem;
              cursor: pointer;
              border: 1px solid @border-color;
              color: @color-gray;
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-bottom: 10px;
              &--selected {
                background-color: @primary-color;
                color: @color-white;
                border-color: transparent;
              }
            }
          }
        }
        &__actions {
          margin-top: 1.875rem;

          .button {
            font-size: 1rem;
            width: 100%;
            text-transform: uppercase;
            text-align: center;
            color: @color-white;
            height: 3rem;
            cursor: pointer;
            border: 1px solid transparent;
            transition: all 0.4s;
          }
        }
        &__pincode {
          margin-top: 2.1875rem;
          .delivery-options {
            color: #1d1d1d;
            font-size: 0.75rem;
            letter-spacing: 0.78px;
            line-height: 18px;
            text-transform: uppercase;
          }
          .input-wrapper {
            position: relative;
            display: flex;
            margin-top: 1em;
          }
          .pincode-input {
            width: 35%;
            @media @mobile {
              width: 100%;
              box-sizing: border-box;
            }
            height: 40px;
            padding: 0 1em;
            font-size: 14px;
            border: 1px solid #000000;
            color: #000000;
          }
          .check-btn {
            font-size: 14px;
            letter-spacing: 0.06px;
            cursor: pointer;
            background: #fff;
            position: absolute;
            left: 29%;
            top: 10px;
          }
          .spinner {
            width: 48px;
            height: 40px;
            margin-top: -3px;
            padding-left: 10px;
          }
        }
        &__attributes {
          font-size: 0.875rem;
          color: @color-gray;
          h3 {
            color: @color-black;
          }
          &--item {
            @media @mobile {
              display: flex;
              width: 100%;
            }
            span {
              display: inline-block;
              min-width: 9.375rem;
              @media @mobile {
                width: 100%;
              }
              white-space: pre-wrap;
            }
            span.html {
              display: inline-block;
              min-width: 9.375rem;
              white-space: nowrap;
              @media @mobile {
                width: 100%;
              }
            }
          }
          .attr-para {
            margin-bottom: 0.9375rem;
            display: flex;
            @media @mobile {
              // flex-direction: column;
            }
          }
        }
      }
    }
  }
  .similar {
    &__title {
      margin-top: 3.125rem;
      font-size: 1.5625rem;
      text-align: center;
      //   text-transform: uppercase;
      font-weight: 600;
      @media @mobile {
        font-size: 1.2rem;
      }
    }
    &__products {
      display: flex;
      flex-wrap: wrap;
      margin-top: 3.125rem;
      @media @mobile {
        padding: 1.5625rem;
        box-sizing: border-box;
        margin-top: 0;
      }
      &--item {
        &:not(:last-child) {
          margin-right: 20px;
          @media @mobile {
            margin-right: 0;
          }
        }
      }
    }
  }
}
.atr_key {
  &::after {
    content: ":";
    @media @mobile {
      content: "";
    }
  }
}
</style>

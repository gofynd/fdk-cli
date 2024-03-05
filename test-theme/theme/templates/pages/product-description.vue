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
        <!-- Extension Slot (Above Image Component) -->
        <fdk-extension
          v-if="getTemplates('above_image_component').length"
          :templates="getTemplates('above_image_component')"
        />

        <image-gallery
          :images="getMedias"
          :product="context.product"
          v-on:paint-canvas="showPreview"
        />

        <!-- Extension Slot (Below Image Component) -->
        <fdk-extension
          v-if="getTemplates('below_image_component').length"
          :templates="getTemplates('below_image_component')"
        />
      </div>
      <div class="right">
        <!-- Extension Slot (Above Product Info) -->
        <fdk-extension
          v-if="getTemplates('above_product_info').length"
          :templates="getTemplates('above_product_info')"
        />

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
              <div>
                <div class="share-button" @click="getShareLink(share)">
                  <div class="svg-wrapper">
                    <svg-wrapper
                      :svg_src="'share'"
                      class="share-img"
                    ></svg-wrapper>
                  </div>
                </div>
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
            <span class="mrp-label" v-if="page_config.props.mrp_label"
              >MRP:</span
            >
            <span
              class="product__price--marked"
              :style="
                'color:' + global_config.props.text_strikethrough_price_color
              "
              v-if="getProductPrice('effective') !== getProductPrice('marked')"
              >{{ getProductPrice("marked") | currencyformat }}
            </span>
            <span
              v-if="activeLadderIndex || activeLadderIndex == 0"
              class="product__price--effective"
              :style="
                activeLadder.price.offer_price !== getProductPrice('marked')
                  ? 'color:' + global_config.props.text_sale_price_color
                  : 'color:' + global_config.props.text_price_color
              "
              >{{ activeLadder.price.offer_price | currencyformat }}</span
            >
            <span
              v-else
              class="product__price--effective"
              :style="
                getProductPrice('effective') !== getProductPrice('marked')
                  ? 'color:' + global_config.props.text_sale_price_color
                  : 'color:' + global_config.props.text_price_color
              "
              >{{ getProductPrice("effective") | currencyformat }}</span
            >
            <div
              v-if="page_config.props.tax_label"
              class="tax-label"
              :style="'color:' + global_config.props.tax_label_color"
            >
              {{ page_config.props.tax_label }}
            </div>
          </div>

          <!-- Extension Slot (Below Price Component) -->
          <fdk-extension
            v-if="getTemplates('below_price_component').length"
            :templates="getTemplates('below_price_component')"
          />
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
                    onSizeClicked(size, sellerData);
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
                  storeInfoSelected.store.name &&
                  !pincodeError
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

          <!-- Extension Slot (Below Size Component) -->
          <fdk-extension
            v-if="getTemplates('below_size_component').length"
            :templates="getTemplates('below_size_component')"
          />

          <ladder-pricing
            v-if="
              ladderPrices &&
              ladderPrices.available_offers &&
              ladderPrices.available_offers.length > 0 &&
              ladderPrices.available_offers[0].offer_prices
            "
            :ladderPrices="ladderPrices"
            :cartItem="cartItem"
            :activeLadderIndex="activeLadderIndex"
            class="ladder-pricing"
          ></ladder-pricing>

          <fdk-cart class="product__actions" ref="cart">
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
              <button
                class="button"
                @click="addToCart(cart, true)"
                v-if="
                  context.product_meta &&
                  context.product_meta.sellable &&
                  !global_config.props.disable_cart &&
                  page_config &&
                  page_config.props &&
                  page_config.props.buynow
                "
                :style="`background-color: ${global_config.props.button_add_to_cart_color};color:${global_config.props.button_add_to_cart_label_color};margin-top:10px;`"
              >
                <p>Buy Now</p>
              </button>
            </template>
          </fdk-cart>
          <div
            class="product__actions"
            v-if="
              checkSelleble &&
              !context.product_meta.sellable &&
              !global_config.props.disable_cart
            "
          >
            <div
              class="button flex-center"
              :style="`background-color: ${global_config.props.button_add_to_cart_color}80;color:${global_config.props.button_add_to_cart_label_color};margin-top:10px; cursor:inherit`"
            >
              <p>PRODUCT NOT AVAILABLE</p>
            </div>
          </div>
          <!-- Extension Slot (Below Add To Cart Button) -->
          <fdk-extension
            v-if="getTemplates('below_add_to_cart').length"
            :templates="getTemplates('below_add_to_cart')"
          />

          <!--Delivery Info-->
          <delivery-info
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
            :pincode="pincode"
            :pincodeError="pincodeError"
            @togglePincodeError="togglePincodeError"
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
                    <svg-wrapper
                      :svg_src="'compare-icon'"
                      class="compare-icon"
                    ></svg-wrapper>
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

          <!-- Extension Slot (Below Product Info) -->
          <fdk-extension
            v-if="getTemplates('below_product_info').length"
            :templates="getTemplates('below_product_info')"
          />
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

    <!-- Extension Slot (Bottom of Product description) -->
    <fdk-extension
      v-if="getTemplates('product_description_bottom').length"
      :templates="getTemplates('product_description_bottom')"
    />

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
            :listing_price_config="listingPriceConfig"
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
      "id": "buynow",
      "label": "Buy Now",
      "default": false,
      "info": "Show Buy Now button for product"
    },
    {
      "type": "checkbox",
      "id": "mrp_label",
      "label": "Display MRP label text",
      "default": true
    },
    {
      "type": "text",
      "id": "tax_label",
      "default": "Price inclusive of all taxes",
      "label": "Price tax label text"
    },
    {
      "type": "text",
      "id": "default_pincode",
      "label": "Default Pincode",
      "default": ""
    },
    {
      "type": "checkbox",
      "id": "default_size",
      "label": "Default Size",
      "default": true,
      "info": "Add default size"
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
    },
    {
      "type": "extension",
      "id": "extension",
      "label": "Extension Positions",
      "info": "Handle extension in these positions",
      "positions": [
        {
          "value": "above_image_component",
          "text": "Above Image Component"
        },
        {
          "value": "below_image_component",
          "text": "Below Image Component"
        },
        {
          "value": "above_product_info",
          "text": "Above Product Info"
        },
        {
          "value": "below_price_component",
          "text": "Below Price Component"
        },
        {
          "value": "below_size_component",
          "text": "Below Size Component"
        },
        {
          "value": "below_add_to_cart",
          "text" : "Below Add To Cart"
        },
        {
          "value": "below_product_info",
          "text": "Below Product Info"
        },
        {
          "value": "product_description_bottom",
          "text": "Bottom Of Product Description"
        }
      ],
      "default": {}
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
import compareActionModalVue from "./../../global/components/compare-action-modal.vue";
import Favourite from "../components/product-description/favourite.vue";
import share from "./../../global/components/share.vue";
import productDesc from "../../templates/components/product-description/product-desc.vue";
import groupList from "./../../global/components/group-list.vue";
import NoSSR from "vue-no-ssr";
import compareproducts from "../../components/product-description/compare-products.vue";
import SvgWrapper from "../../components/common/svg-wrapper.vue";
import LadderPricing from "../components/product-description/ladder-price.vue";

export default {
  components: {
    "size-guide": sizeguide,
    "product-request-modal": productRequestModal,
    "product-variants": productVariants,
    "store-coupon": storeCoupon,
    "image-gallery": imageGallery,
    "size-set-info": sizeSetInfo,
    "delivery-info": deliveryInfo,
    "compare-action-modal": compareActionModalVue,
    "product-desc": productDesc,
    "group-list": groupList,
    favourite: Favourite,
    "no-ssr": NoSSR,
    toast,
    share,
    "store-modal": storemodal,
    "compare-products": compareproducts,
    "svg-wrapper": SvgWrapper,
    "ladder-pricing": LadderPricing,
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
      if (
        !this.selectedSize &&
        !newValue.product?.loading &&
        !newValue.product_meta?.loading
      ) {
        this.preSizeSelect();
      }
    },
    $route(to, from) {
      if (to.path != from.path) {
        (this.ladderPrices = null),
          (this.storeInfoSelected = {}),
          (this.storeInfo = null),
          (this.selectedSize = "");
      }
    },
  },
  data() {
    return {
      selectedSize: "",
      shippable: false,
      showSizeGuide: false,
      pincodeError: false,
      pincodeErrorMsg: "",
      sizeError: false,
      pincodeSuccess: false,
      pincode:
        this.context.user_pincode ||
        this.page_config?.props?.default_pincode ||
        "",
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
      ladderPrices: null,
      activeLadderIndex: null,
      activeLadder: null,
    };
  },
  computed: {
    cartItem() {
      return this.cartObj[this.context.product.uid]?.item;
    },
    cartObj() {
      let cartData = {};
      for (let ele = 0; ele < this.context?.bag_data?.items?.length; ele++) {
        cartData[this.context?.bag_data?.items[ele].product.uid] = {
          item: this.context?.bag_data?.items[ele],
        };
      }
      return cartData;
    },
    ladderOffers() {
      return this.ladderPrices?.available_offers[0]?.offer_prices;
    },
    listingPriceConfig() {
      return this.context.app_features?.feature?.common?.listing_price?.value;
    },
    showSellers() {
      return this.page_config?.props?.show_sellers;
    },
    checkSelleble() {
      return this.context?.product_meta?.hasOwnProperty("sellable");
    },
    getMedias() {
      let images = [];
      if (this.context?.product?.medias.length > 0) {
        return this.context?.product?.medias;
      } else {
        images.push({
          type: "image",
          url: require("../../assets/images/image-gallery-placeholder.png"),
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
    togglePincodeError(value) {
      this.pincodeError = value;
    },
    getLadderOffers() {
      this.$refs.cart
        .getLadderOffers({
          slug: this.context.product.slug,
          storeId: this.storeInfo?.store?.uid.toString()
            ? this.storeInfo?.store?.uid.toString()
            : "",
        })
        .then((data) => {
          this.ladderPrices = data;
          this.isAplliedLadderPrice();
        })
        .catch((err) => {
          this.ladderPrices = null;
          console.log(err);
        });
    },
    isAplliedLadderPrice() {
      if (!this.cartItem?.quantity || !this.ladderOffers) {
        this.activeLadderIndex = null;
        this.activeLadder = null;
        return false;
      }
      let isFoundInLadder = false;

      for (let i = 0; i < this.ladderOffers.length; i++) {
        let isLastIndex = this.ladderOffers.length - 1 == i;
        if (isLastIndex) {
          isFoundInLadder =
            this.cartItem.quantity >= this.ladderOffers[i].min_quantity;
        } else {
          isFoundInLadder =
            this.cartItem.quantity >= this.ladderOffers[i].min_quantity &&
            this.cartItem.quantity <= this.ladderOffers[i].max_quantity;
        }
        if (isFoundInLadder) {
          this.activeLadderIndex = i;
          this.activeLadder = this.ladderOffers[i];
          break;
        }
      }
      if (!isFoundInLadder) {
        this.activeLadderIndex = null;
        this.activeLadder = null;
      }
    },
    getTemplates(position) {
      return this.page_config.props?.extension?.[position] || [];
    },
    preSizeSelect() {
      if (this.page_config?.props?.default_size) {
        const sizes = this.context?.product_meta?.sizes || [];
        const firstAvailableSize = sizes.find((size) => size.is_available);
        if (firstAvailableSize) {
          this.$nextTick(() => {
            let self = this;
            self.onSizeClicked(firstAvailableSize, self.$refs?.sizeContainer);
          });
        }
        if (
          !this.page_config?.props?.default_pincode &&
          !this.context?.user_pincode
        ) {
          this.showUserPincodeModal = true;
        }
      }
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
      this.getLadderOffers();
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
    onSizeClicked(size, sellerData) {
      this.selectedSize = size.display;
      this.isExplicitelySelectedStore = false;
      if (!this.pincode) {
        this.showUserPincodeModal = true;
      } else {
        this.sizeClicked(sellerData.loadSellers);
      }
    },
    sizeClicked(loadSellers) {
      let options = {
        size: this.selectedSize,
        slug: this.context.product.slug,
        pincode: this.pincode,
      };
      this.loadSpinner = true;

      loadSellers(options)
        .then((res) => {
          if (res && Object.keys(res).length) {
            this.storeInfo = res;
            this.store_count = res.store.count;
            this.showSoldByModal = true;
            this.loadSpinner = false;
            this.getLadderOffers();
            this.pincodeError = false;
          } else {
            return Promise.reject();
          }
        })
        .catch((err) => {
          this.loadSpinner = false;
          this.pincodeErrorMsg = err?.message || "Something went wrong";
          this.toast_message = err?.message || "Something went wrong";
          this.$refs.pdpToast.showToast();
          this.pincodeError = true;
          this.storeInfo = null;
          this.storeInfoSelected = {};
        });
    },
    addToCart(cart, buyNow = false) {
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
      } else if (this.pincodeError) {
        this.toast_message = this.pincodeErrorMsg || "Something went wrong";
        this.$refs.pdpToast.showToast();
        if (window.innerWidth < 780) {
          var top = this.$refs.sizeContainer.offsetTop;
          window.scrollTo(0, 0);
        }
        return;
      }

      let addItemData = {
        items: [
          {
            item_id: this.context.product.uid,
            item_size: this.selectedSize,
            quantity: 1,
            article_assignment: this.storeInfo?.article_assignment,
            seller_id: this.storeInfo?.seller.uid,
            store_id: this.storeInfo?.store.uid,
          },
        ],
        buy_now: buyNow,
      };
      cart
        .addToCart(addItemData)
        .then((data) => {
          if (data.success) {
            if (this.$refs.carousel) {
              this.$refs.carousel.$el.style.visibility = "hidden";
            }
            this.$router.push("/cart/bag");
          } else {
            this.toast_message = data?.message;
            this.$refs.pdpToast.showToast();
          }
        })
        .catch((err) => {
          this.toast_message = err?.message || "Something went wrong";
          this.$refs.pdpToast.showToast();
        });
    },
    onDialogClosed() {
      this.showUserPincodeModal = false;
      if (this.pincode && this.selectedSize) {
        this.sizeClicked(this.$refs?.sizeContainer?.loadSellers);
      } else if (!this.pincode) {
        this.selectedSize = "";
      }
    },
    onPincodeChanged(event) {
      this.pincode = event;
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
.svg-wrapper {
  position: relative;
  width: 24px;
  height: 24px;
}

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
      height: 24px;
      width: 24px;
    }
  }
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
  -webkit-column-count: 1;
  /* Chrome, Safari, Opera */
  -moz-column-count: 1;
  /* Firefox */
  column-count: 1;

  @media @mobile {
    -webkit-column-count: 12;
    /* Chrome, Safari, Opera */
    -moz-column-count: 1;
    /* Firefox */
    column-count: 1;
  }

  &.columns1 {
    -webkit-column-count: 12;
    /* Chrome, Safari, Opera */
    -moz-column-count: 1;
    /* Firefox */
    column-count: 1;
  }

  .product-attr-table {
    min-width: 320px;
    box-sizing: border-box;

    tr {
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

    @media @tablet {
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

        .tax-label {
          line-height: 20px;
          margin-top: 10px;
        }

        &__price {
          font-size: 1.125rem;
          margin-bottom: 0.625rem;

          &--marked {
            margin-right: 0.9375rem;
            text-decoration: line-through;
            opacity: 0.8;
          }

          .mrp-label {
            margin-right: 5px;
          }
        }

        &__size {
          margin-bottom: 0.625rem;

          &--text {
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

.ladder-pricing {
  margin-top: 10px;
}
</style>

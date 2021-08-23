<template>
  <div
    class="
      container-fluid
      product-detail product-wrapper
      back-in-stock-notification
    "
    v-if="context && context.product && context.product.attributes"
  >
    <div class="row">
      <div class="col-12 col-lg-7">
        <div
          class="product-images"
          v-if="context.product.medias && context.product.medias.length"
        >
          <ul class="product-images__list">
            <li
              class="product-images__list--item"
              v-for="(image, index) in context.product.medias"
              :key="index"
              :class="{
                'selected-image':
                  selectedImage && selectedImage.url === image.url,
              }"
              @click="changeImage($event, image)"
            >
              <nm-image
                v-if="image.type === 'image'"
                :src="image.url"
                :alt="context.product.name"
                ref="imageListItem"
                id="imageListItem"
              />
              <video v-if="image.type === 'video'" :src="image.url" />
              <div v-if="image.type === '3d_model'" class="type-3d_model">
                <img src="../../assets/images/3D.svg" />
              </div>
            </li>
          </ul>
          <div class="product-images__selected">
            <template v-if="selectLoading"></template>
            <template v-else>
              <img
                :src="selectedImage.url"
                v-if="selectedImage && selectedImage.type === 'image'"
                alt="Active-Image"
                class="product-images__selected--img"
                ref="selectedImage"
                id="activeImage"
                @mouseenter="pdpImageHover"
                @mouseleave="pdpMouseOut"
                @click="showZoomModal = true"
                @load="OriginalImageLoaded"
              />
              <!-- <img slot="preloader" src="../../assets/images/loader.gif" /> -->
              <div
                v-else-if="selectedImage && selectedImage.type === 'video'"
                style="position: relative"
                @click="showZoomModal = true"
              >
                <video :src="selectedImage.url" controls></video>
              </div>
              <div
                v-if="
                  selectedImage &&
                    selectedImage.type === '3d_model' &&
                    isMounted
                "
                class="type-3d_model"
              >
                <no-ssr>
                  <viewer-3d :src="selectedImage.url"></viewer-3d>
                </no-ssr>
                <div class="expand-btn" @click="showZoomModal = true">
                  <img src="../../assets/images/expand.svg" />
                </div>
              </div>
            </template>
            <div class="image-preview" ref="imagePreview"></div>
          </div>
          <div class="mobile-product-images">
            <ul class="mobile-product-images__list">
              <li
                class="mobile-product-images__list--item"
                :class="{ 'selected-image': selectedImage === image.url }"
                v-for="(image, index) in context.product.medias"
                :key="index"
                @click="showZoomModal = true"
              >
                <div class="slide">
                  <nm-image
                    v-if="image.type === 'image'"
                    :src="image.url"
                    :alt="context.product.name"
                  />
                  <video
                    v-if="image.type === 'video'"
                    controls
                    :src="image.url"
                  />
                  <div
                    v-if="image.type === '3d_model' && isMounted"
                    class="type-3d_model"
                  >
                    <no-ssr>
                      <viewer-3d :src="image.url" prompt="none"></viewer-3d>
                    </no-ssr>
                    <div class="overlay-icon">
                      <img src="../../assets/images/3D.svg" />
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="product-images__zoom-modal" v-if="showZoomModal">
            <div class="close-icon" @click.stop="showZoomModal = false"></div>
            <div class="zoom-inner-wrapper">
              <div class="zoom-selected">
                <template v-if="selectLoading"> </template>
                <template v-else>
                  <nm-image
                    v-if="selectedImage && selectedImage.type === 'image'"
                    :src="selectedImage.url"
                    :alt="context.product.name"
                  />
                  <video
                    v-if="selectedImage && selectedImage.type === 'video'"
                    :src="selectedImage.url"
                    controls
                  />
                  <div
                    v-if="
                      selectedImage &&
                        selectedImage.type === '3d_model' &&
                        isMounted
                    "
                    class="type-3d_model"
                  >
                    <no-ssr>
                      <viewer-3d :src="selectedImage.url"></viewer-3d>
                    </no-ssr>
                  </div>
                </template>
              </div>
              <ul class="zoom-list">
                <li
                  class="zoom-list-item"
                  v-for="(image, index) in context.product.medias"
                  :key="index"
                  @click.stop="zoomListItemClick(image)"
                >
                  <nm-image
                    v-if="image.type === 'image'"
                    :src="image.url"
                    :alt="context.product.name"
                    :class="{ 'selected-image': selectedImage === image }"
                  />
                  <video
                    v-if="image.type === 'video'"
                    :src="image.url"
                    :class="{ 'selected-image': selectedImage === image }"
                  />
                  <div v-if="image.type === '3d_model'" class="type-3d_model">
                    <img src="../../assets/images/3D.svg" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div
            class="zoom-overlay"
            v-if="showZoomModal"
            @click.stop="showZoomModal = false"
          ></div>
        </div>
        <div
          v-else-if="context.product.medias.length === 0"
          class="placeholder-class"
        >
          <img src="./../../assets/images/placeholder.png" />
        </div>
        <!-- <div
          class="product-long-description"
          v-if="
            !detectMobileWidth() && context.product.attributes.product_details
          "
          v-html="context.product.attributes.product_details"
        ></div> -->
      </div>
      <div class="product-content col-12 col-lg-5">
        <div class="product-name-block">
          <div>
            <h1 class="product-title" :title="context.product.name">
              {{ context.product.name }}
            </h1>

            <h2 class="heading-small">
              {{ context.product.attributes.subtitle }}
            </h2>
          </div>
          <div>
            <fdk-share
              v-click-outside="hideShare"
              v-if="pageConfig && pageConfig.share"
            >
              <template slot-scope="share">
                <div class="share-button" @click="getShareLink(share)">
                  <img
                    src="./../../assets/images/share.svg"
                    class="share-img"
                  />
                  <transition name="fade">
                    <share
                      :title="
                        `Spread the shopping delight! Scan QR & share this ${context.product.brand.name} product with
                          your loved ones`
                      "
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
        </div>
        <div class="prices">
          <div
            class="price"
            itemprop="offers"
            itemscope
            itemtype="http://schema.org/Offer"
          >
            <span
              class="sales"
              v-if="
                context && context.product_meta && context.product_meta.price
              "
            >
              <span class="value" itemprop="price">{{
                getEffectivePrice | currencyformat
              }}</span>
            </span>
            <span>
              <span
                class="strike-through list"
                v-if="getEffectivePrice !== getMarkedPrice"
              >
                <span class="value" itemprop="price">
                  {{ getMarkedPrice | currencyformat }}</span
                >
              </span>
              <!-- {{ context.product_meta.discount }} -->
              <span class="product-total-discount list">
                <span class="value">{{ getProductDiscount }}</span>
              </span>
              <meta itemprop="priceCurrency" />
            </span>
          </div>
        </div>
        <div
          v-if="
            context &&
              context.product &&
              context.product.rating &&
              context.product.rating_count
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
        <fdk-compare-action v-if="pageConfig && pageConfig.add_to_compare">
          <template slot-scope="compare">
            <div
              class="compare-container compare-text"
              @click="
                addCompareProducts(compare.addCompare, context.product.slug)
              "
            >
              <div class="compare-icon">
                <img src="./../../assets/images/compare-icon.svg" alt />
              </div>
              <p>Add to Compare</p>
            </div>
          </template>
        </fdk-compare-action>

        <store-coupon
          v-if="
            !context.bulk_prices.loading && pageConfig && pageConfig.bulk_prices
          "
          :bulkPrices="context.bulk_prices"
        ></store-coupon>
        <div class="main-attributes"></div>
        <ul
          id="sticky-error-scroll-to"
          class="product-attributes js_product-attributes"
        >
          <li
            class="variation-attribute color"
            v-if="context.product.attributes.color"
          >
            <span class="attribute-labelff color">COLOR:</span>
            <span class="attribute-label-value single-val selected">{{
              context.product.attributes.color
            }}</span>
          </li>
          <!--Product variant-->
          <li
            v-if="
              context &&
                context.product.has_variant &&
                context.product_variants &&
                context.product_variants.variants &&
                context.product_variants.variants.variants &&
                context.product_variants.variants.variants.length > 0
            "
          >
            <product-variants
              class="spaces"
              :product="context.product"
              :variants="context.product_variants.variants.variants"
            ></product-variants>
          </li>
          <li
            v-if="
              context.product.highlights &&
                context.product.highlights.length > 0
            "
          >
            <div class="highlists-container">
              <p
                class="bold-md"
                style="
                  color: #1d1d1d;
                  font-size: 14px;
                  letter-spacing: 0.78px;
                  line-height: 18px;
                  text-transform: uppercase;
                  font-weight: 700;
                "
              >
                Key Features
              </p>
              <ul class="highlights-list">
                <li
                  class="highlights-list-item"
                  v-for="(hightlight, index) in context.product.highlights"
                  :key="index"
                >
                  {{ hightlight }}
                </li>
              </ul>
            </div>
          </li>

          <li class="variation-attribute size">
            <span
              class="attribute-label size"
              style="
                display: flex;
                flex-flow: row wrap;
                justify-content: space-between;
              "
              >Choose SIZE</span
            >
            <a
              class="find-your-size"
              @click="showSizeGuide = true"
              v-if="
                pageConfig &&
                  pageConfig.size_guide &&
                  context.product_meta.size_chart &&
                  context.product_meta.size_chart.sizes &&
                  context.product_meta.size_chart.sizes.length > 0
              "
            >
              <span
                class="fitanalytics__button-text cst-cursr"
                onmouseover='this.style.textDecoration="none";return false;'
                onmouseleave='this.style.textDecoration="underline";return false;'
                >Find your size</span
              >
            </a>

            <!--Product Request-->
            <no-ssr>
              <div
                class="help light-xxs"
                v-if="
                  context.is_logged_in &&
                    pageConfig &&
                    pageConfig.product_request
                "
              >
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
            </no-ssr>

            <fdk-pdp-size-stores ref="pdpSizeStores">
              <template slot-scope="sellerData">
                <ul
                  class="attribute-values size"
                  v-if="context.product_meta && context.product_meta.sizes"
                >
                  <li
                    class="attribute-value"
                    tabindex="0"
                    v-for="(size, index) in context.product_meta.sizes"
                    :key="size.display + index"
                    :class="{
                      selected: selectedSize === size.display,
                      'attribute-disable': !size.is_available,
                    }"
                    @click="
                      selectedSize = size.display;
                      sizeError = false;
                      loadSellerFunction = sellerData.loadSellers;
                      sizeClicked(sellerData.loadSellers);
                    "
                  >
                    <template>{{ size.display }} </template>
                  </li>
                </ul>
                <p class="error" v-if="sizeError">Select a size first</p>
                <div
                  class="sold-by-section"
                  v-if="
                    showSoldByModal &&
                      storeInfoSelected &&
                      storeInfoSelected.store &&
                      storeInfoSelected.store.name
                  "
                >
                  <span class="title">Sold By:</span>
                  <div class="seller-name">
                    {{ storeInfoSelected.store.name + "," }}
                    {{ storeInfoSelected.seller.name }}
                    <span
                      class="bold"
                      style="cursor: pointer; font-weight: bold"
                      v-if="
                        store_count > 1 &&
                          pageConfig &&
                          pageConfig.store_selection
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
                  <fdk-infinite-scrolling
                    @loadmore="loadMoreData(sellerData)"
                    :loadingData="loading"
                  >
                    <store-modal
                      :isOpen="showStoreModal"
                      :activeStoreInfo="storeInfo"
                      :allStoresInfo="allStoresInfo"
                      :productName="context.product.name"
                      v-on:closedialog="showStoreModal = false"
                      v-on:store-filter="updateStoreFilter"
                      v-on:store-item-select="setStoreInfo"
                    ></store-modal>
                  </fdk-infinite-scrolling>
                </div>
              </template>
            </fdk-pdp-size-stores>

            <fdk-pincode
              ref="pdpPincode"
              v-if="
                context &&
                  context.product_meta &&
                  context.product_meta.hasOwnProperty('sellable') &&
                  context.product_meta.sellable
              "
            >
              <template slot-scope="pincodeAct">
                <div class="pincode-container" ref="pdpPincode">
                  <p class="delivery-options">Delivery Option</p>
                  <span style="position: relative">
                    <input
                      class="pincode-input"
                      placeholder="Enter pincode"
                      v-model="pincode"
                      maxlength="6"
                      @input="checkPincode(pincodeAct)"
                    />
                    <p class="check-btn" @click="checkPincode(pincodeAct)">
                      Check
                    </p>
                  </span>
                  <p class="error light-xxs" v-if="pincodeError">
                    {{ errMsg }}
                  </p>
                  <template
                    v-if="
                      deliveryInfo &&
                        deliveryInfo.minDeliveryDate &&
                        !pincodeError &&
                        pincodeSuccess
                    "
                  >
                    <div
                      v-if="
                        deliveryInfo.minDeliveryDate !=
                          deliveryInfo.maxDeliveryDate
                      "
                    >
                      <div class="delivery-date light-xxs">
                        Expected delivery between
                        {{ deliveryInfo.minDeliveryDate }}
                        -
                        {{ deliveryInfo.maxDeliveryDate }}
                      </div>
                    </div>
                    <div
                      v-else-if="
                        deliveryInfo.minDeliveryDate ===
                          deliveryInfo.maxDeliveryDate
                      "
                    >
                      <div class="delivery-date light-xxs">
                        Expected delivery on
                        {{ deliveryInfo.minDeliveryDate }}
                      </div>
                    </div>
                  </template>
                </div>
                <div class="ukt-title">Return Policy</div>

                <div v-if="storeInfo !== null">
                  <template
                    v-if="
                      storeInfo &&
                        storeInfo.return_config &&
                        storeInfo.return_config.returnable
                    "
                  >
                    <div class="return">
                      Returnable within {{ storeInfo.return_config.time }}
                      {{ storeInfo.return_config.unit }}
                    </div>
                  </template>
                  <template v-else>
                    <div class="return">Item is not returnable</div>
                  </template>
                </div>
                <fdk-link class="ukt-links" :link="'/faq'" target="_blank"
                  >View Details</fdk-link
                >
              </template>
            </fdk-pincode>

            <size-guide
              class="size-guide"
              v-if="context.product_meta"
              :isOpen="showSizeGuide"
              :product_meta="context.product_meta"
              @closedialog="showSizeGuide = false"
            ></size-guide>
            <span class="error-label">Please select SIZE</span>
          </li>
        </ul>
        <div class="js_additional-msg-container"></div>

        <div
          class="add-to-cart-section"
          v-if="!global_config.props.disable_cart"
        >
          <div class="js_scroll-to-pdp-button product-button-wrapper">
            <fdk-product-card>
              <template slot-scope="productData">
                <div
                  v-if="
                    context &&
                      context.product_meta &&
                      context.product_meta.hasOwnProperty('sellable') &&
                      context.product_meta.sellable
                  "
                  :style="{
                    width: pageConfig && pageConfig.wishlist ? '90%' : '100%',
                  }"
                  class="add-cart-btn"
                >
                  <fdk-cart>
                    <template slot-scope="cart">
                      <namaste-button
                        class="add-to-cart"
                        @click="addToCart(cart)"
                        :disabled="!shippable"
                        :class="{ disabled: !shippable }"
                      >
                        Add to bag
                      </namaste-button>
                    </template>
                  </fdk-cart>
                </div>
                <fdk-notify
                  v-if="
                    context &&
                      context.product_meta &&
                      context.product_meta.hasOwnProperty('sellable') &&
                      !context.product_meta.sellable
                  "
                  :style="{
                    width: pageConfig && pageConfig.wishlist ? '90%' : '100%',
                  }"
                >
                  <template slot-scope="notifyProduct">
                    <namaste-button
                      class="add-to-cart notify-btn"
                      @click="productNotify(notifyProduct)"
                      :disabled="!shippable"
                      :class="{ disabled: !shippable }"
                    >
                      <img src="../../assets/images/bell.png" alt="" />
                      <span>Notify Me</span>
                    </namaste-button>
                  </template>
                </fdk-notify>
                <no-ssr>
                  <div
                    class="add-to-wish-list js_add-to-wish-list d-flex"
                    role="button"
                    tabindex="0"
                    v-if="pageConfig && pageConfig.wishlist"
                  >
                    <fdk-accounts class="wishlist-btn">
                      <template slot-scope="accountsData">
                        <div
                          v-if="accountsData && accountsData.is_logged_in"
                          @click="
                            productData.updateWishList($event, context.product)
                          "
                        >
                          <div>
                            <div
                              style="text-align: center"
                              v-if="!context.product.follow"
                            >
                              <img
                                src="./../../assets/images/profile-wishlist.svg"
                              />
                              <!-- <span
                                class="add-to-wish-list-icon"
                                title="Add to Wishlist"
                                >Add to Wishlist</span
                              > -->
                            </div>
                            <div
                              v-else-if="context.product.follow"
                              style="text-align: center"
                            >
                              <img
                                src="./../../assets/images/heart-filled.svg"
                              />
                              <!-- <span
                                class="add-to-wish-list-icon active"
                                title="Add to Wishlist"
                                >Add to Wishlist</span
                              > -->
                            </div>
                          </div>
                        </div>
                        <div
                          v-if="!context.is_logged_in"
                          class="wishlist-btn"
                          @click="accountsData.openLogin"
                        >
                          <div>
                            <div
                              style="text-align: center"
                              v-if="!context.product.follow"
                            >
                              <img
                                src="./../../assets/images/profile-wishlist.svg"
                              />
                              <!-- <span
                                class="add-to-wish-list-icon"
                                title="Add to Wishlist"
                                >Add to Wishlist</span
                              > -->
                            </div>
                          </div>
                        </div>
                      </template>
                    </fdk-accounts>
                  </div>
                </no-ssr>
              </template>
            </fdk-product-card>
          </div>
        </div>
        <!-- <div class="product-description-and-detail">
          <div class="product-description">
            <div
              class="value content"
              v-if="context.product.attributes.style_note !== '-'"
              v-html="context.product.attributes.style_note"
            ></div>
            <br v-if="context.product.attributes.style_note" />
          </div>

        </div> -->
      </div>
      <div class="col-12 col-lg-12">
        <template v-if="context.product.attributes.product_details">
          <h2 class="heading-big">Product Details</h2>
          <fdk-html-content
            class="product-long-description"
            v-if="context.product.attributes.product_details"
            :content="context.product.attributes.product_details"
          ></fdk-html-content>
        </template>

        <div
          v-for="(attributeArray, index) in context.product.grouped_attributes"
          :key="index + 'array'"
        >
          <template>
            <h2 class="heading-big">{{ attributeArray.title }}</h2>
            <div
              class="product-details"
              :class="{ columns1: attributeArray.details.length < 10 }"
            >
              <table class="product-attr-table">
                <tbody>
                  <tr
                    v-for="(attr, index) in attributeArray.details"
                    :key="index"
                  >
                    <td class="key">{{ attr.key }}</td>
                    <td class="value" v-html="attr.value"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
        <template v-if="storeInfo !== null && storeInfo.marketplace_attributes">
          <div
            v-for="(attributeArray, index) in storeInfo.marketplace_attributes"
            :key="index + 'array'"
          >
            <template>
              <h2 class="heading-big">{{ attributeArray.title }}</h2>
              <div
                class="product-details"
                :class="{ columns1: attributeArray.details.length < 10 }"
              >
                <table class="product-attr-table">
                  <tbody>
                    <tr
                      v-for="(attr, index) in attributeArray.details"
                      :key="index"
                    >
                      <td class="key">{{ attr.key }}</td>
                      <td class="value" v-html="attr.value"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
        </template>
      </div>
      <div class="col-12 col-lg-8">
        <no-ssr>
          <fdk-accounts class="wishlist-btn">
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
                          pageConfig &&
                          pageConfig.reviews &&
                          reviewData.is_eligible)
                    "
                  >
                    <p class="review-container__title">
                      Ratings & Reviews
                      <a
                        class="add-review"
                        v-if="reviewData.is_eligible && context.is_logged_in"
                        @click="
                          context.is_logged_in
                            ? redirectToAddReview()
                            : accountsData.openLogin()
                        "
                      >
                        Rate Product
                      </a>
                    </p>
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
                </template>
              </fdk-add-review>
            </template>
          </fdk-accounts>
        </no-ssr>
      </div>
    </div>
    <similar-products
      v-if="
        context.similar_products && pageConfig && pageConfig.similar_products
      "
      :similars="context.similar_products"
    ></similar-products>
    <!-- Compared Products -->
    <div
      v-if="
        context.frequently_compared_products &&
          pageConfig &&
          pageConfig.compare_products
      "
    >
      <compare-products
        :compare="context.frequently_compared_products"
      ></compare-products>
    </div>

    <toast :id="'toast-message'" :content="toast_message"></toast>
    <compare-action-modal
      v-if="showCompareActionModal"
      :compare_uids="context.compare_slugs"
      :compare_msg="compareMsg"
      :product_uid="context.product.slug"
      @hide-compare-action-modal="hideCompareModal"
    ></compare-action-modal>
    <namaste-loader v-if="isLoading" />
  </div>
</template>

<settings>
{
"props": [
    {
      "type": "checkbox",
      "id": "share",
      "label": "Share",
      "default": true,
      "info": "Enable Sharing product"
    },
    {
      "type": "checkbox",
      "id": "wishlist",
      "label": "Wishlist",
      "default": true,
      "info": "Show Wishlist for product"
    },
     {
      "type": "checkbox",
      "id": "bulk_prices",
      "label": "Bulk Prices",
      "default": false,
      "info": "Show Bulk Prices"
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
      "id": "similar_products",
      "label": "Similar Products",
      "default": true,
      "info": "Show Similar Products"
    }
]
}
</settings>

<script>
import productcard from "./../../global/components/product-card.vue";
import pdpcarousel from "./../../global/components/pdp-carousal.vue";
import sizeguide from "./../../global/components/size-guide.vue";
import storemodal from "./../../global/components/store-modal.vue";
import toast from "./../../global/components/toast.vue";
import loader from "../components/loader";

import ratinglist from "./../../global/components/reviews/review-list";
import button from "./../../global/components/common/button";
// import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import { detectMobileWidth } from "./../../helper/utils";
import productRequestModal from "./../../global/components/product-request-modal.vue";
import compareActionModalVue from "./../../global/components/compare-action-modal.vue";
import flatten from "lodash/flatten";
import placeholderImage from "./../../assets/images/placeholder.png";
import similarProducts from "./../../global/components/similar-items.vue";
import productVariants from "./../../global/components/product-variants.vue";
import compareproducts from "./../../global/components/compare-products.vue";
import storeCoupon from "./../../global/components/coupon.vue";
import share from "./../../global/components/common/share";
import ratingstar from "./../../global/components/reviews/rating-star";
import { isBrowser, isNode } from "browser-or-node";
import NoSSR from "vue-no-ssr";
import nmImage from "./../../global/components/common/nm-image.vue";
export default {
  components: {
    "product-card": productcard,
    "pdp-carousel": pdpcarousel,
    "size-guide": sizeguide,
    "store-modal": storemodal,
    "product-request-modal": productRequestModal,
    "compare-action-modal": compareActionModalVue,
    "namaste-loader": loader,
    toast,
    "review-list": ratinglist,
    "namaste-button": button,
    "similar-products": similarProducts,
    "product-variants": productVariants,
    share: share,
    "rating-star": ratingstar,
    "store-coupon": storeCoupon,
    "compare-products": compareproducts,
    "no-ssr": NoSSR,
    "nm-image": nmImage,
    "viewer-3d": () =>
      isNode
        ? Promise.resolve(null)
        : Promise.resolve(require("../../global/components/viewer-3d")),
  },
  props: {
    context: {},
  },
  // directives: {
  //   swiper: directive
  // },
  data() {
    return {
      selectedImage: "",
      compareMsg: {
        title: "",
      },
      shareLoading: false,
      showShare: false,
      share_link: "",
      qr_code: "",
      showCompareActionModal: false,
      showMoreProductDetails: false,
      showShippingDetails: false,
      selectedSize: "",
      sizeError: false,
      isMounted: false,
      showSizeGuide: false,
      showStoreModal: false,
      pincodeError: false,
      pincodeSuccess: false,
      shippable: false,
      pincode: this.context.user_pincode || "",
      zoomCarousalCurrentIndex: 0,
      showZoomModal: false,
      showSoldByModal: false,
      allStoresInfo: null,
      storeCompanyFilter: null,
      storeInfo: {},
      storeInfoSelected: {},
      loadStoreFunction: null,
      loadSellerFunction: null,
      toast_message: "",
      zoom: false,
      reviewsToggle: {},
      trimLength: 50,
      showReview: false,
      reviews: null,
      reviewsData: [],
      showProductRequestModal: false,
      store_id: null,
      fromPincode: null,
      deliveryInfo: {},
      errMsg: null,
      triggerEl: "",
      drift: "",
      paneContainer: "",
      driftLoaded: false,
      isLoading: false,
      selectLoading: false,
      notifMsg: "Saved, We'll notify you when this product is back in Stock",
      store_count: null,
      isPinCodeValid: false,
    };
  },
  computed: {
    getProductDiscount() {
      if (this.storeInfo != null && this.storeInfo.discount) {
        return storeInfo.discount;
      }
      return this.context.product_meta.discount;
    },
    checkReview() {
      if (
        this.pageConfig &&
        this.pageConfig.reviews &&
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

    getPopupHeight: function() {
      return this.browser_meta.screenHeight * 0.8 - 40 - 100;
    },
    pageConfig() {
      return this.page_config?.props;
    },
    getEffectivePrice() {
      if (this.storeInfo && this.storeInfo.price) {
        return this.storeInfo.price.effective;
      }
      if (this.context?.product_meta?.price) {
        return this.context.product_meta.price.effective.min !==
          this.context.product_meta.price.effective.max
          ? this.$options.filters.currencyformat(
              this.context.product_meta.price.effective.min
            ) +
              " - " +
              this.$options.filters.currencyformat(
                this.context.product_meta.price.effective.max
              )
          : this.context.product_meta.price.effective.max;
      }
    },
    getMarkedPrice() {
      if (this.storeInfo && this.storeInfo.price) {
        return this.storeInfo.price?.marked;
      }
      if (this.context?.product_meta?.price) {
        return this.context.product_meta.price.marked.min !==
          this.context.product_meta.price.marked.max
          ? this.$options.filters.currencyformat(
              this.context.product_meta.price.marked.min
            ) +
              " - " +
              this.$options.filters.currencyformat(
                this.context.product_meta.price.marked.max
              )
          : this.context.product_meta.price.marked.max;
      }
    },
  },
  created() {
    if (this.context) {
      this.setSelectedMedia();
    }
  },
  watch: {
    storeInfo() {
      this.storeInfoSelected = Object.assign(
        {},
        this.storeInfoSelected,
        this.storeInfo
      );
    },
    showSizeGuide(newValue) {
      if (newValue) {
        document.querySelector("body").style.overflow = "hidden";
      }
    },

    loadStoreFunction(newValue) {
      this.loadStoreFunction = newValue;
    },
    loadSellerFunction(newValue) {
      this.loadSellerFunction = newValue;
    },
    $route(to, from) {
      if (to.path != from.path) {
        (this.storeInfoSelected = {}), (this.storeInfo = null);
      }
    },
    context(ctx) {
      if (ctx && ctx.product && ctx.product.medias) {
        this.selectedImage = ctx.product.medias[0];
        this.loadDrift();
      }
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
    loadMoreData(sellerData) {
      if (this.allStoresInfo?.page_info?.has_next) {
        this.loading = true;
        sellerData.loadMoreStores().then((res) => {
          this.loading = false;
        });
      }
    },
    setSelectedMedia() {
      if (this.context && this.context.product && this.context.product.medias) {
        this.selectedImage = this.context?.product?.medias[0];
      }
    },
    loadDrift() {
      let Drift = require("drift-zoom").default;
      this.triggerEl = this.$refs.selectedImage;
      this.paneContainer = this.$refs.imagePreview;
      if (this.triggerEl) {
        this.drift = new Drift(this.triggerEl, {
          paneContainer: this.paneContainer,
          zoomFactor: 2,
        });
        this.driftLoaded = true;
      }
    },
    pdpImageHover() {
      if (!this.selectedImage) {
        this.selectedImage = this.context.product.medias[0];
      }
      if (this.paneContainer && this.driftLoaded) {
        this.paneContainer.style.opacity = 1;
        this.paneContainer.style.zIndex = 7;

        this.drift.setZoomImageURL(this.selectedImage.url);
        this.triggerEl.setAttribute("data-zoom", this.selectedImage.url);
      } else {
        this.loadDrift();
        this.drift.setZoomImageURL(this.selectedImage.url);
        this.triggerEl.setAttribute("data-zoom", this.selectedImage.url);
      }
    },
    pdpMouseOut() {
      if (this.paneContainer) {
        this.paneContainer.style.opacity = 0;
        this.paneContainer.style.zIndex = 0;
      }
    },
    hideShare() {
      this.showShare = false;
    },

    addCompareProducts(promiseFn, productUid) {
      if (
        this.context &&
        this.context.compare_slugs &&
        this.context.compare_slugs.length < 3
      ) {
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
    hideCompareModal() {
      this.showCompareActionModal = false;
      this.compareMsg.title = "";
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

    updateStoreFilter(filtertype) {
      this.storeCompanyFilter = filtertype;
      this.getStores(this.loadStoreFunction);
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
    setStoreInfo(store) {
      this.storeInfoSelected = Object.assign({}, this.storeInfoSelected, store);
      this.storeInfo = this.storeInfoSelected;
      this.showStoreModal = false;
      this.checkPincode(this.$refs.pdpPincode);
    },

    onZoomCarouselButtonClick(e) {
      this.zoomCarousalCurrentIndex = e;
      this.$refs.zoomCarousel.goSlide(e);
    },
    async changeImage(event, media) {
      this.selectLoading = true;
      setTimeout(async () => {
        this.selectLoading = false;
        this.selectedImage = media;
        await this.$nextTick();
        this.loadDrift();
        if (media.type === "image") {
          let activeImage = document.getElementById("activeImage");
          activeImage.src = media?.url;
          let imageListItem = this.$refs["imageListItem"];
        }
      }, 1);
    },
    zoomListItemClick(image) {
      this.selectLoading = true;
      setTimeout(() => {
        this.selectedImage = image;
        this.selectLoading = false;
      }, 1);
    },
    OriginalImageLoaded() {
      this.isLoading = false;
    },
    getTat() {
      let params = {
        toPincode: this.pincode,
        fromPincode: `${this.fromPincode}`,
        categoryId: this.context?.product?.categories[0].id || "",
        store_id:
          this.storeInfo && this.storeInfo.store
            ? this.storeInfo.store.uid
            : null,
      };
      this.$refs["pdpPincode"]
        ?.getTat(params)
        .then((res) => {
          this.isPinCodeValid = false;
          this.deliveryInfo = res;
          this.shippable = true;
        })
        .catch((err) => {
          if (String(err) === "{}") {
            //to handle empty error object
            err = "";
          }
          this.errMsg = err.message;
          this.pincodeError = true;
          this.isPinCodeValid = false;
          this.shippable = false;
        });
    },
    checkPincode(pincodeAct) {
      if (
        this.pincode.length === 6 &&
        this.selectedSize &&
        this.isPinCodeValid
      ) {
        this.getTat();
      } else if (this.pincode.length === 6 && this.selectedSize) {
        pincodeAct
          .validatePincode(this.pincode)
          .then((valid) => {
            this.pincodeError = !valid;
            this.isPinCodeValid = valid;
            this.pincodeSuccess = true;
            if (
              this.selectedSize &&
              valid &&
              Object.keys(this.storeInfo).length === 0
            ) {
              this.sizeClicked(this.loadSellerFunction);
            }
            if (valid && this.pincode && this.fromPincode) {
              this.getTat();
            }
          })
          .catch((err) => {
            if (String(err) === "{}") {
              //to handle empty error object
              err = "";
            }
            this.errMsg = err.message;
            this.pincodeSuccess = false;
            this.pincodeError = true;
            this.shippable = false;
          });
      } else if (this.pincode.length < 6) {
        this.errMsg = "Invalid Pincode";
        this.shippable = false;
        if (this.pincode.length === 0) {
          this.errMsg = "Please enter a Pincode";
        }
        this.pincodeError = true;
      } else if (this.pincode.length > 6) {
        this.shippable = false;
        this.errMsg = "Invalid Pincode";
        this.pincodeError = true;
      } else if (!this.selectedSize) {
        this.shippable = false;
        this.errMsg = "Please select a size";
        this.pincodeError = true;
      }
    },
    sizeClicked(loadSellers) {
      if (!this.pincode) {
        // if (!this.pincode) {
        this.errMsg = "Please enter a Pincode";
        this.pincodeError = true;
        // }
        return;
      } else {
        let options = {
          size: this.selectedSize,
          slug: this.context.product.slug,
          pincode: this.pincode,
        };

        loadSellers(options)
          .then((res) => {
            // this.context.product_meta = res;
            this.storeInfo = res;
            this.store_count = res.store.count;
            this.store_uid = this.storeInfo.store.uid;
            this.fromPincode = this.storeInfo.pincode;
            this.showSoldByModal = true;
            this.checkPincode(this.$refs.pdpPincode);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    getStores(loadStores) {
      let options = {
        strategy: this.storeCompanyFilter || "",
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

    addToCart(cart) {
      if (this.selectedSize === "") {
        this.sizeError = true;
        if (window.innerWidth < 780) {
          var top = document.getElementById("sizeContainer").offsetTop;
          window.scrollTo(0, top - 400);
        }
        return;
      }

      if (!this.pincode || this.pincodeError) {
        this.pincodeError = true;
        if (this.pincode.length === 0) {
          this.errMsg = "Please enter a pincode";
        }
        if (this.pincode.length < 6) {
          this.errMsg = "Invalid Pincode";
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
      cart
        .addToCart(addItemData)
        .then((data) => {
          if (data.success) {
            this.$router.push("/cart/bag");
          } else {
            this.showToast(data.message || "Something went wrong");
          }
        })
        .catch(console.error);
    },
    isVariantSelected(item) {
      return item.slug === this.context.product.slug;
    },

    slideRight() {
      let scrollStep = 300;
      let content = this.$refs["scrollContainer"];
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
      let content = this.$refs["scrollContainer"];
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
      var x = document.getElementById("toast-message");
      x.className = "toast show";
      setTimeout(function() {
        x.className = x.className.replace("toast show", "toast hide");
      }, 3000);
    },

    detectMobileWidth: detectMobileWidth,
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
    getAttributes: function getAttributes() {
      let gattr = [];
      let allAttrs = [];
      gattr = this.context.product.grouped_attributes.filter(
        (grouped_attribute) => {
          return grouped_attribute.title !== "Product Details";
        }
      );
      gattr.filter((grouped_attribute) => {
        let attrs = grouped_attribute.details.filter((item) => {
          return item.key !== "Product Details";
        });
        allAttrs.push(attrs);
      });
      return flatten(allAttrs);
    },
  },
  mounted() {
    //load drift
    let imageListItem = document.getElementById("imageListItem");
    imageListItem && imageListItem[0] && imageListItem[0].style.opacity == 1;
    this.isMounted = true;
    let atc2 = document.getElementById("atc2");
    let dumbDiv = document.getElementById("dumbDiv");
    let YOffset = atc2 && atc2.offsetTop;
    window.addEventListener("scroll", () => {
      {
        if (atc2) {
          if (dumbDiv.offsetTop - window.pageYOffset < 690) {
            atc2.classList.remove("sticky");
          } else {
            atc2.classList.add("sticky");
            dumbDiv.style.marginBottom = "25px";
          }
        }
      }
    });
    this.setSelectedMedia();
  },
};
</script>

<style scoped lang="less">
.placeholder-class {
  position: relative;
  padding: 0 50px;
  img {
    width: 100%;
  }
  @media @tablet {
    padding: 0px;
  }
}
.attribute-disable {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.6;
}
.notify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    margin-right: 10px;
  }
}
.return {
  font-size: 14px;
  margin: 8px auto;
}

.return-policy {
  color: #1d1d1d;
  font-size: 14px;
  letter-spacing: 0.78px;
  line-height: 18px;
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 8px;
}
.cst-cursr {
  cursor: pointer;
}
::-webkit-scrollbar {
  height: 0;
  width: 3px;
}

.help {
  padding: 15px 0px 10px 0px;
  .link {
    cursor: pointer;
  }
}
.product-images {
  display: flex;
  @media @mobile {
    min-height: auto;
  }
  &__list {
    overflow: hidden;
    overflow-y: auto;
    padding-right: 10px;
    min-width: 50px;
    &--item {
      border: 1px solid @border-color;
      width: 50px;
      padding: 5px;
      cursor: pointer;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      /deep/ .nm__img {
        width: 100%;
      }
      video {
        width: 100%;
      }
      .type-3d_model {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 90px;
        background: gray;
        img {
          width: 24px;
        }
      }
    }
    @media @mobile {
      display: none;
    }
  }
  &__selected {
    text-align: center;
    margin: 0 0 0 50px;
    position: relative;
    @media @large-tablet {
      margin: 0 0 0 20px;
    }
    cursor: pointer;
    /deep/ .nm__img {
      height: 100%;
      max-width: 540px;
    }
    img {
      width: 100%;
    }
    video {
      max-height: 540px;
      max-width: 540px;
    }
    .type-3d_model {
      position: relative;
      /deep/ model-viewer {
        width: 100%;
        min-height: 400px;
        min-width: 500px;
        @media @mobile {
          min-width: 300px;
          min-height: 300px;
        }
      }
      .expand-btn {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        img {
          width: 100%;
        }
        @media @large-tablet {
          display: none;
        }
      }
    }
    .thumbnail {
      width: 60px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -30px;
      margin-top: -30px;
    }
    .image-preview {
      position: absolute;
      right: -500px;
      width: 500px;
      height: 300px;
      top: 100px;
      border: 1px solid @border-color;
      opacity: 0;
    }
    @media @mobile {
      display: none;
    }
  }

  .mobile-product-images {
    display: none;
    width: 100%;
    @media @mobile {
      display: block;
      &__list {
        margin: 0 auto;
        position: relative;
        overflow: hidden;
        list-style: none;
        padding: 0;
        display: flex;
        justify-content: space-between;
        overflow-x: auto;

        &--item {
          position: relative;
          width: 100vw;
          height: 100%;
          display: flex;
          transition-property: transform;
          box-sizing: content-box;
          margin-bottom: 20px;
          flex: unset;
          max-width: unset;
          .slide {
            height: 390px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            width: 70vw;
            /deep/ .nm__img {
              width: 250px;
            }
            video {
              width: 250px;
            }
            .type-3d_model {
              position: relative;
              /deep/ model-viewer {
                width: 250px;
                min-height: 300px;
                min-width: 250px;
              }
              .overlay-icon {
                cursor: pointer;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                  width: 24px;
                }
              }
            }
          }
        }
      }
    }
  }
  &__zoom-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40vw;
    height: 80vh;
    background: #fff;
    z-index: 10;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.26);
    display: flex;
    padding: 40px;
    .close-icon {
      position: absolute;
      background-image: url(../../assets/images/sprite-icons.svg);
      background-position: -957px 0;
      top: 8px;
      left: 94.5%;
      background-color: transparent;
      cursor: pointer;
      @media @mobile {
        left: 90%;
      }
    }
    @media @mobile {
      display: block;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      transform: none;
      flex-direction: column;
    }
    .zoom-inner-wrapper {
      display: flex;
      width: 100%;
    }
    .zoom-selected {
      flex: 0 0 80%;
      @media @mobile {
        height: auto;
      }
      /deep/ .nm__img {
        max-height: 100%;
        max-width: 100%;
        @media @mobile {
          width: 100%;
          height: auto;
        }
      }
      video {
        max-height: 100%;
        max-width: 100%;
        @media @mobile {
          width: 100%;
          height: auto;
        }
      }
      .type-3d_model {
        /deep/ model-viewer {
          width: 100%;
          min-height: 300px;
          min-width: 320px;
          @media @mobile {
            min-width: 200px;
          }
        }
      }
    }
    .zoom-list {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height: 60vh;
      flex: 0 0 20%;
      margin-left: 12px;
      @media @mobile {
        flex: 0 0 20%;
      }
      .zoom-list-item {
        margin-bottom: 10px;
        cursor: pointer;
        &:not(:last-child) {
          margin-right: 10px;
        }
        /deep/ .nm__img {
          width: 75px;
          @media @mobile {
            width: 45px;
          }
          border: 2px solid @border-color;
        }
        video {
          width: 75px;
          @media @mobile {
            width: 45px;
          }
          border: 2px solid @border-color;
        }
        .type-3d_model {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 90px;
          width: 75px;
          border: 1px solid #ccc;
          background-color: gray;
          @media @mobile {
            width: 45px;
          }
          img {
            width: 24px;
          }
        }
      }
    }
  }
  .selected-image {
    border-color: @ds-black !important;
  }
  .zoom-overlay {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: black;
    opacity: 0.5;
    z-index: 8;
    overflow: hidden;
  }
}
.delivery-date {
  color: @ds-black;
}
.highlists-container {
  margin: 35px 0 20px;
  .highlights-list {
    border-bottom: 1px solid #dddddd;
    padding-bottom: 20px;
    list-style-type: disc;
    padding-left: 20px;
    .highlights-list-item {
      font-size: 14px;
      // color: #5b5b5b;
      padding: 5px 0;
      line-height: 20px;
      /* padding: 10px; */
      // i {
      //   font-size: 8px;
      //   margin-right: 8px;
      //   color: #000;
      //   line-height: 10;
      //   font-family: 'Font Awesome 5 Pro' !important;
      // }
    }

    .highlights-list-item > img {
      margin-right: 10px;
      width: 5px;
    }
  }
}
.icon-arrow-black-left::after {
  content: "\f105";
  font: 40px/1 FontAwesome;
}

/deep/.toasted-container {
  background: @ds-black !important;
  color: @ds-white !important;
}
/deep/ .product-long-description {
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
      width: 100%;
    }
  }
  video {
    max-width: 100% !important;
  }
}
.product-details {
  -webkit-column-count: 2; /* Chrome, Safari, Opera */
  -moz-column-count: 2; /* Firefox */
  column-count: 2;
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
}

.product-attr-table {
  min-width: 320px;
  box-sizing: border-box;
  tr {
    border-bottom: 1px solid #e4e4e4;
    text-align: center;
    font-size: 14px;
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
    td {
      height: 40px;
      text-align: left;
      vertical-align: middle;
      padding: 5px 10px;
      line-height: 20px;
      word-wrap: break-word;
      word-break: break-word;
    }
    .key {
      font-weight: 700;
      background-color: #f3f3f3;
      width: 40%;
    }
  }
}
.review-container {
  margin-top: 50px;
  &__title {
    font-size: 20px;
    font-weight: bold;
    margin: 10px 0 0 0;
    align-items: center;
    display: flex;
    justify-content: flex-start;
    a {
      padding: 0 0 0 20px;
    }
  }

  .no-reviews {
    margin: 20px 0;
  }
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
    // margin-top: 50px;
  }
}
.product-wrapper {
  margin-top: 50px;
}
.value.content {
  min-height: auto;
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
    font-size: 14px;
  }
}
.pincode-container {
  margin: 35px 0 20px;
  height: 100px;
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

.rev-title {
  font-size: 14px;
  font-family: inherit;
  font-weight: 700;
}

.price {
  font-size: 1.5rem;
}

.product-content {
  height: 100%;
  top: 0;
}
.product-name-block {
  display: flex;
  justify-content: space-between;
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
  padding: 0 10px 0 0;
}

.product-description-and-detail {
  line-height: 26px;
  line-height: 1.625rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
  margin: 50px 0 0 0;
}

.heading-small {
  font-family: Roboto, sans-serif;
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  line-height: 24px;
  line-height: 1.5rem;
}
.heading-big {
  font-size: 20px;
  font-weight: 700;
  margin: 20px 0;
}

.share-button {
  margin-top: 6px;
  .share-img {
    position: relative;
  }
  cursor: pointer;
  @media @mobile {
    right: 12px;
  }
}

.product-rating-count {
  // margin-bottom: 20px;
  margin-bottom: 1.25rem;
}
.prices {
  margin-bottom: 1.25rem;
}
.compare-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  height: 100%;
  justify-content: left;
  color: @ds-black;
  font-size: 14px;
  cursor: pointer;
  .compare-icon {
    padding: 0 5px;
    img {
      width: 18px;
    }
  }
}

.prices .value {
  font-weight: 700;
  font-size: 1rem;
  line-height: 28px;
  line-height: 1.75rem;
  padding-right: 12px;
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
  padding-right: 12px;
}

.attribute-labelff {
  font-size: 16px;
  font-weight: 700;
  padding: 0 5px 0 0;
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
  border: 1px solid @ds-black;
}

.attribute-value.selected {
  color: @ds-white;
  background-color: @ds-black;
}

.attribute-value.unavailable {
  color: #cacaca;
}

.back-in-stock-notification .attribute-value.unavailable::before {
  content: "";
  margin: 0 5px 2px 0;
  margin: 0 0.3125rem 0.125rem 0;
  content: "";
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
  content: "";
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
  content: "";
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
  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    > div {
      width: 100%;
    }
  }
  .add-cart-btn {
    width: 100%;
    > div {
      width: 100%;
      > div {
        width: 100%;
      }
    }
  }
}

.add-to-wish-list {
  flex: 2;
  justify-content: center;
  padding: 10px 0;
  margin-left: 5px;
  align-items: center;
  border: 1px solid #cecece;
  border-radius: 4px;
  cursor: pointer;
}

button.add-to-cart {
  flex: 8;
  width: 100%;
  text-transform: uppercase;
}
button.add-to-cart.disabled {
  background: #f7f7f7;
  cursor: not-allowed;
  color: #aaaaaa;
}
.add-review {
  // text-transform: uppercase;
  font-size: 14px;
  text-decoration: underline;
  color: @Black;
  cursor: pointer;
}

.go-back-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 18px;
  letter-spacing: 0.2px;
  font-weight: bold;
  color: @ds-black;
  justify-content: space-between;
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
    font-size: 1.5rem;
    margin: 30px 0;
    margin: 1.875rem 0;
  }
}

.product-carousel-container {
  position: relative;
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
  top: 42%;
}

.carousel-container .swiper-button-prev {
  left: -35px;
  top: 42%;
}

.carousel-container .swiper-button-next-icon,
.carousel-container .swiper-button-prev-icon {
  position: absolute;
  top: 0;
}

.carousel-container .swiper-button-next-icon {
  right: 25%;
}

.carousel-container .swiper-button-prev-icon {
  left: 25%;
  transform: rotate(180deg);
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

.estimated-delivery {
  font-size: 0.625rem;
}
</style>

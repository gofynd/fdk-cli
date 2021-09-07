<template>
  <div
    class="plp-wrapper"
    :style="global_config ? 'color:' + global_config.props.text_body_color : ''"
  >
    <fdk-loader
      class="loader-ws"
      v-if="context.loading && (!context.items || context.items.length === 0)"
    ></fdk-loader>
    <div
      v-else-if="
        !context.loading && (!context.items || context.items.length === 0)
      "
    >
      <fdk-empty-state :title="'No items found'"></fdk-empty-state>
    </div>
    <div v-else-if="context.page_error && context.page_error.statusCode === 500">
      <fdk-empty-state :title="'Something went wrong'"></fdk-empty-state>
    </div>
    <template v-else-if="context && context.items">
      <div class="mobile-header mobile">
        <div class="m-header">
          <div class="m-action-container" ref="mobileActionContainer">
            <div
              class="m-action-child-container"
              v-on:click="viewModal($event, 'sort')"
            >
              <div>
                <fdk-inline-svg :src="'sort'" />
                <!-- SORT ICON -->
              </div>
              <div class="regular-xxxs cl-DoveGray">
                <span class="text-seperator"></span>
                SORT
              </div>
            </div>
            <span class="text-seperator cl-DoveGray line">|</span>
            <div
              class="m-action-child-container"
              v-on:click="viewModal($event, 'filter')"
            >
              <div>
                <!-- FILTER ICON -->
                <fdk-inline-svg :src="'filter'" />
              </div>
              <div class="regular-xxxs cl-DoveGray">
                <span class="text-seperator"></span>
                FILTER
              </div>
            </div>
            <span class="text-seperator cl-DoveGray line">|</span>
            <fdk-share class="m-action-child-container mobile">
              <template slot-scope="share">
                <!-- SHARE ICON -->
                <div @click="getShareLink(share)" class="share-mobile-button">
                  <!-- <fdk-inline-svg
                    :src="'share'"
                    class="share-mobile-img"
                  ></fdk-inline-svg> -->
                  <img
                    src="../../assets/images/share.svg"
                    class="share-mobile-img"
                  />
                  <div class="regular-xxxs cl-DoveGray">
                    <span class="text-seperator"></span>
                    SHARE
                  </div>
                </div>
              </template>
            </fdk-share>
          </div>
        </div>
      </div>
      <div class="desktop-header desktop">
        <div class="header">
          <div class="m-action-container">
            <fdk-share class="m-action-child-container desktop">
              <template slot-scope="share">
                <!-- SHARE ICON -->
                <div @click="getShareLink(share)" class="share-mobile-button">
                  <!-- <fdk-inline-svg
                    :src="'share'"
                    class="share-mobile-img"
                  ></fdk-inline-svg> -->
                  <img
                    src="../../assets/images/share.svg"
                    class="share-mobile-img"
                  />
                  <transition name="fade desktop">
                    <share
                      :title="
                        `Spread the shopping delight! Scan QR & share this products with
                  your loved ones`
                      "
                      :shareLoading="shareLoading"
                      :qr_code="qr_code"
                      @close-share="showShare = false"
                      v-if="showShare && !isMobile"
                      v-click-outside="hideShare"
                      :share_link="share_link"
                    />
                  </transition>
                  <div class="regular-sm cl-DoveGray">
                    <span class="text-seperator"></span>
                    Share
                  </div>
                </div>
              </template>
            </fdk-share>
            <span class="text-seperator cl-DoveGray line">|</span>
            <div class="m-action-child-container">
              <sort-dd
                :filteredsorts="context.sort_on"
                :updateSelection="updateSelection"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
        <template>
          <div class="left">
            <div
              class="filter-list"
              v-for="(filter, idx) in getFilters"
              :key="idx + '-desktop' + filter.key.display"
            >
              <div class="filters">
                <div
                  class="filter-title regular-sm"
                  v-on:click="filter.isOpen = !filter.isOpen"
                  v-if="filter.values.length > 0"
                >
                  <span class="regular-xs cl-Mako fil_tit">{{
                    filter.key.display
                  }}</span>
                  <span
                    v-bind:class="{
                      'filter-arrow-up': filter.isOpen,
                    }"
                  >
                    <!-- Arrow icon -->
                    <fdk-inline-svg :src="'arrow-dropdown-black'" />
                  </span>
                </div>
                <div
                  class="filter-disp"
                  v-bind:class="{ open: !filter.isOpen }"
                  v-if="filter.key.kind == 'multivalued'"
                >
                  <div
                    class="filter-search"
                    v-if="filter.values.length > SHOW_SEARCH_THRESHOLD"
                  >
                    <input
                      v-model="filter.searchText"
                      :placeholder="placeholder"
                      class="light-xxs"
                      @input="filterResults(filter, idx)"
                    />
                    <span
                      class="search-icon"
                      @click="filterResults(filter, idx)"
                    >
                      <fdk-inline-svg :src="'search-black'"></fdk-inline-svg>
                    </span>
                  </div>
                  <div class="example">
                    <ul class="filter-items-container" id="scroll-bar">
                      <li
                        v-for="(filterItem, index) in filter.filteredValues"
                        :key="'filter-desktop' + index"
                      >
                        <fdk-link :link="filterItem.url" :disabled="filter.key.is_disabled" v-if="index < 8">
                          <div class="filter-item">
                            <div v-if="!filterItem.is_selected">
                              <!-- CheckBox Unchecked -->
                              <fdk-inline-svg
                                :src="'regular'"
                                class="icon"
                              ></fdk-inline-svg>
                            </div>
                            <div v-if="filterItem.is_selected">
                              <!-- CheckBox Checked -->
                              <fdk-inline-svg
                                class="icon"
                                :src="'check-box-selected'"
                              ></fdk-inline-svg>
                            </div>

                            <div
                              class="filter-item-value regular-xxs"
                              :class="{
                                active: filterItem.is_selected == true,
                              }"
                            >
                              {{ filterItem.display }}
                            </div>
                            <div
                              class="filter-item-count light-xxxs cl-DoveGray"
                            >
                              ({{ filterItem.count }})
                            </div>
                          </div>
                        </fdk-link>
                        <fdk-link
                          :link="filterItem.url"
                          :disabled="filter.key.is_disabled"
                          v-else-if="viewMore[idx]"
                        >
                          <div class="filter-item">
                            <div v-if="!filterItem.is_selected">
                              <!-- CheckBox Unchecked -->
                              <fdk-inline-svg
                                :src="'regular'"
                                class="icon"
                              ></fdk-inline-svg>
                            </div>
                            <div v-if="filterItem.is_selected">
                              <!-- CheckBox Checked -->
                              <fdk-inline-svg
                                class="icon"
                                :src="'check-box-selected'"
                              ></fdk-inline-svg>
                            </div>

                            <div
                              class="filter-item-value regular-xxs"
                              :class="{
                                active: filterItem.is_selected == true,
                              }"
                            >
                              {{ filterItem.display }}
                            </div>
                            <div
                              class="filter-item-count light-xxxs cl-DoveGray"
                            >
                              ({{ filterItem.count }})
                            </div>
                          </div>
                        </fdk-link>
                      </li>
                    </ul>
                    <div
                      v-if="filter.filteredValues.length > 8"
                      class="view-more"
                      @click="changeViewMore(idx)"
                    >
                      {{
                        !viewMore[idx]
                          ? `+ ${filter.filteredValues.length - 8} more`
                          : `- view less`
                      }}
                    </div>
                  </div>
                </div>
                <div
                  class="filter-disp"
                  v-bind:class="{ open: !filter.isOpen }"
                  v-else-if="
                    filter.key.kind == 'range' && filter.values.length > 0
                  "
                >
                  <fdk-slider>
                    <template slot-scope="sliderData">
                      <fy-slider-filter
                        :filteritem="filter"
                        :reset="resetSlider"
                        :show-text-box="false"
                        @slider-query="sliderData.replaceQuery($event, filter)"
                      ></fy-slider-filter>
                    </template>
                  </fdk-slider>
                </div>
              </div>
            </div>
          </div>

          <div class="right">
            <div>
              <fdk-filter-modal>
                <template slot-scope="filterModalData">
                  <transition
                    name="modal-filter"
                    v-if="showFilterModal"
                    @close="showFilterModal = !showFilterModal"
                  >
                    <div class="modal">
                      <div class="modal-container">
                        <div class="modal-header">
                          <span class="bold-xl">FILTER</span>
                          <div
                            v-on:click="
                              closeModal($event, 'filter');
                              filterModalData.closeModal();
                            "
                          >
                            <fdk-inline-svg src="cross-black"></fdk-inline-svg>
                          </div>
                        </div>
                        <div class="modal-content">
                          <div class="pane leftPane">
                            <ul>
                              <li
                                class="title"
                                v-for="(filteritem,
                                idx) in filterModalData.filters"
                                :key="idx + '-mobile'"
                                v-on:click="
                                  filterModalData.updateSelectedItem(
                                    filteritem,
                                    idx
                                  );
                                  mobileSearchText = '';
                                "
                                v-bind:class="{
                                  'bold-lg active':
                                    filterModalData.selected_item == idx,
                                }"
                              >
                                <fdk-inline-svg
                                  v-if="!filteritem.key.logo"
                                  :src="'home'"
                                ></fdk-inline-svg>
                                <img
                                  class="filter-image"
                                  v-else
                                  :src="filteritem.key.logo"
                                  alt="logo"
                                />
                                <span class="modal-text">
                                  {{ filteritem.key.display }}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div class="pane rightPane">
                            <div
                              class="filter-disp"
                              v-if="
                                filterModalData.filters[
                                  filterModalData.selected_item
                                ].key.kind !== 'range'
                              "
                            >
                              <div
                                class="filter-search-mobile"
                                v-if="
                                  filterModalData.filters[
                                    filterModalData.selected_item
                                  ].values.length > SHOW_SEARCH_THRESHOLD
                                "
                              >
                                <input
                                  type="text"
                                  v-model="mobileSearchText"
                                  :placeholder="
                                    'Search ' +
                                      filterModalData.filters[
                                        filterModalData.selected_item
                                      ].key.display
                                  "
                                  @input="
                                    filterModalData.getFilteredResults(
                                      mobileSearchText
                                    )
                                  "
                                />
                              </div>
                              <ul>
                                <li
                                  class="filterValue"
                                  v-for="(filterValue,
                                  index) in filterModalData.getFilteredResults(
                                    mobileSearchText
                                  )"
                                  :key="filterValue.value + index"
                                  v-on:click="
                                    filterModalData.updateFilter(
                                      filterValue,
                                      filterModalData.selected_item
                                    )
                                  "
                                >
                                  <fdk-inline-svg
                                    :src="'regular'"
                                    class="icon"
                                    v-if="!filterValue.is_selected"
                                  ></fdk-inline-svg>
                                  <fdk-inline-svg
                                    :src="'check-box-selected'"
                                    class="icon"
                                    v-if="filterValue.is_selected"
                                  ></fdk-inline-svg>
                                  <span class="regular-s">
                                    {{ filterValue.display }}
                                  </span>
                                  <span class="count regular-xxs">
                                    {{ filterValue.count }}
                                  </span>
                                </li>
                              </ul>
                            </div>

                            <div class="filter-disp" v-else>
                              <div class="slider">
                                <fy-slider-filter
                                  :filteritem="
                                    filterModalData.filters[
                                      filterModalData.selected_item
                                    ]
                                  "
                                  :reset="resetSlider"
                                  :show-text-box="false"
                                  @slider-query="
                                    filterModalData.updateSliderInfo(
                                      $event,
                                      filterModalData.filters[
                                        filterModalData.selected_item
                                      ]
                                    )
                                  "
                                ></fy-slider-filter>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <div
                            class="actionBtn"
                            @click="
                              filterModalData.resetFilters();
                              resetSlider = !resetSlider;
                              filterModalData.applyFilters();
                              showFilterModal = false;
                            "
                          >
                            <span>RESET</span>
                          </div>
                          <div
                            class="actionBtn"
                            @click="
                              filterModalData.applyFilters();
                              closeModal($event, 'filter');
                            "
                          >
                            <span>APPLY FILTERS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                  <!-- <div
                    class="active-filters-container"
                    v-if="selectedOptions(context).length > 0"
                  >
                    <div
                      v-for="(item, index) in selectedOptions(context)"
                      :key="index"
                    >
                      <div
                        @click="
                          updateSelectedOptions(
                            item,
                            filterModalData.updateFilter
                          )
                        "
                        class="selected-item"
                      >
                        <span>{{
                          getFilterDisplay(context.filters, item)
                        }}</span>
                        <span style="margin-left:10px">
                          <div>
                            <span class="close-icon"></span>
                          </div>
                        </span>
                      </div>
                    </div>
                    <div
                      class="reset-btn"
                      @click="resetFilters(filterModalData.resetFilters)"
                      v-if="selectedOptions(context).length > 1"
                    >
                      <span>CLEAR ALL</span>
                    </div>
                  </div> -->
                </template>
              </fdk-filter-modal>
            </div>

            <fdk-infinite-loading class="plp-container">
              <template slot-scope="infiniteLoaderData">
                <div class="product-container">
                  <div
                    v-for="(product, index) in getProducts"
                    :key="index + '-product.uid'"
                  >
                    <fdk-link
                      :link="product.url"
                      :target="hrefTarget"
                      class="product-wrapper"
                    >
                      <fy-product-card
                        :product="product"
                        :context="context"
                        :active-product-id="active_product_uid"
                        @slide-up="slideUpEventListener($event)"
                        @slide-down="slideDownEventListener($event)"
                        :global_config="global_config"
                        :listing_price_config="listingPriceConfig"
                      ></fy-product-card>
                    </fdk-link>
                  </div>
                  <fdk-loader
                    id="loader"
                    class="loader-center"
                    v-if="infiniteLoaderData.hasNext"
                  ></fdk-loader>
                </div>
              </template>
            </fdk-infinite-loading>
          </div>
        </template>
      </div>
      <transition name="modal-sort" v-if="showSortByModal">
        <div class="modal">
          <div class="modal-container">
            <div class="modal-header">
              <span class="bold-xl">SORT BY</span>
              <div v-on:click="closeModal($event, 'sort')">
                <fdk-inline-svg :src="'cross-black'"></fdk-inline-svg>
              </div>
            </div>
            <div class="modal-content">
              <ul style="width:100%">
                <li
                  v-for="(sortitem, index) in context.sort_on"
                  :key="index + '-sort'"
                  v-bind:class="{
                    'bold-lg active': getSortOnValue == sortitem.value,
                  }"
                  v-on:click="closeModal($event, 'sort')"
                >
                  <fdk-link :link="sortitem.url" class="filterValue sort-item">
                    {{ sortitem.display }}
                    <span class="sort-arrow">
                      <fdk-inline-svg
                        :src="'arrow-dropdown-black'"
                      ></fdk-inline-svg>
                    </span>
                  </fdk-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
      <!-- FILTER MODAL -->
      <div class="mobile share-wrap">
        <transition
          name="fade"
          :data-ss="String(showShare)"
          :data-ismobile="String(isMobile)"
        >
          <share
            :title="
              `Spread the shopping delight! Scan QR & share this products with
                            your loved ones`
            "
            :shareLoading="shareLoading"
            :qr_code="qr_code"
            @close-share="showShare = false"
            v-if="showShare && isMobile"
            :share_link="share_link"
            v-click-outside="hideShare"
            :key="'mobile-share'"
          />
        </transition>
      </div>
    </template>
  </div>
</template>

<script>
import fyproductcard from "./../../global/components/fy-product-card.vue";
import fyselect from "./../../global/components/fy-select.vue";
import fynotfound from "./../../global/components/fy-not-found.vue";
import sliderfilter from "./../../global/components/fy-slider-filter.vue";
import share from "./../../global/components/share.vue";
import { detectMobileWidth } from "./../../helper/utils";
import { isBrowser, isNode } from "browser-or-node";
import sortDD from "./../../global/components/plp/sort-dd";

export default {
  name: "fdk-plp",
  components: {
    "fy-product-card": fyproductcard,
    "fy-select": fyselect,
    "fy-not-found": fynotfound,
    "fy-slider-filter": sliderfilter,
    "sort-dd": sortDD,
    share,
  },
  props: {
    context: {},
  },

  watch: {
    context: function() {
      if (
        this.context.filters &&
        this.context.filters.length > this.viewMore.length
      ) {
        for (var i = 0; i < this.context.filters.length; i++) {
          if (!this.viewMore[i]) {
            this.$set(this.viewMore, i, false);
          }
        }
      }
    },
    active_product_uid: function() {
      this.context.item.map((item) => {
        if (item.uid === this.active_product_uid) {
          item.is_active = true;
        } else {
          item.is_active = false;
        }
      });
    },
  },
  data: function data() {
    return {
      shareLoading: false,
      showShare: false,
      share_link: "",
      qr_code: "",
      active_product_uid: 0,
      mobileSearchText: "",
      selectedSortOpt: "",
      storeName: "",
      SHOW_SEARCH_THRESHOLD: 8,
      placeholder: "Search ",
      showFilterModal: false,
      showSortByModal: false,
      filteredItems: [],
      selectedFilters: [],
      searchTextObj: {},
      resetSlider: false,
      viewMore: [],
      products: [
        {
          isImageLoading: true,
        },
      ],
      isMobile: false,
      // isMounted: false
    };
  },
  mounted() {
    this.isMobile = detectMobileWidth();
    // this.isMounted = true;
  },
  methods: {
    hideShare() {
      this.showShare = false;
    },
    getShareLink(share) {
      this.shareLoading = true;
      this.showShare = true;
      share.getShareLink(window.location.href).then((res) => {
        share.generateQRCode(res).then(( data ) => {
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
    slideUpEventListener(id) {
      this.active_product_uid = id;
    },
    slideDownEventListener() {
      this.active_product_uid = 0;
    },
    resetFilters(modalReset) {
      if (this.$refs && this.$refs.mobileActionContainer) {
        modalReset();
      }
      this.$router.push({ query: {} });
    },
    selectedOptions: function(context) {
      let { filters } = context;
      filters = filters || [];
      let filterOptionsArray = filters.reduce((a, f, index) => {
        let { values, key } = f;
        values = values || [];
        let selectedValues = values
          .map((v) => {
            if (v.is_selected) {
              v.filterIndex = index;
              return v;
            }
          })
          .filter((v) => v);
        return [...a, ...selectedValues];
      }, []);
      this.activeFilters = filterOptionsArray;
      return filterOptionsArray;
    },
    updateSelectedOptions(item, modalUpdate) {
      if (this.$refs && this.$refs.mobileActionContainer) {
        modalUpdate(item, item.filterIndex);
      }
      if (item.url) {
        this.$router.push(item.url);
      } else {
        this.getRangeURL(item);
      }
    },
    getRangeURL(item) {
      let key = this.context.filters[item.filterIndex].key.name;
      let q = { ...this.$route.query };
      if (Object.keys(q).includes(key)) {
        delete q[key];
      }
      this.$router.push({ ...this.$route, query: q });
    },

    getFilterDisplay: function getFilterDisplay(filters, filterObj) {
      let filter = filters[filterObj.filterIndex];
      if (filter.key.kind === "range") {
        if (filterObj.currency_code) {
          return (
            "₹ " + filterObj.selected_min + " - ₹ " + filterObj.selected_max
          );
        } else {
          return filterObj.selected_min + "% - " + filterObj.selected_max + "%";
        }
      }
      return filterObj.display.toUpperCase();
    },
    changeViewMore(idx) {
      this.viewMore[idx] = !this.viewMore[idx];
      this.$forceUpdate();
    },
    kFormatter: function kFormatter(num) {
      return Math.abs(num) > 999
        ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(2) + "k"
        : Math.sign(num) * Math.abs(num);
    },
    // updateSelection: function updateSelection(event) {
    //   const val = event.target.value;
    //   const sortItemIndex = this.context.sort_on.findIndex(
    //     (item) => item.value === val
    //   );
    //   this.$router.push(this.context.sort_on[sortItemIndex].url);
    // },
    updateSelection: function updateSelection(val) {
      const sortItemIndex = this.context.sort_on.findIndex(
        (item) => item.value === val
      );
      this.$router.push(this.context.sort_on[sortItemIndex].url);
    },
    closeModal: function closeModal(event, type) {
      if (type === "sort") {
        this.showSortByModal = false;
      } else if (type === "filter") {
        this.showFilterModal = false;
      }
    },
    viewModal: function viewModal(event, type) {
      if (type === "sort") {
        this.showSortByModal = true;
      } else if (type === "filter") {
        this.showFilterModal = true;
      }
    },

    filterResults: function filterResults(filter, index) {
      this.getFilters[index].filteredValues = filter.values.filter((item) => {
        if (filter.searchText.length > 0) {
          this.searchTextObj[this.getFilters[index].key.name] =
            filter.searchText;
          return (
            item.display
              .toLowerCase()
              .indexOf(filter.searchText.toLowerCase()) !== -1
          );
        } else {
          return item;
        }
      });
      this.$forceUpdate();
    },
    loadImage: function loadImage(id) {
      const placeHolder = this.$refs[`placeholder-${id}`];
      placeHolder[0].style.display = "none";
    },
    isLoadedInIframe() {
      if (isBrowser && window.location !== window.parent.location) {
        return true;
      } else {
        return false;
      }
    },
  },

  computed: {
    getFilters: function getFilters() {
      this.filteredItems = [];
      const data =
        this.context.filters &&
        this.context.filters.map((item) => {
          item.searchText =
            this.searchTextObj[item] && this.searchTextObj[item.key]
              ? this.searchTextObj[item.key.name]
              : "";
          item.filteredValues = item.values;
          this.filteredItems.push(item);

          return item;
        });
      return this.filteredItems;
    },
    getSortOnValue: function getSortOnValue() {
      let val = "";
      let item = [];
      if (this.context && this.context.sort_on) {
        item = this.context.sort_on.filter((item) => item.is_selected);
      }
      return item.length > 0 ? item[0].value : "popular";
    },
    getSelectedFilters: function getSelectedFilters() {
      this.selectedFilters = this.getFilters.filter((item) => {
        return item.is_selected;
      });
    },
    getProducts: function getProducts() {
      return this.context.items.map((item) => {
        item.is_active = false;
        return item;
      });
    },
    hrefTarget() {
       return detectMobileWidth() ? "_self" : "_blank";
    },
    listingPriceConfig() {
      return this.context.app_features?.feature?.common?.listing_price?.value;
    },
  },
};
</script>

<style lang="less" scoped>
.plp-container {
  @media @tablet {
    margin: 20px 0 0 0;
  }
  /deep/.list-items {
    background: none;
  }
  /deep/.loading {
    display: none;
  }
}
.share-wrap {
  /deep/ .share-popup {
    @media @tablet {
      top: 40px;
    }
    @media @mobile {
      top: 0;
    }
  }
  // @media mobile {
  //   display:none;
  // }
}

.share-button {
  margin-left: 10px;
  cursor: pointer;
  top: 7px;
  position: absolute;
  .share-img {
    position: relative;
    margin: 0;
  }
}
.share-mobile-button {
  cursor: pointer;
  display: flex;
  position: absolute;
  cursor: pointer;
  .share-mobile-img {
    position: relative;
    margin: 0;
  }
}
.content-container {
  display: flex;
  background: white;
  margin-top: 15px;
  min-height: 80vh;
  @media @mobile {
    margin: 10px 5px;
  }
}

.filterValue img,
.filter-item img {
  padding-right: 5px;
}

.desktop-header {
  padding: 0;
  display: flex;
  line-height: 35px;
  align-items: center;
  background: none;
  margin-bottom: 1%;
}
.cover .meta-desc {
  width: 130px;
}
.title {
  width: 18%;
  text-transform: uppercase;
  line-height: 35px;
  margin: 0;
}
.seperator {
  padding: 0 20px 0 24px;
  font-size: 21px;
  color: #41434c;
  opacity: 0.16;
}

.brand-name {
  text-transform: capitalize;
}
.sort {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  padding: 0 34px 0 0;
}
.sort-arrow {
  transform: rotate(-90deg);
}
.wide {
  width: 300px;
  min-height: 35px;
  margin-left: 0.3125rem;
  border: 0;
}

.store-name {
  font-weight: 900;
  margin-left: 0.5em;
}
.right {
  margin: 1%;
  width: 100%;
}
.left {
  border-right: 1px solid #e4e5e6;
  margin-bottom: 2em;
  // margin-right:14px;
  // box-shadow:0 0 15px rgba(0,0,0,.12);
  // border-radius:8px;
  background-color: #ffffff;
  // margin-left:-10px;
}
.product-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18%, 1fr));
  grid-auto-rows: auto;
  grid-template-rows: 1fr;
  grid-gap: 2em;
}

.product-wrapper {
  border: 1px solid #e4e5e6;
  border-radius: 3px;
  box-sizing: border-box;
  height: 100%;
}

.mobile-header {
  display: none;
  padding-bottom: 25px;
  .m-header {
    display: flex;
    flex-direction: column;
    background: white;
    justify-content: center;
    align-items: center;
    width: 100%;
    line-height: 2em;
    position: fixed;
    z-index: 2;
    top: 68px;
    // border-top: 1px solid #f8f8f8;
  }
  .m-title {
    background: #f1f0ee;
    width: 100%;
    line-height: 20px;
  }
  .m-title > div {
    padding: 10px;
  }
  .text-seperator {
    padding: 0 5px;
  }

  .m-action-container {
    margin-top:20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #e6e6e6;
    text-align: center;
    color: #41434c;
    padding: 5px;
    user-select: none;
  }
  .m-action-child-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    /deep/ .share-popup {
      .close {
        top: 70px;
      }
    }
  }
}

.desktop-header {
  display: block;
  .header {
    display: flex;
    flex-direction: column;
    background: white;
    justify-content: center;
    align-items: center;
    width: 100%;
    line-height: 2em;
    // border-top: 1px solid #f8f8f8;
  }
  .m-title {
    background: #f1f0ee;
    width: 100%;
    line-height: 20px;
  }
  .m-title > div {
    padding: 10px;
  }
  .text-seperator {
    padding: 0 5px;
  }

  .m-action-container {
    margin-top:20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #e6e6e6;
    text-align: center;
    color: #41434c;
    padding: 5px 0;
    user-select: none;
  }
  .m-action-child-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    /deep/ .share-popup {
      .close {
        top: 70px;
      }
    }
  }
}

.cl-DoveGray {
  color: #41434c;
}
.m-filter-container {
  width: 100%;
}
.line {
  height: 30px;
  line-height: 30px;
  color: #e6e6e6;
  top: 2px;
  font-size: 25px;
}
.filter-list {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 262px;
  /*background: white;*/
  padding: 5px 10px;
  min-height: auto;
}

.filter-item-value {
  text-transform: capitalize;
  font-size: 13px;
}

.filter-title {
  text-transform: uppercase;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
}
.fil_tit {
  // font-weight:bold !important;
  // font-size:13px !important;
}

.filter-arrow-up {
  transform: rotate(180deg);
}

.filter-item {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 8px;
  align-items: center;
  min-height: 1.5rem;
  color: #41434c;
  // border-bottom: 1px solid #f5f5f5;
}

.filter-list {
  display: flex;
  flex-direction: column;
}
.slider {
  padding: 20px;
}
.open {
  display: none;
}

.filter-search input {
  border: none;
  // background: #f5f5f5;
  outline: 0;
  padding: 7px 0 7px 5px;
  // border-radius: 5px 0 0 5px;
  width: 85%;
}
.search-icon {
  margin: auto;
}

.filter-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 10px 0;
  border: 1px solid #e4e5e6;
  // border-radius: 5px;
  cursor: pointer;
}

.filter-item-count {
  margin-left: auto;
}

.product-card {
  width: 100%;
  position: relative;
  border-radius: 5%;
}

.text-seperator {
  padding: 0 5px;
}

.modal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  overflow: hidden;
  background-color: white;
  transition: all 0.25s ease;
  user-select: none;
}
.modal-container {
  height: 100vh;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
}
.modal-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.pane {
  height: 90vh;
  overflow: auto;
}
.pane ul {
  padding-bottom: 30px;
}

.leftPane {
  flex: 0.6;
  border-right: 1px solid #e6e6e6;
}
.leftPane .title {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  width: 100%;
}
.leftPane .title:hover {
  background-color: #e6e6e6;
}
.inline-svg {
  margin-bottom: 0px;
  margin-right: 4px;
}

.rightPane {
  flex: 1.2;
}
.filterValue {
  padding: 15px 10px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
}
.filterValue:hover {
  background-color: #e6e6e6;
}

.sort-item {
  justify-content: space-between;
}

.count {
  color: gray;
  margin-left: auto;
}
.filter-search-mobile {
  margin: 0 10px;
  padding: 5px;
  // border-radius: 10px;
  border: 1px solid gray;
  position: relative;
  height: 24px;
}
.filter-search-mobile input {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border: none;
  text-indent: 10px;
  width: 85%;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.modal-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  text-align: center;
  border-top: 1px solid #e6e6e6;
}
.actionBtn {
  width: 44%;
  display: inline-block;
  padding: 15px 10px;
  color: #19b3b9;
}
.actionBtn:nth-child(1) {
  border-right: 1px solid #e6e6e6;
}
.modal-text {
  text-transform: capitalize;
  text-align: center;
}
.rating {
  unicode-bidi: bidi-override;
  color: #c5c5c5;
  font-size: 20px;
  height: 20px;
  width: 110px;
  position: relative;
  padding: 0;
  text-shadow: 0px 1px 0 #a2a2a2;
  white-space: nowrap;
}

.bottom-layer {
  padding: 0;
  display: block;
  z-index: 0;
}
.top-layer {
  color: #e7711b;
  padding: 0;
  position: absolute;
  z-index: 1;
  display: block;
  top: 0;
  left: 0;
  overflow: hidden;
  height: inherit;
}
.active {
  color: #19b3b9;
}
/deep/ .loader-center {
  grid-column-start: -1;
  grid-column-end: 1;
  .container {
    background-color: transparent;
  }
}
@media screen and (max-width: 1024px) {
}
@media screen and (max-width: 768px) {
  .product-image {
    width: 100%;
  }
  .header {
    display: none;
  }
  .mobile-header {
    display: block;
  }
  .desktop-header {
    display: none;
  }
  .left {
    display: none;
  }
  .right {
    width: 100%;
    margin: 0 15px;
  }
  .product-container {
    grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
    grid-gap: 0.5em;
  }
  .cl-Profit {
    color: #41434c;
  }
  .header {
    display: none;
  }
  .inline-svg {
    margin-bottom: 0;
  }
}

@media screen and (min-width: 320px) {
  .actionBtn {
    width: 40%;
  }
}
// .shine {
//   border: 2px solid #dbd9d92a;
//   border-radius: 2%;
//   background: #f6f7f8;
//   background-image: linear-gradient(
//     to right,
//     #f6f7f8 0%,
//     #e8e9eb 20%,
//     #f6f7f8 40%,
//     #f6f7f8 100%
//   );
//   background-repeat: no-repeat;
//   background-size: 100% 100%;
//   display: inline-block;
//   position: relative;

//   -webkit-animation-duration: 1s;
//   -webkit-animation-fill-mode: forwards;
//   -webkit-animation-iteration-count: infinite;
//   -webkit-animation-name: placeholderShimmer;
//   -webkit-animation-timing-function: linear;
// }

// @-webkit-keyframes placeholderShimmer {
//   0% {
//     background-position: -468px 0;
//   }

//   100% {
//     background-position: 468px 0;
//   }
// }
.view-more {
  font-size: 14px;
  display: flex;
  justify-content: center;
  margin-top: 5%;
  color: #35919b;
  cursor: pointer;
}
.active-filters-container {
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  padding: 0px 0 10px 0;
  margin: 0 0px 18px 0px;
  /*border-bottom: 1px solid #e4e5e6;*/
  @media @mobile {
    margin: 0;
    padding: 10px;
  }
  .selected-item {
    transition: all 0.1s ease-in;
    height: 1.5em;
    background: #e4e4e4;
    border-radius: 4px;
    border: 1px solid #bdbdbd;
    padding: 7px 9px;
    margin: 0 12px 12px 0;
    display: flex;
    align-items: center;
    color: #41434c;
    cursor: pointer;
    &:hover {
      background: #41434c;
      color: white;
      .close-icon {
        background-image: url("https://hdn-1.fynd.com/company/884/applications/000000000000000000000004/theme/pictures/free/original/theme-image-1598082078680.png");
      }
    }
    .close-icon {
      background-image: url("https://hdn-1.fynd.com/company/884/applications/000000000000000000000004/theme/pictures/free/original/theme-image-1598082078680.png");
      width: 9px;
      height: 9px;
      display: inline-block;
      background-size: cover;
    }
  }
  .reset-btn {
    padding: 5px;
    display: flex;
    align-items: center;
    color: #19b3b9;
    cursor: pointer;
  }
}
.filter-image {
  width: 35px;
}

.product-count {
  font-size: 18px;
  font-weight: 700;
}

.dark-sm {
  font-size: 12px;
}
</style>

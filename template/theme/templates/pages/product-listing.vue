<template>
  <div class="plp-main-container coll-cont">
    <empty-state
      v-if="!context.loading && (!context.items || !context.items.length)"
      :title="
        context && context.product_meta && context.product_meta.data
          ? `${context.product_meta.data[0].name} has not products.`
          : 'No products found'
      "
    />
    <div v-else-if="context && context.items && context.items.length > 0">
      <div class="bg-white products-cont">
        <div class="mobile-refinement-bar sticky-div">
          <div
            class="filter-sort-button-holder"
            @click.stop="showMobileFilters = true"
          >
            <div class="filter-results" tabindex="0">
              <span class="filter-sort-button-name">Filter-Sort By</span>
            </div>
          </div>
          <fdk-share>
            <template slot-scope="share">
              <div class="share-button" @click.stop="getShareLink(share)">
                <img src="./../../assets/images/share.svg" class="share-img" />
              </div>
            </template>
          </fdk-share>
        </div>

        <div class="left">
          <div
            class="filter-list"
            v-for="(filter, idx) in getFilters"
            :key="idx + '-desktop' + filter.key.display"
          >
            <div class="filters">
              <div
                class="filter-title"
                v-on:click="filter.isOpen = !filter.isOpen"
                v-if="filter.values.length > 0"
              >
                <span>{{ filter.key.display }}</span>
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
                    @input="filterResults(filter, idx)"
                  />
                  <span class="search-icon" @click="filterResults(filter, idx)">
                    <fdk-inline-svg :src="'search-black'"></fdk-inline-svg>
                  </span>
                </div>
                <div class="example">
                  <ul class="filter-items-container" id="scroll-bar">
                    <li
                      v-for="(filterItem, index) in filter.filteredValues"
                      :key="'filter-desktop' + index"
                    >
                      <fdk-link :link="filterItem.url" v-if="index < 8">
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
                            class="filter-item-value"
                            :class="{
                              active: filterItem.is_selected == true,
                            }"
                          >
                            {{ filterItem.display }}
                          </div>
                          <div class="filter-item-count">
                            {{ filterItem.count ? (filterItem.count) : ''}}
                          </div>
                        </div>
                      </fdk-link>
                      <fdk-link
                        :link="filterItem.url"
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
                            class="filter-item-value"
                            :class="{
                              active: filterItem.is_selected == true,
                            }"
                          >
                            {{ filterItem.display }}
                          </div>
                          <div class="filter-item-count">
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
                    <slider-filter
                      type="desktop"
                      :filteritem="filter"
                      :reset="resetSlider"
                      :show-text-box="false"
                      @slider-query="sliderData.replaceQuery($event, filter)"
                    ></slider-filter>
                  </template>
                </fdk-slider>
              </div>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="main-actions-container">
            <div class="search-result-options">
              <div class="showing-results">
                <p
                  class="section-heading"
                  style="font-weight: bold"
                  v-if="
                    context && context.product_meta && context.product_meta.data
                  "
                >
                  {{ context.product_meta.data[0].name }}
                </p>
                <span v-if="context && context.product_count">
                  Showing: {{ context.product_count }} Products
                </span>
              </div>
              <div class="align-share">
                <div
                  class="sort-order js_sort-order sort-open"
                  role="button"
                  aria-label="Open/Close sort dropdown"
                  tabindex="0"
                  @click="showSortOn = !showSortOn"
                >
                  <div class="sort-list">
                    <div class="sort-label">
                      <span class="sort-selected-option">
                        {{ getSortOnValue }}
                      </span>
                      <span
                        class="select-arrow icon-arrow-mid-down-black"
                      ></span>
                    </div>
                    <ul class="sort-list-items" v-if="showSortOn">
                      <li
                        class="sort-option sort-selected"
                        v-for="(item, idx) in context.sort_on"
                        :key="idx"
                        @click="updateSelection(item)"
                        tabindex="-1"
                      >
                        <fdk-link :link="item.url" class="sort-option">
                          {{ item.display }}
                        </fdk-link>
                      </li>
                    </ul>
                  </div>
                </div>
                <fdk-share v-click-outside="hideShare">
                  <template slot-scope="share">
                    <div class="share-button" @click="getShareLink(share)">
                      <img
                        src="./../../assets/images/share.svg"
                        class="share-img"
                      />
                      <transition name="fade">
                        <rd-share
                          :title="`Spread the shopping delight! Scan QR & share these products with
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
            </div>
          </div>
          <div class="mobile-items-found">
            <p
              class="section-heading"
              style="font-weight: bold; margin-left: 0"
              v-if="
                context && context.product_meta && context.product_meta.data
              "
            >
              {{ context.product_meta.data[0].name }}
            </p>
            Showing: {{ context.product_count }} Products
          </div>
          <div class="main-product-container">
            <fdk-filter-modal>
              <template slot-scope="filterModalData">
                <div
                  class="container refinements-holder"
                  ref="filterSortModalDiv"
                >
                  <div
                    ref="mobileActionContainer"
                    class="refinement-bar d-block col-md-12"
                    :class="{ 'show-refinement-bar': showMobileFilters }"
                  >
                    <div class="mobile-sort-header sticky-div">
                      <div class="mobile-sort-header-bar clearfix">
                        <div class="pull-left mobile-header-title">
                          <span>Sort & Filters</span>
                        </div>
                        <button
                          class="black-btn icon-close-black close js_close"
                          aria-label="Close"
                          @click="
                            showMobileFilters = false;
                            filterModalData.closeModal();
                          "
                        >
                          <i class="fa fa-close"></i>
                        </button>
                      </div>
                    </div>
                    <div class="mobile-filter-sort-bar">
                      <form>
                        <div class="sort-options-mobile" aria-hidden="true">
                          <span role="group" aria-label="Sort by">
                            <div
                              class="radio-button-sort"
                              v-for="(sortitem, index) in context.sort_on"
                              :key="index + '-sort'"
                              @click="
                                updateSelection(sortitem);
                                showMobileFilters = false;
                                filterModalData.closeModal();
                                redirectToPage(sortitem.url);
                              "
                            >
                              <div class="filterValue sort-item">
                                <span
                                  class="selection-box not-selected-box"
                                  :class="{
                                    'selected-box':
                                      getSortOnValue === sortitem.display,
                                  }"
                                >
                                  {{ sortitem.display }}
                                </span>
                              </div>
                            </div>
                            <hr />
                          </span>
                        </div>
                      </form>
                    </div>
                    <div class="refinement-constraint">
                      <div
                        class="refinements-container"
                        :class="{ 'display-mobile-none': !showMobileFilters }"
                      >
                        <div class="filter-header d-none d-lg-block">
                          <span>Filter By</span>
                        </div>
                        <div class="refinements">
                          <div
                            class="
                              card
                              js_collapsible js_refinement
                              refinement
                              collapsed
                              refinement-fit
                            "
                            v-for="(filter, idx) in filterModalData.filters"
                            :key="idx"
                            :class="{
                              'select-open': filter.isOpen,
                              'hidden-filter':
                                idx > 5 && showMoreFilters == false,
                            }"
                          >
                            <template v-if="filter.key.kind === 'multivalued'">
                              <h2
                                class="js_card-header card-header"
                                tabindex="0"
                                v-if="filter.values.length > 0"
                                @click="toggleDropdown(filter)"
                              >
                                <span class="filter-title js_title">
                                  {{ filter.key.display }}
                                  <span
                                    class="
                                      js_total-selected
                                      total-selected
                                      d-lg-none
                                    "
                                  ></span>
                                </span>
                                <span
                                  class="
                                    select-arrow
                                    icon-arrow-mid-down-black
                                    js_select-arrow
                                  "
                                ></span>
                              </h2>
                              <div
                                class="js_card-body card-body"
                                :ref="'fltDropdown-cont' + filter.key.name"
                                v-if="filter.values.length > 0"
                              >
                                <ul
                                  class="values"
                                  :ref="'fltDropdown' + filter.key.name"
                                >
                                  <li
                                    :title="`Refine by ${filter.key.display}: ${filterItem.display}`"
                                    class="col-md-12 value js_value"
                                    v-for="(filterItem, index) in filter.values"
                                    :key="filterItem.value + index"
                                    @click="
                                      updateFilters(
                                        filter,
                                        filterItem,
                                        idx,
                                        filterModalData.updateSelectedItem,
                                        filterModalData.updateFilter
                                      )
                                    "
                                  >
                                    <span
                                      class="selection-box not-selected-box"
                                      :class="{
                                        'selected-box':
                                          filterItem.is_selected == true,
                                      }"
                                      >{{ filterItem.display }}</span
                                    >
                                  </li>
                                </ul>
                              </div>
                            </template>
                            <div
                              class="filter-disp"
                              v-bind:class="{ open: !filter.isOpen }"
                              v-if="filter.key.kind == 'range'"
                            >
                              <h2
                                class="js_card-header card-header"
                                tabindex="0"
                                v-if="filter.values.length > 0"
                                @click="toggleDropdown(filter)"
                              >
                                <span class="filter-title js_title">
                                  {{ filter.key.display }}
                                  <span
                                    class="
                                      js_total-selected
                                      total-selected
                                      d-lg-none
                                    "
                                  ></span>
                                </span>
                                <span
                                  class="
                                    select-arrow
                                    icon-arrow-mid-down-black
                                    js_select-arrow
                                  "
                                ></span>
                              </h2>
                              <div
                                class="js_card-body card-body"
                                :ref="'fltDropdown-cont' + filter.key.name"
                              >
                                <fdk-slider class="value">
                                  <template slot-scope="sliderData">
                                    <div
                                      class="slider-container"
                                      :ref="'fltDropdown' + filter.key.name"
                                    >
                                      <slider-filter
                                        type="mobile"
                                        class="slider-position"
                                        :show-slider-text="false"
                                        :options="options"
                                        :filteritem="filter"
                                        :show-text-box="false"
                                        :reset="resetSlider"
                                        @slider-mount="
                                          resetSlider = !resetSlider
                                        "
                                        @slider-query="
                                          updateSliderFilters(
                                            $event,
                                            filter,
                                            idx,
                                            sliderData,
                                            filterModalData
                                          )
                                        "
                                      ></slider-filter>
                                      <div class="slider-range-info">
                                        <div>
                                          <span
                                            v-if="
                                              filter.values[0].currency_code
                                            "
                                          >
                                            {{
                                              getMinValue(filter.values[0])
                                                | currencyformat
                                            }}
                                          </span>
                                          <span v-else
                                            >{{
                                              getMinValue(filter.values[0])
                                            }}%</span
                                          >
                                        </div>
                                        <div
                                          style="opacity: 0.7; color: #1d1d1d"
                                        >
                                          to
                                        </div>
                                        <div>
                                          <span
                                            v-if="
                                              filter.values[0].currency_code
                                            "
                                          >
                                            {{
                                              getMaxValue(filter.values[0])
                                                | currencyformat
                                            }}
                                          </span>
                                          <span v-else
                                            >{{
                                              getMaxValue(filter.values[0])
                                            }}%</span
                                          >
                                        </div>
                                      </div>
                                    </div>
                                  </template>
                                </fdk-slider>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        class="clear-apply-wrapper d-lg-none"
                        :class="{ 'display-none': !showMobileFilters }"
                      >
                        <div class="button-container">
                          <button
                            class="secondary clear js_clear-filters"
                            tabindex="0"
                            @click="
                              filterModalData.resetFilters();
                              filterModalData.applyFilters();
                              showMobileFilters = false;
                            "
                          >
                            Clear
                          </button>
                        </div>
                        <div class="button-container">
                          <button
                            class="secondary apply-filters js_apply-filters"
                            tabindex="0"
                            @click="
                              filterModalData.applyFilters();
                              showMobileFilters = false;
                            "
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="cls-modal-bg"
                    :class="{ 'display-block': showMobileFilters }"
                    @click="hideMobileFilter(filterModalData.closeModal)"
                  ></div>
                </div>

                <div
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
                      <span>{{ getFilterDisplay(context.filters, item) }}</span>
                      <span style="margin-left: 10px">
                        <div>
                          <span class="close-chip-icon"></span>
                        </div>
                      </span>
                    </div>
                  </div>
                  <div
                    class="reset-btn"
                    @click="
                      filterModalData.resetFilters();
                      filterModalData.applyFilters();
                      resetFilters(filterModalData.resetFilters);
                    "
                    v-if="selectedOptions(context).length > 1"
                  >
                    <span>CLEAR ALL</span>
                  </div>
                </div>
              </template>
            </fdk-filter-modal>

            <fdk-infinite-loading>
              <template slot-scope="infiniteLoaderData">
                <div class="product-container">
                  <div
                    v-for="(product, index) in context.items"
                    :key="index + '-product.uid'"
                    class="product-grid-item"
                  >
                    <fdk-link
                      :link="product.url"
                      :target="hrefTarget"
                      class="product-link-wrap"
                    >
                      <product-card
                        :product="product"
                        :context="context"
                        :listing_price_config="listingPriceConfig"
                      ></product-card>
                    </fdk-link>
                  </div>
                  <!-- <loader
                  id="loader"
                  class="loader-center"
                  v-if="infiniteLoaderData.hasNext"
                ></loader> -->
                </div>
                <div
                  class="loader-center"
                  v-if="infiniteLoaderData.hasNext && isMounted"
                >
                  <img src="../../assets/images/loader.gif" alt="" />
                </div>
              </template>
            </fdk-infinite-loading>
          </div>
        </div>
        <transition name="fade">
          <rd-share
            :title="`Spread the shopping delight! Scan QR & share these products with
                      your loved ones`"
            :shareLoading="shareLoading"
            :qr_code="qr_code"
            @close-share="showShare = false"
            v-if="showShare"
            :share_link="share_link"
            class="showShare"
          />
        </transition>
      </div>
    </div>
    <toast :id="'toast-message'" :content="toast_message"></toast>
    <loader v-if="isLoading" />
  </div>
</template>

<script>
import productcard from "./../../global/components/product-card.vue";
import sliderfilter from "./../../global/components/slider-filter.vue";
import loader from "./../components/loader";
import emptystate from "./../components/empty-state";
import { detectMobileWidth } from "./../../helper/utils";
import share from "./../../global/components/common/share";
import toast from "./../../global/components/toast.vue";
export default {
  components: {
    "product-card": productcard,
    "empty-state": emptystate,
    "slider-filter": sliderfilter,
    loader,
    "rd-share": share,
    toast,
  },
  data() {
    return {
      isMounted: false,
      toast_message: "",
      isLoading: false,
      showFilters: false,
      placeholder: "Search",
      SHOW_SEARCH_THRESHOLD: 8,
      showSortOn: false,
      breadcrumbs: [],
      selectedSort: { value: "popular", display: "Popularity" },
      activeFilters: [],
      filteredItems: [],
      options: {
        dotSize: 15,
        processStyle: {
          backgroundColor: "#000",
          borderColor: "#000",
          height: "5px",
        },
        railStyle: {
          backgroundColor: "#ECECEC",
          borderColor: "#ECECEC",
          height: "4px",
        },
        tooltip: "none",
        dotStyle: { backgroundColor: "#000", borderColor: "#000" },
      },
      showSortByModal: false,
      showFilterByModal: false,
      activeFiltersSet: false,
      resetSlider: false,
      showMoreFilters: false,
      firstRun: true,
      searchTextObj: {},
      showMobileFilters: false,
      viewMore: [],
      showShare: false,
      share_link: "",
      qr_code: "",
      shareLoading: false,
    };
  },
  mounted() {
    let value = 0;
    this.isMounted = true;
    if (!this.context.loading) {
      this.activeFiltersSet = true;
    }
  },
  created() {},

  methods: {
    updateSelection: function updateSelection(item) {
      const val = item.value;
      const sortItemIndex = this.context.sort_on.findIndex(
        (item) => item.value === val
      );
      this.$router.push(this.context.sort_on[sortItemIndex].url);
    },
    resetFilters(modalReset) {
      this.showMobileFilters = false;
      if (this.$refs && this.$refs.mobileActionContainer) {
        modalReset();
      }
      this.$router.push({ query: {} });
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
    hideShare() {
      if (!this.isMobile) {
        this.showShare = false;
      }
    },

    getShareLink(share) {
      this.showShare = true;
      this.shareLoading = true;
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
    changeViewMore(idx) {
      this.viewMore[idx] = !this.viewMore[idx];
      this.$forceUpdate();
    },
    getRangeURL(item) {
      let key = this.context.filters[item.filterIndex].key.name;
      let q = { ...this.$route.query };
      if (Object.keys(q).includes(key)) {
        delete q[key];
      }
      this.$router.push({ ...this.$route, query: q });
    },
    updateSliderFilters(query, filter, idx, sliderData, filterModalData) {
      if (!this.showMobileFilters) {
        sliderData.replaceQuery(query, filter);
        return;
      }
      filterModalData.updateSelectedItem(filter, idx);
      filterModalData.updateSliderInfo(query, filter);
    },
    getBreadCrumbs() {
      let arr = [];
      arr.push({
        display: "Home",
        link: "/",
      });
      arr.push({
        display: "Products",
        link: "/products/",
      });
      return arr;
    },
    hideSort: function hideSort() {
      this.showSortOn = false;
    },
    hideFilter() {
      this.showFilters = false;
    },
    hideMobileFilter(closeModal) {
      // event.stopPropagation();
      closeModal();
      this.showMobileFilters = false;
    },

    selectedOptions: function (context) {
      let { filters } = context;
      filters = filters || [];
      let filterOptionsArray = filters.reduce((a, f, index) => {
        let { values, key } = f;
        values = values || [];
        let selectedValues = values
          .map((v) => {
            if (v.is_selected) {
              v.filterIndex = index;
              v.name = key.name;
              v.kind = key.kind;
              return v;
            }
          })
          .filter((v) => v);
        return [...a, ...selectedValues];
      }, []);
      return filterOptionsArray;
    },
    getFilterDisplay: function getFilterDisplay(filters, filterObj) {
      let filter = filters[filterObj.filterIndex];
      if (filter.key.kind === "range") {
        if (filterObj.currency_code) {
          return (
            this.$options.filters.currencyformat(filterObj.selected_min) +
            " - " +
            this.$options.filters.currencyformat(filterObj.selected_max)
          );
        } else {
          return filterObj.selected_min + "% - " + filterObj.selected_max + "%";
        }
      }
      return filterObj.display.toUpperCase();
    },

    closeModal: function closeModal(event, type) {
      if (type === "sort") {
        this.showSortByModal = false;
      } else if (type === "filter") {
        this.showFilterModal = false;
      }
    },
    redirectToPage: function (url) {
      this.$router.push(url);
    },

    toggleDropdown(filter) {
      if (!filter.isOpen) {
        let ref = this.$refs["fltDropdown" + filter.key.name];
        let refCont = this.$refs["fltDropdown-cont" + filter.key.name];
        refCont[0].style.maxHeight = ref[0].clientHeight + "px";
      }
      filter.isOpen = !filter.isOpen;
    },
    getMaxValue: function getMaxValue(filterItem) {
      return filterItem.selected_max ? filterItem.selected_max : filterItem.max;
    },
    getMinValue: function getMinValue(filterItem) {
      return filterItem.selected_min ? filterItem.selected_min : filterItem.min;
    },
    updateFilters(filter, filterItem, idx, updateSelectedItem, updateFilter) {
      if (!this.showMobileFilters) {
        this.$router.push(filterItem.url);
        return;
      }
      updateSelectedItem(filter, idx);
      updateFilter(filterItem, idx);
    },
  },
  computed: {
    getSortOnValue() {
      let val = "";
      let item = [];
      if (this.context && this.context.sort_on) {
        item = this.context.sort_on.filter((item) => item.is_selected);
      }
      return item.length > 0 ? item[0].display : "Popular";
    },
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
    isMobile() {
      return detectMobileWidth();
    },
    hrefTarget() {
      return detectMobileWidth() ? "_self" : "_blank";
    },
    listingPriceConfig() {
      return this.context.app_features?.feature?.common?.listing_price?.value;
    },
  },
  watch: {
    context: function (newValue) {
      this.context = newValue;
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
  },
};
</script>

<style lang="less" scoped>
.showShare {
  display: none;
  @media @mobile {
    display: flex;
  }
}
/deep/.mobile-header {
  z-index: 1;
}
.slider-position {
  margin-top: 15px;
}
.main-container {
  margin-top: 5px;
}

/**
* Filter styles
*/

.refinements {
  display: -ms-flexbox;
  display: flex;
  align-items: flex-start;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  overflow: hidden;
  width: calc(100%-200px);
}
.align-share {
  display: flex;
  align-items: center;
  .share-button {
    cursor: pointer;
    position: relative;
    padding-left: 15px;
  }
}

@media (min-width: 0) and (max-width: 991.98px) {
  .refinements {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    width: auto;
  }
}

@media (min-width: 992px) {
  .refinements {
    max-width: 100%;
  }
}

.refinements-holder {
  background: #f9f9f9;
  max-width: 100%;
  padding: 0;
  width: 100%;
  z-index: 100;
  display: none;
  @media @mobile {
    display: block;
  }
}

@media (min-width: 992px) {
  .refinements-holder {
    z-index: 1;
  }
}

.refinements-holder.js_refinement-sticky-ie {
  position: fixed;
  top: 0;
}

.refinements-holder.sticky-filter {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
}

.refinement-bar {
  width: calc(100% - 57px);
  top: 0;
  height: 100%;
  left: -100%;
  padding: 0;
  position: fixed;
  transition: left 0.5s ease;
  background-color: #f9f9f9;
  margin: 0 auto;
  z-index: 100;
  overflow-y: scroll;
}

@media (min-width: 992px) {
  .refinement-bar {
    overflow: hidden;
    position: relative;
    left: 0;
    height: auto;
    padding: 10px 0;
    padding: 0.625rem 0;
    width: 1200px;
  }
}

.refinement-bar.show-refinement-bar {
  left: 0;
}

.refinement-bar .close {
  background-color: #f9f9f9;
  float: right;
  height: 24px;
  height: 1.5rem;
  width: 24px;
  width: 1.5rem;
}

.refinement-bar .mobile-filter-header,
.refinement-bar .mobile-sort-header {
  background-color: #f9f9f9;
  margin: 0;
  padding: 20px;
  padding: 1.25rem;
  top: 0;
}

.refinement-bar .mobile-filter-header-bar,
.refinement-bar .mobile-sort-header-bar {
  background-color: #f9f9f9;
  border: 0;
  font-family: Roboto, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0;
  text-transform: uppercase;
  height: 22px;
  height: 1.375rem;
  line-height: 22px;
  line-height: 1.375rem;
}

.refinement-bar .mobile-header-title {
  float: left;
}

.refinement-constraint {
  margin: auto;
}

@media (min-width: 992px) {
  .refinement-constraint {
    padding: 0 14px;
    padding: 0 0.875rem;
    height: calc(100% - 137px);
  }
}

.refinements-container {
  margin: 0;
}

@media (min-width: 992px) {
  .refinements-container {
    overflow: hidden;
    height: calc(100% - 30px);
  }
}

.refinements-container .filter-header {
  float: left;
  font-size: 0.75rem;
  line-height: normal;
  text-transform: uppercase;
  margin: 9px 0 0;
  margin: 0.5625rem 0 0;
  padding: 10px 30px 10px 0;
  padding: 0.625rem 1.875rem 0.625rem 0;
}

.refinements-container .filter-toggle {
  cursor: pointer;
  position: absolute;
  font-size: 0.75rem;
  line-height: normal;
  text-align: right;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
  top: 29px;
  top: 1.8125rem;
  right: 15px;
  width: 105px;
}

.refinements-container .more-filters,
.refinements-container .less-filters {
  border-bottom-color: #000;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-width: 0.0625rem;
}

.mobile-refinement-bar {
  display: none;
  @media @mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f9f9f9;
    padding: 14px;
    padding: 0.875rem;
    z-index: 2;
  }
}

.mobile-refinement-bar .filter-sort-button-holder {
  background-color: #fff;
  display: inline-block;
  position: relative;
  -ms-flex: 1;
  flex: 1;
  margin-right: 14px;
  margin-right: 0.875rem;
}

.mobile-refinement-bar .filter-results {
  background-color: #fff;
  color: #000;
  cursor: pointer;
  height: 100%;
  font-family: roboto condensed, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 1px;
  letter-spacing: 0.0625rem;
  padding: 10px;
  padding: 0.625rem;
}

.mobile-refinement-bar .filter-results::after {
  content: "+";
  position: absolute;
  right: 10px;
  right: 0.625rem;
}

.refinement.card {
  border: 0;
  padding: 0;
  transition: max-height 0.5s;
  background-color: #fff;
  width: 100%;
  margin: 5px 0;
  margin: 0.3125rem 0;
}

@media (min-width: 992px) {
  .refinement.card {
    width: calc((100% / 6) - 20px);
    margin: 5px 10px;
    margin: 0.3125rem 0.625rem;
    max-height: 45px;
    max-height: 2.8125rem;
    max-width: 156px;
    max-width: 9.75rem;
    &.hidden-filter {
      display: none;
    }
  }
}

@media (min-width: 992px) {
  .refinement.card.select-open {
    max-height: none;
  }
}

.refinement.card.select-open .card-header {
  animation-name: change-bg-in-refinement-mobile;
}

@media (min-width: 992px) {
  .refinement.card.select-open .card-header {
    animation-name: none;
    background-color: #fff;
  }
}

@media (min-width: 992px) {
  .refinement.card:not(.select-open) {
    max-height: 45px;
    max-height: 2.8125rem;
  }
}

.refinement.card:not(.select-open) .card-body {
  max-height: 0 !important;
}

.refinement.card:not(.select-open) .card-header {
  animation-name: change-bg-out-refinement-mobile;
}

@media (min-width: 992px) {
  .refinement.card:not(.select-open) .card-header {
    animation-name: none;
    background-color: #fff;
  }
}

.refinement.card .card-body {
  overflow-x: hidden;
  overflow-y: hidden;
  padding: 0;
  transition: max-height 0.5s;
}

@media (min-width: 992px) {
  .refinement.card .card-body {
    max-height: none !important;
    position: relative;
  }
}

.refinement.card .card-body .values {
  padding: 0;
  &:not(:last-child) {
    margin: 0 0 10px 0;
  }
}

@media (min-width: 992px) {
  .refinement.card .card-body .values {
    display: flex;
    flex-direction: column;
    max-height: 300px;
    margin: 20px 0 10px 0;
    width: 9.66667%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0px 20px 0 0;
    box-sizing: border-box;
  }
}
@media (min-width: 0px) and (max-width: 991.98px) {
  .refinement.card .card-body .values {
    max-height: unset;
  }
}

.refinement.card .card-body .values-bigger-max-height {
  max-height: 700px;
  max-height: 43.75rem;
}

.refinement.card .card-body .value {
  background: #fff;
  display: block;
  width: inherit;
  padding: 0 20px;
  padding: 0 1.25rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@media (min-width: 992px) {
  .refinement.card .card-body .value {
    padding: 10px 15px;
    padding: 0.625rem 0.9375rem;
  }
  // .refinement.card .card-body .value:last-of-type::after {
  //     background: #fff;
  //     content: '';
  //     height: 1000%;
  //     left: 0;
  //     position: absolute;
  //     width: 100%;
  //     top: 54px;
  //     top: 3.375rem
  // }
}

.refinement.card .card-body .value.disabled {
  opacity: 1;
}

.refinement.card .card-header {
  border: none;
  font-weight: 400;
  margin: 0;
  font-family: Roboto, sans-serif;
  font-size: 0.875rem;
  white-space: nowrap;
  animation-direction: normal;
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-iteration-count: 1;
  background-color: #f9f9f9;
  display: -ms-flexbox;
  display: flex;
  cursor: pointer;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: 10px 20px;
  padding: 0.625rem 1.25rem;
  line-height: 20px;
  line-height: 1.25rem;
}

@media (min-width: 992px) {
  .refinement.card .card-header {
    background-color: #fff;
    padding: 10px 15px;
    padding: 0.625rem 0.9375rem;
  }
}

.refinement.card .refinement-link:hover {
  text-decoration: none;
}

.selection-box {
  color: #000;
  position: relative;
  font-size: 0.75rem;
  line-height: 35px;
  line-height: 2.1875rem;
  padding-left: 23px;
  padding-left: 1.4375rem;
}

@media (min-width: 992px) {
  .selection-box {
    font-size: 0.875rem;
  }
}

.selection-box::before {
  content: "";
  left: 0;
  position: absolute;
  top: -1px;
  height: 14px;
  height: 0.875rem;
  width: 14px;
  width: 0.875rem;
}

.selection-box.selected-box::before {
  background-color: @ds-black;
}

.selection-box.not-selected-box::before {
  border-color: @ds-black;
  border-style: solid;
  border-width: 1px;
  border-width: 0.0625rem;
}

.refinement.card .total-selected[data-selected="0"] {
  display: none;
}

// .refinement.card .total-selected::after {
//     content: " : " attr(data-selected)
// }

.select-arrow {
  transition-duration: 0.7s;
}

.select-open .select-arrow {
  transform: rotate(180deg);
}

.icon-arrow-mid-down-black {
  content: "";
  display: inline-block;
  background-image: url(../../assets/images/sprite-icons.svg);
  background-position: -586px -2px;
  background-repeat: no-repeat;
  width: 24px;
  width: 1.5rem;
  height: 24px;
  height: 1.5rem;
  text-indent: -9999px;
  text-indent: -624.9375rem;
}

.clear-apply-wrapper {
  background: #fff;
  border-top-color: #cacaca;
  border-top-style: solid;
  bottom: 0;
  position: -webkit-sticky;
  position: sticky;
  z-index: 10;
  width: 100%;
  display: -ms-flexbox;
  display: flex;
  box-sizing: border-box;
  border-top-width: 1px;
  border-top-width: 0.0625rem;
  padding: 31px 10px;
  padding: 1.9375rem 0.625rem;
}

.clear-apply-wrapper .button-container {
  -ms-flex: 1;
  flex: 1;
  margin: 0 10px;
  margin: 0 0.625rem;
}

.clear-apply-wrapper button {
  font-size: 0.875rem;
  height: 44px;
  height: 2.75rem;
  width: 100%;
}

.filter-bar {
  display: none;
}

.filter-bar .visibility-hidden {
  visibility: hidden;
}

@media (min-width: 992px) {
  .filter-bar {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: baseline;
    align-items: baseline;
    padding: 12px 0;
    padding: 0.75rem 0;
  }
}

.filter-clearall-container {
  display: -ms-flexbox;
  display: flex;
  justify-content: flex-start;
  -ms-flex-align: center;
  align-items: center;
  text-transform: uppercase;
  padding: 10px 30px 10px 10px;
}

.filter-clearall-secondary {
  padding: 0 5px;
  padding: 0 0.3125rem;
}

.filter-clearall-secondary .reset {
  font-size: 0.75rem;
  text-decoration: underline;
  text-underline-position: under;
}

.filters-close-main-container {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
}

.filter-value {
  list-style-type: none;
  display: inline-block;
  font-size: 0.75rem;
  margin-right: 40px;
  margin-right: 2.5rem;
}

.filter-close-container {
  text-transform: uppercase;
}

.icon-close-black {
  content: "";
  display: inline-block;
  background-image: url(../../assets/images/sprite-icons.svg);
  background-position: -959px -2px;
  background-repeat: no-repeat;
  width: 21px;
  height: 21px;
  text-indent: -9999px;
}
.filter-close-container .icon-close-black-filter {
  display: inline-block;
  vertical-align: middle;
}

.sort-order {
  font-size: 0.75rem;
  text-transform: uppercase;
  cursor: pointer;
}

@media (min-width: 992px) {
  .sort-order {
    width: 150px;
    width: 9.375rem;
  }
}

.sort-order .sort-label {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -ms-flex-align: center;
  align-items: center;
  background-color: #fff;
  width: 100%;
  padding: 4px 0;
  padding: 0.25rem 0;
}

.sort-order-mobile {
  -ms-flex: 1;
  flex: 1;
  width: calc(50% - 14px);
}

.sort-order-mobile .sort-label {
  padding: 4px 0 5px;
  padding: 0.25rem 0 0.3125rem;
}

.sort-order-mobile .sort-selected-option {
  font-weight: 700;
  padding-left: 14px;
  padding-left: 0.875rem;
}

.sort-order-mobile .sort-options {
  margin-left: calc(-100% - 14px);
  padding-left: 14px;
  padding-left: 0.875rem;
}

.sort-order-mobile.select-open .sort-options {
  margin-top: 14px;
  margin-top: 0.875rem;
}

.search-result-options {
  display: none;
}

@media (min-width: 992px) {
  .search-result-options {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: justify;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 20px 0 0 0;
  }
}

.showing-results {
  font-size: 14px;
  p {
    margin-bottom: 10px;
  }
}

.mobile-filter-sort-bar {
  display: none;
}

@media (min-width: 992px) {
  .mobile-filter-sort-bar {
    display: none;
  }
}

@media (min-width: 0) and (max-width: 991.98px) {
  .sort-list {
    display: none;
  }
  .mobile-filter-sort-bar {
    display: block;
  }
}

.main-actions-container {
  padding: 0 20px;
  // width: 100%;
  // max-width: 1200px;
  // margin: 0 auto;
}

.main-product-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  .product-link-wrap {
    height: 100%;
  }
  .product-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15%, 1fr));
    grid-auto-rows: auto;
    grid-template-rows: 1fr;
    grid-gap: 3em;
    padding-top: 0;
  }
  .loader-center {
    grid-column-start: -1;
    grid-column-end: 1;
    text-align: center;
    margin: 20px 0;
  }
  @media screen and (max-width: 768px) {
    .product-container {
      grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
      grid-gap: 0.5em;
      padding: 0.5em;
      & > div {
        margin-bottom: 25px;
      }
    }
  }
}

.bg-white {
  background: #fff;
}

.range-box {
  display: flex;
  justify-content: center;
}
.options-open {
  margin-top: 60px;
}
.active {
  font-size: 16px;
  font-weight: bold !important;
  color: @ds-black;
}

@media screen and (max-width: 768px) {
  .main-container {
    margin-top: 10px;
    .breadcrumbs-container {
      padding-left: 20px;
      .breadcrumb-list {
        width: 100%;
        font-size: 12px;
      }
      .page-title {
        width: 100%;
        font-size: 1.5em;
        margin-top: 0;
        display: flex;
        justify-content: center;
      }
    }
    .main-actions-container {
      display: none;
    }
  }
}
.rotate {
  transform: rotate(180deg);
}

.slider-container {
  padding: 10px;
  box-sizing: border-box;
  .slider-range-info {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
  }
}
.sort-options-mobile {
  background: #fff;
  .radio-button-sort {
    padding: 0 1.25rem;
  }
}

.sort-open {
  width: 200px;

  border: 1px solid #ccc;
  .sort-label {
    padding: 10px;
    box-sizing: border-box;
  }
  position: relative;
  .sort-list-items {
    position: absolute;
    z-index: 2;
    width: 100%;
    background: white;
    border: 1px solid #ccc;
    top: 45px;
    left: -1px;
    border-top: none;
    .sort-option {
      padding: 15px 10px;
      &:not(:last-child) {
        border-bottom: 1px solid #ccc;
      }
    }
  }
}
.products-cont {
  display: flex;
  @media @mobile {
    flex-direction: column;
  }
  .left {
    display: initial;
    border-right: 1px solid @border-color;
    width: 300px;
    @media @mobile {
      display: none;
    }
    .open {
      display: none;
    }
    .filter-list {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 262px;
      background: white;
      padding: 5px 10px;
      min-height: auto;
    }

    .filter-item-value {
      text-transform: capitalize;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 75%;
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
    .filter-arrow-up {
      transform: rotate(180deg);
    }

    .filter-item {
      display: flex;
      flex-direction: row;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0px 8px;
      align-items: center;
      min-height: 1.8rem;
      cursor: pointer;
      color: #41434c;
    }

    .filter-search input {
      border: none;
      background: #f5f5f5;
      outline: 0;
      padding: 7px 0 7px 5px;
      border-radius: 5px 0 0 5px;
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
      border-radius: 5px;
      cursor: pointer;
    }

    .filter-item-count {
      margin-left: auto;
    }
    .view-more {
      font-size: 14px;
      display: flex;
      justify-content: center;
      margin-top: 5%;
      color: @ds-black;
      cursor: pointer;
    }
  }
  .right {
    width: calc(100% - 300px);
    @media @mobile {
      width: 100%;
    }
    .mobile-items-found {
      display: none;
      p {
        margin-bottom: 10px;
      }
      @media @mobile {
        display: block;
        padding: 0 20px;
        font-size: 14px;
        padding-top: 20px;
      }
    }
    .active-filters-container {
      font-size: 13px;

      display: flex;
      flex-wrap: wrap;
      padding: 0px 0 10px 0;
      margin: 0 15px 10px 16px;
      border-bottom: 1px solid #e4e5e6;
      @media @mobile {
        margin: 0;
      }
      .selected-item {
        transition: all 0.1s ease-in;
        height: 1.5em;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e4e5e6;
        padding: 5px;
        margin: 0 3px 3px 0;
        display: flex;
        align-items: center;
        color: #41434c;
        cursor: pointer;
        &:hover {
          background: @ds-black;
          color: white;
          .close-chip-icon {
            background-image: url("../../assets/images/cross-black.svg");
          }
        }
        .close-chip-icon {
          background-image: url("../../assets/images/cross-black.svg");
          width: 7px;
          height: 7px;
          display: inline-block;
          background-size: cover;
        }
      }
      .reset-btn {
        padding: 5px;
        display: flex;
        align-items: center;
        color: @ds-black;
        cursor: pointer;
      }
    }
    .product-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
      grid-auto-rows: auto;
      grid-gap: 1em;
      @media @mobile {
        grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
        grid-gap: 0.5em;
      }
    }
  }
}
</style>

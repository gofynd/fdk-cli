<template>
  <div class="main-container">
    <empty-state
      v-if="!context.loading && (!context.items || !context.items.length)"
      :title="`${context.productMeta.data[0].name} has not products.`"
    />
    <div v-else-if="context && context.items && context.items.length > 0">
      <div class="bg-white products-cont">
        <div class="mobile-refinement-bar sticky-div">
          <div
            class="filter-sort-button-holder"
            @click.stop="showMobileFilters = true"
          >
            <div class="filter-results " tabindex="0">
              <span class="filter-sort-button-name">Filter-Sort By</span>
            </div>
          </div>
          <fdk-share>
            <template slot-scope="share">
              <div @click="getShareLink(share)" class="share-button">
                <img src="./../../assets/images/share.svg" />
              </div>
            </template>
          </fdk-share>
        </div>
        <div class="container refinements-holder " ref="refinementsHolder">
          <fdk-filter-modal>
            <template slot-scope="filterModalData">
              <div
                class="refinement-bar  d-block col-md-12"
                :class="{ 'show-refinement-bar': showMobileFilters }"
              >
                <div class="mobile-filter-sort-bar">
                  <div class="mobile-sort-header sticky-div">
                    <div class="mobile-sort-header-bar clearfix">
                      <div class="pull-left mobile-header-title">
                        <span>Sort By</span>
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
                  <form>
                    <div class="sort-options-mobile" aria-hidden="true">
                      <span role="group" aria-label="Sort by">
                        <div
                          class="radio-button-sort"
                          v-for="(sortitem, index) in context.sort_on"
                          :key="index + '-sort'"
                          @click="
                            selectedSort = sortitem;
                            showMobileFilters = false;
                            filterModalData.closeModal();
                          "
                        >
                          <fdk-link
                            :link="sortitem.url"
                            class="filterValue sort-item"
                          >
                            <input
                              class="sort-radio sort-option new-arrivals"
                              type="radio"
                              id="sortitem.value"
                              name="sort-by"
                              value="sortitem.value"
                              :checked="sortitem.value === selectedSort.value"
                              tabindex="-1"
                            />
                            <label
                              for="sortitem.value"
                              class="sort-radio-label"
                            >
                              {{ sortitem.display }}</label
                            >
                          </fdk-link>
                        </div>
                        <hr />
                      </span>
                    </div>
                  </form>
                </div>
                <div class="refinement-constraint ">
                  <div class="mobile-filter-header d-lg-none">
                    <div class="mobile-filter-header-bar clearfix">
                      <div class="pull-left mobile-header-title">
                        <span>Filter By</span>
                      </div>
                    </div>
                  </div>
                  <div
                    class="refinements-container "
                    :class="{ 'display-mobile-none': !showMobileFilters }"
                  >
                    <div class="filter-header d-none d-lg-block">
                      <span>Filter By</span>
                    </div>
                    <div class="refinements ">
                      <div
                        class="card js_collapsible js_refinement refinement collapsed refinement-fit"
                        v-for="(filter, idx) in showMobileFilters
                          ? filterModalData.filters
                          : getFilters"
                        :key="idx"
                        :class="{
                          'select-open': filter.isOpen,
                          'hidden-filter': idx > 5 && showMoreFilters == false,
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
                                class="js_total-selected total-selected d-lg-none"
                              ></span>
                            </span>
                            <span
                              class="select-arrow icon-arrow-mid-down-black js_select-arrow"
                            ></span>
                          </h2>
                          <div
                            class="js_card-body card-body"
                            :ref="'fltDropdown-cont' + filter.key.name"
                            v-if="filter.values.length > 0"
                          >
                            <ul
                              class="values"
                              style="width:140px"
                              :ref="'fltDropdown' + filter.key.name"
                            >
                              <li
                                :title="
                                  `Refine by ${filter.key.display}: ${filterItem.display}`
                                "
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
                                class="js_total-selected total-selected d-lg-none"
                              ></span>
                            </span>
                            <span
                              class="select-arrow icon-arrow-mid-down-black js_select-arrow"
                            ></span>
                          </h2>
                          <div
                            class="js_card-body card-body"
                            :ref="'fltDropdown-cont' + filter.key.name"
                          >
                            <fdk-slider
                              class="value"
                              :class="{
                                svalue: showMobileFilters,
                                dvalue: !showMobileFilters,
                              }"
                            >
                              <template slot-scope="sliderData">
                                <div
                                  class="slider-container"
                                  :ref="'fltDropdown' + filter.key.name"
                                >
                                  <slider-filter
                                    class="slider-position"
                                    :show-slider-text="false"
                                    :options="options"
                                    :filteritem="filter"
                                    :show-text-box="false"
                                    @slider-query="
                                      updateSliderFilters(
                                        $event,
                                        filter,
                                        idx,
                                        sliderData,
                                        filterModalData
                                      );
                                      sliderData.replaceQuery($event, filter);
                                    "
                                  ></slider-filter>
                                  <div class="slider-range-info">
                                    <div>
                                      <span
                                        v-if="filter.values[0].currency_code"
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
                                    <div style="opacity: 0.7;	color: #1D1D1D;">
                                      to
                                    </div>
                                    <div>
                                      <span
                                        v-if="filter.values[0].currency_code"
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
                    <div
                      class="filter-toggle d-lg-block px-0"
                      v-if="filterModalData.filters.length > 6"
                    >
                      <span
                        class="more-filters "
                        tabindex="0"
                        @click="showMoreFilters = true"
                        v-if="!showMoreFilters"
                      >
                        More Filters
                      </span>
                      <span
                        class="less-filters "
                        tabindex="0"
                        @click="showMoreFilters = false"
                        v-if="showMoreFilters"
                      >
                        Less Filters
                      </span>
                    </div>
                  </div>
                  <div class="clear"></div>
                  <div
                    class="clear-apply-wrapper d-lg-none "
                    :class="{ 'display-none': !showMobileFilters }"
                  >
                    <div class="button-container">
                      <button
                        class="secondary-btn clear js_clear-filters"
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
                        class="primary-btn apply-filters js_apply-filters"
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
                  <div
                    class="filter-bar row"
                    v-if="
                      showMobileFilters
                        ? selectedOptions(filterModalData).length > 0
                        : selectedOptions(context).length > 0
                    "
                  >
                    <div class="filter-clearall-container">
                      <div
                        class="filter-clearall-secondary col-12"
                        data-filterlenght="4"
                      >
                        <a
                          class="reset"
                          @click="
                            filterModalData.resetFilters();
                            filterModalData.applyFilters();
                          "
                          >Clear all</a
                        >
                      </div>
                    </div>
                    <ul
                      class="filters-close-main-container"
                      v-if="
                        showMobileFilters
                          ? selectedOptions(filterModalData).length > 0
                          : selectedOptions(context).length > 0
                      "
                    >
                      <li
                        class="filter-value"
                        v-for="(item, index) in showMobileFilters
                          ? selectedOptions(filterModalData)
                          : selectedOptions(context)"
                        :key="index + '-modal'"
                      >
                        <div
                          class="filter-close-container"
                          @click="
                            updateActiveFilters(
                              item,
                              item.filterIndex,
                              filterModalData.updateFilter
                            )
                          "
                          v-if="!showMobileFilters"
                        >
                          <div
                            class="icon-close-black icon-close-black-filter"
                          ></div>
                          {{ getFilterDisplay(context.filters, item) }}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div
                class="cls-modal-bg"
                :class="{ 'display-block': showMobileFilters }"
                @click="hideMobileFilter(filterModalData.closeModal)"
              ></div>
            </template>
          </fdk-filter-modal>
        </div>
        <div class="main-actions-container">
          <div class="search-result-options">
            <div class="showing-results">
              Showing: {{ context.product_count }} Products
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
                      {{ selectedSort.display }}
                    </span>
                    <span class="select-arrow icon-arrow-mid-down-black"></span>
                  </div>
                  <ul class="sort-list-items" v-if="showSortOn">
                    <li
                      class="sort-option sort-selected"
                      v-for="(item, idx) in context.sort_on"
                      :key="idx"
                      @click="selectedSort = item"
                      tabindex="-1"
                    >
                      <fdk-link :link="item.url"> {{ item.display }} </fdk-link>
                    </li>
                  </ul>
                </div>
              </div>
              <fdk-share>
                <template slot-scope="share">
                  <div @click="getShareLink(share)" class="share-button">
                    <img src="./../../assets/images/share.svg" />
                  </div>
                </template>
              </fdk-share>
            </div>
          </div>
        </div>
        <div class="mobile-items-found">
          <div class="product-count light-text">
            {{ context.product_count }} items Found
          </div>
        </div>
        <div class="main-product-container">
          <fdk-infinite-loading>
            <template slot-scope="infiniteLoaderData">
              <div class="product-container">
                <div
                  v-for="(product, index) in context.items"
                  :key="index + '-product.uid'"
                >
                  <div @click="redirectToProduct(product.url)">
                    <product-card
                      :product="product"
                      :context="context"
                    ></product-card>
                  </div>
                </div>
                <!-- <loader
                  id="loader"
                  class="loader-center"
                  v-if="infiniteLoaderData.hasNext"
                ></loader> -->
              </div>
            </template>
          </fdk-infinite-loading>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import productcard from './../../global/components/product-card.vue';
import sliderfilter from './../../global/components/slider-filter.vue';
import loader from './../components/loader';
import emptystate from './../components/empty-state';
import { detectMobileWidth, copyToClipboard } from './../../helper/utils';
export default {
  components: {
    'product-card': productcard,
    'empty-state': emptystate,
    'slider-filter': sliderfilter,
    loader,
  },
  data() {
    return {
      url: window.location.href,
      showFilters: false,
      showSortOn: false,
      breadcrumbs: [],
      selectedSort: { value: 'popular', display: 'Popularity' },
      activeFilters: [],
      filteredItems: [],
      options: {
        dotSize: 15,
        processStyle: {
          backgroundColor: '#000',
          borderColor: '#000',
          height: '5px',
        },
        railStyle: {
          backgroundColor: '#ECECEC',
          borderColor: '#ECECEC',
          height: '4px',
        },
        tooltip: 'none',
        dotStyle: { backgroundColor: '#000', borderColor: '#000' },
      },
      showSortByModal: false,
      showFilterByModal: false,
      activeFiltersSet: false,
      resetSlider: false,
      showMoreFilters: false,
      firstRun: true,
      showMobileFilters: false,
    };
  },
  mounted() {
    let value = 0;
    if (!detectMobileWidth()) {
      window.addEventListener('scroll', () => {
        {
          let filBox = this.$refs['refinementsHolder'];
          if (filBox) {
            let YOffset = filBox.offsetTop;
            value = YOffset === 0 ? value : YOffset;
            if (window.pageYOffset >= value) {
              filBox.classList.add('sticky-filter');
            } else {
              filBox.classList.remove('sticky-filter');
            }
          }
        }
      });
    }
    if (!this.context.loading) {
      this.activeFiltersSet = true;
    }
  },
  created() {},

  destroyed() {
    window.removeEventListener('scroll', () => {
      {
        let fltBox = this.$refs.refinementsHolder;
        let YOffset = fltBox.offsetTop;
        value = YOffset === 0 ? value : YOffset;
        if (window.pageYOffset >= value) {
          fltBox.classList.add('sticky-filter');
        } else {
          fltBox.classList.remove('sticky-filter');
        }
      }
    });
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
    updateActiveFilters(item, filterIndex, updateFilter) {
      console.log(this.showMobileFilters);
      if (!this.showMobileFilters) {
        if (item.url) {
          this.$router.push(item.url);
        } else {
          this.resetSlider = !this.resetSlider;
          this.getRangeURL(item);
        }
        return;
      }
      console.log(updateFilter);
      updateFilter(item, filterIndex);
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
      console.log(this.showMobileFilters);
      filterModalData.updateSelectedItem(filter, idx);
      filterModalData.updateSliderInfo(query, filter);
    },
    getBreadCrumbs() {
      let arr = [];
      arr.push({
        display: 'Home',
        link: '/',
      });
      arr.push({
        display: 'Products',
        link: '/products/',
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
      if (filter.key.kind === 'range') {
        if (filterObj.currency_code) {
          return (
            '₹ ' + filterObj.selected_min + ' - ₹ ' + filterObj.selected_max
          );
        } else {
          return filterObj.selected_min + '% - ' + filterObj.selected_max + '%';
        }
      }
      return filterObj.display.toUpperCase();
    },

    closeModal: function closeModal(event, type) {
      if (type === 'sort') {
        this.showSortByModal = false;
      } else if (type === 'filter') {
        this.showFilterModal = false;
      }
    },
    redirectToProduct: function redirectToProduct(productUrl) {
      this.$router.push(productUrl);
    },

    toggleDropdown(filter) {
      if (!filter.isOpen) {
        let ref = this.$refs['fltDropdown' + filter.key.name];
        let refCont = this.$refs['fltDropdown-cont' + filter.key.name];
        console.log(ref, refCont);
        refCont[0].style.maxHeight = ref[0].clientHeight + 'px';
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
    getFilters: function getFilters() {
      let oldFilters = this.filteredItems;
      this.filteredItems = [];
      const data =
        this.context.filters &&
        this.context.filters.map((item, idx) => {
          // item.isOpen ? (item.isOpen = true) : (item.isOpen = false);
          // item.key.kind === "range" ? (item.isOpen = true) : "";
          if (item.key.kind == 'multivalued') {
            if (this.firstRun) {
              item.isOpen = false;
            } else {
              let findIt = oldFilters.filter((it, idx1) => {
                return it.key.name === item.key.name;
              });
              if (findIt.length > 0) {
                item.isOpen = findIt[0].isOpen;
              } else {
                item.isOpen = false;
              }
            }
          }
          this.filteredItems.push(item);
        });
      if (this.context.filters) {
        this.firstRun = false;
      }
      this.resetSlider = !this.resetSlider;
      return this.filteredItems;
    },
  },
  watch: {
    context: function(newValue) {
      this.context = newValue;
    },
  },
};
</script>

<style lang="less" scoped>
.slider-position {
  margin-top: 15px;
}
.main-container {
  margin-top: 5px;
  font-family: Roboto, sans-serif;
}

/**
* Filter styles
*/

.refinements {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: start;
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
  top: 0;
  height: 100%;
  left: -100%;
  padding: 0;
  position: fixed;
  transition: left 0.5s ease;
  background-color: #f9f9f9;
  margin: 0 auto;
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
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  z-index: 100;
  width: calc(100% - 57px);
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
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: start;
  align-items: center;
  -ms-flex-pack: justify;
  justify-content: space-between;
  background-color: #f9f9f9;
  padding: 14px;
  padding: 0.875rem;
}

@media (min-width: 992px) {
  .mobile-refinement-bar {
    display: none;
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
  content: '+';
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
  width: 100vw;
}

@media (min-width: 992px) {
  .refinement.card .card-body {
    max-height: none !important;
    position: relative;
  }
}

.refinement.card .card-body .values {
  padding: 0;
  margin: 0 0 10px 0;
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
  width: 100%;
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

.refinement.card .selection-box {
  color: #000;
  position: relative;
  font-size: 0.75rem;
  line-height: 35px;
  line-height: 2.1875rem;
  padding-left: 23px;
  padding-left: 1.4375rem;
}

@media (min-width: 992px) {
  .refinement.card .selection-box {
    font-size: 0.875rem;
  }
}

.refinement.card .selection-box::before {
  content: '';
  left: 0;
  position: absolute;
  top: 0;
  height: 14px;
  height: 0.875rem;
  width: 14px;
  width: 0.875rem;
}

.refinement.card .selection-box.selected-box::before {
  background-color: #000;
}

.refinement.card .selection-box.not-selected-box::before {
  border-color: #000;
  border-style: solid;
  border-width: 1px;
  border-width: 0.0625rem;
}

.refinement.card .total-selected[data-selected='0'] {
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
  content: '';
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
  -ms-flex-pack: start;
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
  -ms-flex-pack: start;
  justify-content: start;
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
  content: '';
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
  font-family: roboto condensed, sans-serif;
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
  font-size: 0.875rem;
  padding: 8px 0;
  padding: 0.5rem 0;
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
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.mobile-items-found {
  display: none;
}

.main-product-container {
  width: 100%;
  max-width: 1200px;
  min-width: 1200px;
  margin: 0 auto 100px auto;

  .product-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
    grid-auto-rows: auto;
    grid-gap: 3em;
    padding-top: 0;
  }
  .loader-center {
    grid-column-start: -1;
    grid-column-end: 1;
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

@media (min-width: 0px) and (max-width: 991.98px) {
  .main-product-container {
    min-width: auto;
  }
}

.bg-white {
  background: #fff;
}
.products-cont {
  display: flex;
  flex-direction: column;
  @media @mobile {
    margin-top: 50px;
  }
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
    .mobile-items-found {
      display: block;
      font-size: 14px;
      opacity: 0.5;

      padding-top: 1em;
      display: flex;
      justify-content: center;
    }
    .mobile-actions-container {
      text-transform: uppercase;
      position: fixed;
      bottom: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      height: 4em;
      background: black;
      color: white;
      .sort-container,
      .filter-container {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .seperator {
        background: white;
        margin: 3em 0;
        font-size: 6px;
      }
    }
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
    padding: 10px 15px;
    background: black;
    color: #fff;
    height: 2em;
    .modal-title {
      width: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: center;
    }
  }
  .modal-content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow: hidden;
    overflow-y: scroll;
    height: 90vh;
    .actions {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      position: fixed;
      bottom: 0;
      background: #f5f5f5;
      height: 70px;
      z-index: 5;
      font-weight: 500;
      letter-spacing: 0.65px;
      button {
        max-width: 300px;
        margin: 10px 10px;
        flex: 1;
      }
    }
    .sort-item {
      display: flex;
      align-items: center;
      padding: 0 2em;
      justify-content: space-between;
      height: 4em;
      text-transform: uppercase;
      border-bottom: 1px solid #e3e3e3;
    }
    .filter-modal-item {
      border-bottom: 1px solid #00000024;
      &:last-child {
        border-bottom: 0;
      }
    }
    .filter-title {
      display: flex;
      align-items: center;
      height: 40px;
      color: #000000;

      font-size: 16px;
      font-weight: bold;
      letter-spacing: 0.58px;
      justify-content: space-between;
      margin: 1em;

      .display {
        text-transform: uppercase;
      }
      .view-more {
        width: 50px;
        cursor: pointer;
      }
    }

    .filter-disp {
      margin-left: 10px;

      text-transform: uppercase;
      font-size: 14px;
      .filter-item {
        display: flex;
        height: 35px;
        font-size: 16px;
        letter-spacing: 0.55px;
        padding: 10px;

        .filter-item-value {
          margin-right: 10px;
        }
      }
    }
    .slider-container {
      padding: 15px;
      padding-top: 30px;
      .slider-range-info {
        font-size: 14px;
        font-weight: normal;
        display: flex;
        justify-content: center;
        margin-top: 10px;
        margin-bottom: 20px;
      }
      .slider-range-info > div {
        margin: 0 10px;
      }
    }
  }
  .active-filters-container {
    flex-wrap: wrap;
    padding: 1em;
    .selected-item {
      margin-bottom: 0.5em;
      border: 1px solid #979797;
      border-radius: 8px;
      height: 25px;
      &:hover {
        background: white;
        color: black;
        .close-icon {
          background-image: url('./../../assets/images/close.svg');
        }
      }
    }
  }
}
.slide-up-leave-active,
.slide-up-enter-active {
  transition: 0.5s;
}
.slide-up-enter {
  transform: translate(0, 100%);
}
.slide-up-leave-to {
  transform: translate(0, 100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.slide-enter,
.slide-leave-to {
  transform: scaleY(0);
}

.rotate {
  transform: rotate(180deg);
}
.svalue {
  width: calc(100% - 90px) !important;
}
.dvalue {
  width: 140px !important;
  padding: 0 !important;
}
.slider-container {
  padding: 10px;
  box-sizing: border-box;
  .slider-range-info {
    display: flex;
    justify-content: space-around;
    font-family: 'Roboto Condensed';
    margin-top: 10px;
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
    z-index: 1;
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
</style>

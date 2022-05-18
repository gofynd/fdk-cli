<template>
  <div class="section-main-container">
    <template>
      <fdk-infinite-scrolling @loadmore="loadMoreData()" :loadingData="loading">
        <template>
          <div class="card-container">
            <div class="top-items">
              <div class="title-block">
                <div
                  :style="
                    'color:' + global_config.props.text_heading_link_color
                  "
                  class="section-heading"
                  v-if="
                    (settings.props.title.value &&
                      settings.props.title.value.length > 0) ||
                      settings.props.cta_text.value
                  "
                >
                  {{ settings.props.title.value }}
                </div>
                <fdk-link
                  :link="'/brands/'"
                  class="link view-all-text"
                  v-if="brands.length > 0 && settings.props.cta_text.value"
                  :style="
                    'color:' + global_config.props.text_heading_link_color
                  "
                  >{{ settings.props.cta_text.value }}</fdk-link
                >
              </div>
              <div
                v-if="
                  settings.props.layout.value === 'grid' &&
                    (settings.props.brand_type.value === 'handpicked' ||
                      settings.props.brand_type.value !== 'handpicked')
                "
              >
                <group-list
                  :cardlist="brands"
                  :cardtype="'BRANDS'"
                  :itemcount="settings.props.items_per_row.value"
                  :show_only_logo="settings.props.view_options.value === 'logo'"
                  :global_config="global_config"
                ></group-list>
              </div>

              <div
                v-if="
                  settings.props.layout.value === 'horizontal' &&
                    (settings.props.brand_type.value === 'handpicked' ||
                      settings.props.brand_type.value !== 'handpicked')
                "
              >
                <div class="glide-cont" :class="'glide' + _uid" ref="glide">
                  <div data-glide-el="track" class="glide__track">
                    <div
                      class="glide__slides"
                      :class="{
                        'ssr-slides-box': !checkisBrowser() && !isMounted,
                      }"
                    >
                      <div
                        class="glide__slide "
                        v-for="(brand, index) in brands"
                        :key="index"
                        :class="{
                          'big-slide-item':
                            settings.props.items_per_row.value < 5,
                        }"
                        :data-count="settings.props.items_per_row.value"
                      >
                        <fdk-link
                          v-if="brand"
                          :link="`/products/?brand=${brand.slug}`"
                        >
                          <div
                            class="logo-card"
                            v-if="settings.props.view_options.value === 'logo'"
                          >
                            <section>
                              <emerge-image
                                v-if="brand && brand.logo"
                                :src="brand.logo.url"
                                :sources="[{ width: 200 }]"
                              />
                            </section>
                            <h3
                              :style="
                                `color: ${global_config.props.text_heading_link_color}`
                              "
                            >
                              {{ brand.name }}
                            </h3>
                          </div>
                          <div class="common-card" v-else>
                            <section>
                              <emerge-image
                                :src="getBrandImage(brand)"
                                class="imgClass"
                                :sources="[
                                  { breakpoint: { min: 768 }, width: 360 },
                                  { breakpoint: { min: 361 }, width: 197 },
                                  { breakpoint: { max: 360 }, width: 166 },
                                ]"
                                :alt="title"
                              />
                            </section>
                            <div class="logo-wrapper">
                              <div class="card-logo ">
                                <emerge-image
                                  :src="brand.logo.url"
                                  v-if="brand && brand.logo"
                                />
                              </div>
                              <div class="card-desc">
                                <h4
                                  :style="
                                    `color: ${global_config.props.text_heading_link_color}`
                                  "
                                >
                                  {{ brand.name }}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <!-- <p class="item__name">{{ brand.name }}</p> -->
                        </fdk-link>
                        <fdk-placeholder v-else type="collection-1" />
                      </div>
                    </div>
                  </div>
                  <div
                    class="glide__bullets"
                    data-glide-el="controls[nav]"
                    v-if="brands.length > settings.props.items_per_row.value"
                  >
                    <button
                      class="glide__bullet"
                      :data-glide-dir="'=' + entry"
                      v-show="
                        checkGlide(entry, settings.props.items_per_row.value)
                      "
                      v-for="(entry, index) in glidePaginate(
                        brands.length,
                        settings.props.items_per_row.value
                      )"
                      :key="entry"
                    ></button>
                  </div>
                  <div
                    class="arrows"
                    :class="{
                      'hide-slider-nav':
                        brands.length <= settings.props.items_per_row.value,
                    }"
                  >
                    <section>
                      <div
                        class="prev-btn btn-nav-brands"
                        ref="prevArrow"
                        @click="prevSlide"
                      >
                        <div class="icon icon-prev"></div>
                      </div>
                      <div
                        class="next-btn btn-nav-brands"
                        ref="nextArrow"
                        @click="nextSlide"
                      >
                        <div class="icon icon-next"></div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
              <div
                class="view-all-mobile"
                :style="'color:' + global_config.props.text_heading_link_color"
                :class="{
                  'view-all-horizontal':
                    settings.props.layout.value === 'horizontal',
                }"
              >
                <fdk-link
                  :link="'/brands/'"
                  class="view-all-text"
                  v-if="brands.length > 0 && settings.props.cta_text.value"
                  >{{ settings.props.cta_text.value }}</fdk-link
                >
              </div>
            </div>
          </div>
        </template>
        <!-- <fdk-empty-state
          v-else-if="brands.length === 0 && isMounted"
          :title="'No Brands Found'"
        ></fdk-empty-state> -->
        <fdk-loader v-if="isLoading" class="infi-loader" />
      </fdk-infinite-scrolling>
    </template>
    <template v-if="brands.length === 0 && isMounted">
      <placeholder-items
        :count="settings.props.items_per_row.value * 2"
        :items_per_row="settings.props.items_per_row.value"
        type="collection-1"
        text="Brand"
        :layout="settings.props.layout.value"
      />
    </template>
  </div>
</template>

<!-- #region  -->
<settings>
{
    "name": "brands_listing",
    "label": "Brands Listing",
    "props": [
        {
            "type": "text",
            "id": "title",
            "default": "",
            "label": "Title"
        },
        {
            "type": "header",
            "id": "header",
            "value": "Choose Brands to Show"
        },
        {
            "id": "view_options",
            "type": "select",
            "options": [
                {
                    "value": "logo",
                    "text": "Logo View"
                },
                {
                    "value": "fullview",
                    "text": "Logo and Banner View"
                }
            ],
            "default": "fullview",
            "label": "View Options",
            "info": "Brand card view options"
        },
        {
            "type": "radio",
            "id": "brand_type",
            "default": "all",
            "options": [
                {
                    "value": "all",
                    "text": "All"
                },
                {
                    "value": "department",
                    "text": "Department"
                },
                {
                    "value": "handpicked",
                    "text": "Handpicked"
                }
            ]
        },
        {
            "type": "department",
            "id": "department",
            "label": "Department",
            "info": "Select a department of brands",
            "note": "Department only applies if 'department' type is selected"
        },
        {
            "type": "range",
            "id": "items_per_row",
            "min": 3,
            "max": 5,
            "step": 1,
            "unit": "",
            "label": "Items per row",
            "default": 5,
            "info": "Maximum items allowed per row"
        },
        {
            "id": "layout",
            "type": "select",
            "options": [
                {
                    "value": "grid",
                    "text": "Grid View"
                },
                {
                    "value": "horizontal",
                    "text": "Horizontal View"
                }
            ],
            "default": "horizontal",
            "label": "Layout",
            "info": "Alignment of content"
        },
        {
            "type": "text",
            "id": "cta_text",
            "default": "View all",
            "label": "CTA Text"
        }
    ],
    "blocks": [
        {
            "type": "brand_item",
            "name": "Brand Item",
            "props": [
                {
                    "type": "brand",
                    "id": "brand",
                    "label": "Select Brand"
                }
            ]
        }
    ]
}
</settings>
<!-- #endregion -->
<script>
import placeholderImage from "./../assets/images/placeholder.png";
import { isBrowser, isNode } from "browser-or-node";
import groupList from "./../global/components/group-list.vue";
// import loader from "./../templates/components/loader";
import { detectMobileWidth, glidePaginate } from "../helper/utils";
import emergeImage from "./../global/components/common/emerge-image.vue";
import Glide from "@glidejs/glide";
import "../../node_modules/@glidejs/glide/dist/css/glide.core.min.css";
import "../../node_modules/@glidejs/glide/dist/css/glide.theme.min.css";
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";

export default {
  props: ["settings", "apiSDK", "serverProps", "global_config"],
  data() {
    return {
      brands: this.serverProps?.brands || [],
      isLoading: false,
      brandsLoaded: this.serverProps?.brandsLoaded || 0,
      isMounted: false,
      page: this.serverProps?.page || { current: 0, has_next: true },
      glideOptions: {
        type: "slider",
        startAt: 0,
        gap: 30,
        perView: this.settings.props.items_per_row.value,
        breakpoints: {
          1024: {
            perView: 3,
          },
          600: {
            perView: 2,
          },
          480: {
            perView: 2,
          },
        },
      },
      carouselHandle: null,
    };
  },
  components: {
    "group-list": groupList,
    "emerge-image": emergeImage,
    "placeholder-items": placeholderItemsVue,
  },
  watch: {
    settings: function(newVal, oldVal) {
      if (
        newVal.props.brand_type.value !== oldVal.props.brand_type.value ||
        newVal.props.department.value !== oldVal.props.department.value ||
        this.isBlocksChanged(newVal.blocks, oldVal.blocks)
      ) {
        this.brands = [];
        this.brandsLoaded = 0;
        this.page = { current: 0, has_next: true };
      }
      this.cleanupComponent();
      this.initializeComponent();
    },
  },
  methods: {
    checkGlide(a, b) {
      if (a && b) {
        return parseInt(a) % b === 0 ? true : false;
      }
    },
    checkisBrowser() {
      return isBrowser;
    },
    glidePaginate,
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
    getBrandImage(brand) {
      if (this.settings.props.brand_type.value !== "handpicked") {
        return brand.banners.portrait.url;
      }
      return brand?.banners?.portrait?.url;
    },
    loadMoreData() {
      let options = {
        department: "",
        image_size: "large",
        pageNo: this.page.current + 1,
      };
      if (this.settings.props.brand_type.value === "department") {
        options.department = this.settings.props.department.value;
      }
      if (
        this.settings.props.layout.value === "grid" &&
        this.settings.props.brand_type.value !== "handpicked"
      ) {
        !this.isLoading && this.fetchBrands(options);
      }
    },
    fetchBrands(options) {
      if (this.settings.props.brand_type.value !== "handpicked") {
        if (this.page && this.page.has_next) {
          this.isLoading = true;
          this.$apiSDK.catalog
            .getBrands(options)
            .then((data) => {
              this.brands = [...this.brands, ...data.items];
              this.page = data.page;
              this.isMounted = true;
              this.isLoading = false;
              this.initCarousel();
            })
            .catch((ex) => {
              this.isLoading = false;
            });
        }
      } else {
        this.isLoading = true;
        let brandPromises = [];
        this.settings.blocks.forEach((block) => {
          if (block.props.brand.value.id) {
            brandPromises.push(
              this.$apiSDK.catalog
                .getBrandDetailBySlug({
                  slug: block.props.brand.value.id,
                })
                .then((data) => {
                  return data;
                })
            );
          }
        });
        Promise.all(brandPromises)
          .then((data) => {
            this.brands = data;
            this.isMounted = true;
            this.isLoading = false;
            this.brandsLoaded = this.brands.length;
            this.initCarousel();
          })
          .catch((ex) => {
            this.isLoading = false;
          });
      }
    },
    prevSlide() {
      let item_count = this.settings.props.items_per_row.value;
      if (detectMobileWidth()) {
        if (this.carouselHandle.index - 1 >= 0) {
          this.carouselHandle.go(`=${this.carouselHandle.index - 1}`);
        }
      } else {
        if (this.carouselHandle.index - item_count >= 0) {
          this.carouselHandle.go(`=${this.carouselHandle.index - item_count}`);
        } else {
          this.carouselHandle.go(`<<`);
        }
      }
    },
    nextSlide() {
      let item_count = this.settings.props.items_per_row.value;
      if (detectMobileWidth()) {
        if (this.carouselHandle.index + 1 >= this.brands.length - 1) {
          this.carouselHandle.go(`=${this.carouselHandle.index + 1}`);
          this.carouselHandle.go(`>`);
        }
      } else {
        if (this.carouselHandle.index + item_count < this.brands.length) {
          this.carouselHandle.go(`=${this.carouselHandle.index + item_count}`);
        } else {
          this.carouselHandle.go(`>>`);
        }
      }
    },
    initCarousel() {
      if (
        !isBrowser ||
        this.settings.props.layout.value !== "horizontal" ||
        this.carouselHandle
      ) {
        return;
      }
      if (!this.$refs.glide) {
        setTimeout(() => {
          this.initCarousel();
        }, 1000);
        return;
      }
      this.$nextTick(() => {
        try {
          if (window.screen.width > 480 && window.screen.width <= 768) {
            this.glideOptions.gap = 40;
          } else if (window.screen.width <= 480) {
            this.glideOptions.gap = 12;
          }
          if (
            this.brands.length <= this.settings.props.items_per_row.value &&
            !detectMobileWidth()
          ) {
            this.glideOptions.type = "slider";
          } else {
            this.glideOptions.type = "carousel";
          }
          this.carouselHandle = new Glide(this.$refs.glide, this.glideOptions);

          let glideClass = this.$refs.glide.getAttribute("class");
          this.carouselHandle.on(["move.after"], () => {
            let allDots = document.querySelectorAll(
              `.${glideClass} [data-glide-dir]`
            );
            if (allDots && allDots.length > 0) {
              allDots.forEach((ele) => {
                ele.classList.remove("glide__bullet--active");
              });
            }

            let currentDot = this.carouselHandle
              ? document.querySelectorAll(
                  `.${glideClass} [data-glide-dir='=${this.carouselHandle.index}']`
                )
              : null;
            if (currentDot && currentDot.length > 0) {
              currentDot[0].classList.add("glide__bullet--active");
            }
          });
          this.carouselHandle.mount();
        } catch (ex) {}
      });
    },
    initializeComponent() {
      if (window.screen.width > 600 && window.screen.width <= 1024) {
        this.settings.props.items_per_row.value = 3;
      } else if (window.screen.width > 480 && window.screen.width <= 600) {
        this.settings.props.items_per_row.value = 2;
      } else if (window.screen.width <= 480) {
        this.settings.props.items_per_row.value = 1;
      }
      this.glideOptions.perView = this.settings.props.items_per_row.value;
      const urlParams = new URLSearchParams(window.location.search);
      const checkIsPreview = urlParams.get("isPreview");
      if (this.brands.length == 0 || checkIsPreview) {
        const { brand_type, department } = this.settings?.props || {};
        const options = {
          department: "",
          image_size: "large",
          pageNo: this.page.current + 1,
        };
        if (brand_type.value === "department") {
          options.department = department.value;
        }
        !this.isLoading && this.fetchBrands(options);
      } else {
        this.isMounted = true;
        this.initCarousel();
      }
    },
    cleanupComponent() {
      if (isBrowser && this.carouselHandle) {
        this.carouselHandle.destroy();
        this.carouselHandle = null;
      }
    },
    isBlocksChanged(newBlocks, oldBlocks) {
      return JSON.stringify(newBlocks) === JSON.stringify(oldBlocks)
        ? false
        : true;
    },
  },
  initializeServerProps({ apiSDK, settings }) {
    const { brand_type, department } = settings?.props || {};
    const options = {
      department: "",
      pageNo: 1,
    };
    if (brand_type.value === "department") {
      options.department = department.value;
    }
    if (settings.props.brand_type.value !== "handpicked") {
      return apiSDK.catalog
        .getBrands(options)
        .then((data) => {
          return {
            brands: data.items || [],
            page: data.page,
          };
        })
        .catch((ex) => console.log);
    } else {
      return Promise.all(
        settings.blocks.map((block) => {
          return apiSDK.catalog
            .getBrandDetailBySlug({
              slug: block.props.brand.value.id,
            })
            .then((data) => {
              return data.items || [];
            })
            .catch((ex) => console.log);
        })
      ).then((brands) => {
        return {
          brands,
          brandsLoaded: brands.length,
        };
      });
    }
  },
  mounted() {
    this.initializeComponent();
  },

  beforeDestroy() {
    this.cleanupComponent();
  },
};
</script>

<style lang="less" scoped>
/deep/ .infi-loader {
  .container {
    background-color: transparent;
  }
}
::-webkit-scrollbar {
  display: none;
}
.brands {
}

.card-container {
  margin: 0;
  position: relative;
  .top-items {
    // padding: 14px;
    border-radius: @border-radius;
    background: transparent;
    // margin: 10px 0 0 0;
  }

  .title-block {
    display: flex;
    text-transform: uppercase;
    text-align: center;
    box-sizing: border-box;
    position: relative;
    max-width: @page-width;
    .margin-0-auto();
    > div {
      flex: 0 0 100%;
    }
  }
  .link {
    position: absolute;
    line-height: 35px; //this is used to match the title-block height
    right: 0px;
    bottom: @title-margin-desktop;
    @media @tablet {
      display: none;
    }
  }
  .brands {
    justify-content: left;
  }

  .arrows {
    &.hide-slider-nav {
      display: none;
      @media @tablet {
        display: block;
      }
    }
    position: absolute;
    display: flex;
    justify-content: flex-end;
    top: 50%;
    width: 100%;
    margin: -40px 0 0 0;
    @media @tablet {
      display: none;
    }
    section {
      position: relative;
      width: 100%;
      margin: 0 auto;
      display: flex;
      padding: 0 20px;
      box-sizing: border-box;
    }
  }
}
.logo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  height: 100%;
  > section {
    max-width: 115px;
    display: flex;
  }
  h3 {
    max-width: 115px;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    color: @Black;
    line-height: 20px;
    font-size: 16px;
    margin: 18px 0 0 0;
    text-transform: capitalize;
    @media @tablet {
      font-size: 14px;
    }
    @media @mobile {
      font-size: 13px;
    }
  }
}
.common-card {
  // height: 420px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  // @media @tablet {
  //   height: 332px;
  // }
  // @media @mobile {
  //   height: 270px;
  // }
  height: 100%;
  > section {
    min-height: 200px;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    overflow: hidden;
    flex: 1;
    @media @mobile {
      min-height: 150px;
      // height: 70%;
      // align-items: flex-start;
    }
  }
  h3 {
    height: 18.9%;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    color: @Black;
    line-height: 20px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    padding: 30px 10px 10px 10px;
    @media @mobile {
      font-size: 13px;
      // height: 30%;
    }
  }
  .logo-wrapper {
    display: flex;
    width: 100%;
    color: @Black;
    background: #f5f5f5;
    box-sizing: border-box;
    align-items: center;
    padding: 10px 10px;
    height: 14%;
    .card-logo {
      bottom: 30px;
      width: 30px;
      height: 30px;
      img {
        width: 30px;
        @media @mobile {
          width: 30px;
          margin-left: 8px;
        }
      }
    }
    .card-desc {
      font-size: 16px;
      font-weight: 400;
      padding: 0 0 0 10px;
      @media @mobile {
        font-size: 14px;
      }
      h4 {
        text-transform: capitalize;
        width: auto;
        display: block;
        white-space: pre-wrap;
        text-align: left;
      }
    }
    &.center {
      background: transparent;
      justify-content: center;
      .card-desc {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        @media @mobile {
          font-size: 14px;
        }
        h4 {
          text-transform: uppercase;
        }
      }
    }
  }
}
.ssr-slide {
  width: auto;
  padding-right: 30px;
  @media @mobile {
  }
}
.glide__bullets {
  position: relative;
  z-index: 2;
  margin-top: 40px;
  bottom: 0;
  left: 50%;
  display: inline-flex;
  align-items: center;
  list-style: none;
  transform: translateX(-50%);
  @media @mobile {
    margin-top: 20px;
  }
}
.glide__bullet {
  background-color: unset;
  border: 1px solid @color-black;
  box-shadow: unset;
  &:hover {
    background-color: @color-black;
  }
  &.glide__bullet--active {
    background-color: @color-black;
  }
}
.glide__slides {
  .def-margin {
    margin-bottom: 10px;
    margin-right: 30px;
    @media @mobile {
      margin-right: 10px;
    }
    @media only screen and (max-width: 376px) {
      margin-right: 10px;
    }
  }
}
.glide--carousel .glide__slides .def-margin {
  margin-right: 0;
}
.glide__slide {
  height: auto;
  a {
    display: flex;
    height: 100%;
  }
  /deep/ .placeholder-svg {
    height: 99%;
    display: flex;
    svg {
      width: 100%;
    }
  }
  max-width: 375px;
  &.big-slide-item {
    max-width: 375px;
    @media only screen and (max-width: 1024px) {
      max-width: unset;
    }
  }
  @media @tablet {
    max-width: 220px !important;
  }
  @media @mobile {
    max-width: 192px !important;
  }
  @media only screen and (max-width: 376px) {
    max-width: 174px !important;
  }
  @media only screen and (max-width: 359px) {
    max-width: 146px !important;
  }
}
.glide__slides.ssr-slides-box {
  touch-action: unset;
  overflow-x: auto;
  .glide__slide {
    width: 218.8px;
    margin-right: 15px;

    &.big-slide-item {
      max-width: 375px;
      @media only screen and (max-width: 1024px) {
        max-width: unset;
      }
    }
    &.big-slide-item[data-count="3"] {
      max-width: 370px;
      @media only screen and (max-width: 1024px) {
        max-width: unset;
      }
    }

    &.big-slide-item[data-count="4"] {
      max-width: 271px;
      @media only screen and (max-width: 1024px) {
        max-width: unset;
      }
    }
    @media @tablet {
      margin-right: 40px;
      max-width: 220px !important;
    }
    @media @mobile {
      margin-right: 10px;
      max-width: 192px !important;
    }
    @media only screen and (max-width: 376px) {
      margin-right: 10px;
      max-width: 174px !important;
    }
    @media only screen and (max-width: 359px) {
      margin-right: 10px;
      max-width: 146px !important;
    }
  }
}
.btn-nav-brands {
  z-index: @layer;
  background-color: transparent;
  padding: unset;
  cursor: pointer;
  width: 50px;
  display: flex;
  justify-content: center;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.2);
  }
}
.next-btn {
  margin-left: auto;
}
.prev-btn {
}

.icon {
  display: inline-block;
  width: 45px;
  height: 45px;
  background-size: cover;
}
.icon-next {
  background-image: url(../assets/images/nav-arrow.svg);
  transform: rotate(180deg);
}
.icon-prev {
  background-image: url(../assets/images/nav-arrow.svg);
}
</style>

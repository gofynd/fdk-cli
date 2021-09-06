<template>
  <div class="collections__template section-main-container">
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
                  :link="'/collections/'"
                  class="link view-all-text"
                  :style="
                    'color:' + global_config.props.text_heading_link_color
                  "
                  v-if="collections.length > 0 && settings.props.cta_text.value"
                >
                  {{ settings.props.cta_text.value }}</fdk-link
                >
              </div>
              <div v-if="settings.props.layout.value === 'grid'">
                <group-list
                  :cardlist="collections"
                  :cardtype="'COLLECTIONS'"
                  :itemcount="settings.props.items_per_row.value"
                  :global_config="global_config"
                ></group-list>
              </div>

              <div
                v-if="
                  settings.props.layout.value === 'horizontal' &&
                    (settings.props.collection_type.value === 'handpicked' ||
                      settings.props.collection_type.value !== 'handpicked')
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
                        class="glide__slide"
                        v-for="(collection, index) in collections"
                        :key="index"
                      >
                        <fdk-link
                          v-if="collection"
                          :link="`/collection/${collection.slug}`"
                        >
                          <div class="common-card">
                            <section>
                              <emerge-image
                                v-if="
                                  collection.banners &&
                                    collection.banners.portrait
                                "
                                :src="collection.banners.portrait.url"
                                :sources="[
                                  { breakpoint: { min: 768 }, width: 360 },
                                  { breakpoint: { min: 361 }, width: 250 },
                                  { breakpoint: { max: 360 }, width: 200 },
                                ]"
                                :alt="collection.name"
                              />
                              <fdk-placeholder v-else type="collection-3" />
                            </section>
                            <h3
                              :style="
                                `color: ${global_config.props.text_heading_link_color}`
                              "
                            >
                              {{ collection.name }}
                            </h3>
                          </div>
                        </fdk-link>
                        <fdk-placeholder v-else type="collection-3" />
                      </div>
                    </div>
                  </div>
                  <div
                    class="glide__bullets"
                    data-glide-el="controls[nav]"
                    v-if="
                      collections.length > settings.props.items_per_row.value
                    "
                  >
                    <button
                      class="glide__bullet"
                      :data-glide-dir="'=' + entry"
                      v-show="
                        checkGlide(entry, settings.props.items_per_row.value)
                      "
                      v-for="(entry, index) in glidePaginate(
                        collections.length,
                        settings.props.items_per_row.value
                      )"
                      :key="index"
                    ></button>
                  </div>
                  <div
                    class="arrows"
                    v-if="
                      collections.length > settings.props.items_per_row.value
                    "
                  >
                    <section>
                      <div
                        class="prev-btn btn-nav-coll"
                        ref="prevArrow"
                        @click="prevSlide"
                      >
                        <div class="icon icon-prev"></div>
                      </div>
                      <div
                        class="next-btn btn-nav-coll"
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
                  :link="'/collections/'"
                  class="view-all-text"
                  v-if="collections.length > 0 && settings.props.cta_text.value"
                  >{{ settings.props.cta_text.value }}</fdk-link
                >
              </div>
            </div>
          </div>
        </template>
        <fdk-empty-state
          v-if="collections.length === 0 && isMounted"
          :title="'No Collections Found'"
        ></fdk-empty-state>
        <fdk-loader v-if="isLoading" class="infi-loader" />
      </fdk-infinite-scrolling>
    </template>
    <template v-if="collections.length === 0 && isMounted">
      <placeholder-items
        :count="settings.props.items_per_row.value * 2"
        :items_per_row="settings.props.items_per_row.value"
        type="collection-3"
        text="Collection"
        :layout="settings.props.layout.value"
      />
    </template>
  </div>
</template>
<!-- #region  -->

<settings>
{
    "name": "collections_listing",
    "label": "Collections Listing",
    "props": [
        {
            "type": "text",
            "id": "title",
            "default": "",
            "label": "Title"
        },
        {
            "type": "radio",
            "id": "collection_type",
            "default": "all",
            "options": [
                {
                    "value": "all",
                    "text": "All"
                },
                {
                    "value": "handpicked",
                    "text": "Handpicked"
                }
            ]
        },
        {
            "type": "text",
            "id": "tags_filter",
            "default": "",
            "label": "Filter by tags",
            "info": "Filter by Tags "
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
            "type": "collection-item",
            "name": "collection Item",
            "props": [
                {
                    "type": "collection",
                    "id": "collection",
                    "label": "Select Collection"
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
      collections: this.serverProps?.collections || [],
      isLoading: false,
      collectionsLoaded: this.serverProps?.collectionsLoaded || 0,
      isMounted: false,
      page: this.serverProps?.page || { current: 0, has_next: true },
      glideOptions: {
        type: "carousel",
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
        newVal.props.collection_type.value !==
        oldVal.props.collection_type.value
      ) {
        this.collections = [];
        this.collectionsLoaded = 0;
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
    loadMoreData() {
      let options = {
        pageNo: this.page.current + 1,
      };
      if (this.settings.props.layout.value === "grid") {
        !this.isLoading && this.fetchCollections(options);
      }
    },
    getTags(commaSeperatedTags) {
      let tagsStr = commaSeperatedTags;
      let tagsListFinal = [];
      if (tagsStr.indexOf(",") !== -1) {
        let tagsList = tagsStr.split(",");
        tagsList.map((tag) => {
          if (tag) {
            tagsListFinal.push(tag.trim());
          }
        });
      } else {
        tagsListFinal.push(tagsStr);
      }
      return tagsListFinal;
    },
    fetchCollections(options) {
      if (this.settings.props.collection_type.value !== "handpicked") {
        if (this.page && this.page.has_next) {
          this.isLoading = true;
          this.$apiSDK.catalog
            .getCollections(options)
            .then((data) => {
              this.collections = [...this.collections, ...data.items];
              this.page = data.page;
              this.isMounted = true;
              this.isLoading = false;
              this.initCarousel();
            })
            .catch((ex) => {
              this.isLoading = false;
            });
        } else {
          this.isLoading = false;
        }
      } else {
        if (this.collections.length === 0) {
          this.isLoading = true;
          let allPromises = [];
          this.settings.blocks.forEach((block) => {
            if (block.props.collection && block.props.collection.value) {
              this.isLoading = true;
              allPromises.push(
                this.$apiSDK.catalog
                  .getCollectionDetailBySlug({
                    slug: block.props.collection.value,
                  })
                  .then((data) => {
                    if (data && data.banners) {
                      return data;
                    }
                  })
              );
            } else {
              allPromises.push(null);
            }
          });
          Promise.all(allPromises).then((data) => {
            this.collections = data;
            this.isMounted = true;
            this.isLoading = false;
            this.collectionsLoaded = this.collections.length;
            this.initCarousel();
          });
        }
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
        if (this.carouselHandle.index + 1 >= this.collections.length - 1) {
          this.carouselHandle.go(`=${this.carouselHandle.index + 1}`);
        }
      } else {
        if (this.carouselHandle.index + item_count < this.collections.length) {
          this.carouselHandle.go(`=${this.carouselHandle.index + item_count}`);
        } else {
          this.carouselHandle.go(`>>`);
        }
      }
    },
    initCarousel() {
      if (
        isNode ||
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
      if (this.collections.length === 0) {
        this.isLoading = true;

        const { props, blocks } = this.settings;

        const options = {
          pageNo: this.page.current + 1,
        };
        this.fetchCollections(options);
      } else {
        this.initCarousel();
      }
    },
    cleanupComponent() {
      if (isBrowser && this.carouselHandle) {
        this.carouselHandle.destroy();
        this.carouselHandle = null;
      }
    },
  },
  mounted() {
    this.initializeComponent();
  },
  initializeServerProps({ apiSDK, settings, route }) {
    const options = {
      pageNo: 1,
    };
    if (settings.props.collection_type.value !== "handpicked") {
      return apiSDK.catalog.getCollections(options).then((data) => {
        return {
          collections: data?.items,
          page: data?.page,
        };
      });
    } else {
      const promises = settings.blocks.map((block) => {
        return apiSDK.catalog.getCollectionDetailBySlug({
          slug: block.props.collection.value,
        });
      });
      return Promise.all(promises).then((res) => {
        let collections = [];
        let collectionsLoaded = 0;
        res.forEach((data) => {
          if ((data && data, banners)) {
            collections.push(data);
          }
          collectionsLoaded++;
        });
        return {
          collections,
          collectionsLoaded,
        };
      });
    }
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
.collections {
  // &__template {
  //   // .section-heading {
  //   //   font-size: 18px;
  //   //   text-align: left;
  //   //   color: #41434c;
  //   //   margin-bottom: 6px;
  //   //   @media @mobile {
  //   //     font-size: 14px;
  //   //     margin-bottom: 6px;
  //   //     margin-left: 9px;
  //   //   }
  //   // }
  // }
  &__content {
    top: 92%;
    position: absolute;
    display: flex;
    width: 100%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* flex-direction: column; */
    /* justify-content: center; */
    /* align-items: center; */
    /* opacity: 0; */
    transition: all 0.5s;
    background: transparent linear-gradient(180deg, transparent, #000) 0 0
      no-repeat padding-box;
    color: #ffffff;
    border-radius: 8px;
  }
}

.card-container {
  margin: 0;
  position: relative;

  .arrows {
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
}
.glide__slides.ssr-slides-box {
  touch-action: unset;
  overflow-x: auto;
  .glide__slide {
    margin-right: 30px;
    width: auto;
    max-width: 218px;
  }
}
.btn-nav-coll {
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
  // @media @mobile {
  //   right: 15px;
  // }
}
.prev-btn {
  // left: 0;
  // right: 150px;
  // margin-left: 22px;
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

.item {
  padding-right: 20px;
  box-sizing: border-box;
}

.common-card {
  // height: 420px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  // @media @mobile {
  //   height: 270px;
  // }
  height: 100%;
  > section {
    min-height: 250px;
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
    }
  }
  h3 {
    height: 8%;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    color: @Black;
    line-height: 24px;
    font-size: 20px;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    padding: 30px 10px 10px 10px;
    @media @mobile {
      font-size: 13px;
      height: 9%;
    }
  }
}

// @media @mobile {
//   /deep/ .item {
//     width: 100% !important;
//     margin-bottom: 20px;

//     &:not(:nth-child(2n + 0)) {
//       margin-right: 19px !important;
//     }
//   }
// }
</style>

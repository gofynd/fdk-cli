<template>
  <div class="compare-page">
    <!--Search Container-->
    <transition name="slide">
      <div class="add-search-container" :class="{ 'show-phone': showPopup }">
        <div class="add-search-title">Search Here</div>
        <div>
          <fdk-compare-search
            class="search-box"
            ref="compare-search"
            :pageSize="10"
            :filter="{ l3_categories: firstCategory }"
          >
            <template slot-scope="searchData">
              <div class="cross-btn" v-on:click="hideMenu">
                <img src="./../../assets/images/close-icon.png" />
              </div>
              <div class="search-container">
                <input
                  class="input-box"
                  type="text"
                  v-model="searchtext"
                  @keydown.enter.prevent
                  @keyup.enter="searchData.executeQuery(searchtext)"
                  @input="(evt) => handleSearch(searchData, evt)"
                  placeholder="Search for products here"
                />
                <fdk-inline-svg
                  :src="'search-black'"
                  class="search-icon"
                ></fdk-inline-svg>
              </div>
              <div class="popularhdng">Add to compare</div>
              <div class="notFound" v-if="searchData.suggestions.length === 0">
                No Product Found
              </div>
              <div
                class="landingBestsellerHandest"
                :class="{ 'search-results': showPopup }"
                v-if="searchData.suggestions.length > 0"
              >
                <div
                  class="whiteSmallRBox"
                  v-for="(data, index) in getSearchFilteredData(
                    searchData.suggestions
                  )"
                  :key="index"
                >
                  <fdk-compare-action class="add-to-compare-button">
                    <template slot-scope="compare">
                      <div
                        class="media"
                        @click="
                          addCompareProducts(compare.addCompare, data.slug);
                          clearSearch(searchData, data.slug);
                        "
                      >
                        <div class="media-left">
                          <nm-image :src="data.media.url" :alt="data.name" />
                        </div>
                        <div class="media-left-name">{{ data.name }}</div>
                      </div>
                    </template>
                  </fdk-compare-action>
                </div>
              </div>
            </template>
          </fdk-compare-search>
        </div>
      </div>
    </transition>

    <!--Compared Products-->
    <div class="compare-container" v-if="!showPopup">
      <!-- Product List -->
      <div
        class="product-list slider"
        @touchmove="swipeHandler($event, 'bigProductList')"
        @touchstart="startTouch($event, 'bigProductList')"
        ref="productContainerBig"
      >
        <template
          v-if="
            context &&
            context.data &&
            context.data.items &&
            context.data.items.length > 0
          "
        >
          <div
            v-for="(item, index) in context.data.items"
            :key="index"
            class="product"
          >
            <div class="product-cont">
              <fdk-compare-action class="cross-btn">
                <template slot-scope="compareAction">
                  <div @click="handleRemove(compareAction, item.slug)">
                    <img src="./../../assets/images/close-icon.png" />
                  </div>
                </template>
              </fdk-compare-action>
              <div class="product-name">{{ item.name }}</div>
              <img class="product-image" :src="item.medias[0].url" />
              <div>{{ getPrice(item.price.effective) }}</div>
              <div
                class="price-marked"
                :style="{
                  visibility:
                    item.price.effective.min != item.price.marked.min
                      ? 'visibile'
                      : 'hidden',
                }"
              >
                <span class="mrp-text">
                  M.R.P
                  <span style="text-decoration: line-through">{{
                    getPrice(item.price.marked)
                  }}</span>
                </span>
                <span class="save-text">
                  Save:
                  <span>{{ getPriceDifference(item.price) }}</span>
                </span>
              </div>
              <div class="pdp-btn" @click.stop="getProductLink(item)">
                View product details
              </div>
              <p class="bullet">OR</p>
            </div>
          </div>
        </template>
        <div
          class="empty-state-cont"
          v-if="
            (context &&
              context.data &&
              context.data.items &&
              context.data.items.length < 3) ||
            compare_slugs.length === 0
          "
        >
          <img
            class="empty-state-background"
            src="./../../assets/images/compare-empty-screen.png"
          />
          <div class="add-phone-button" @click="showAddPhone()">
            Add Product
          </div>

          <!-- <p class="bullet">OR</p> -->
        </div>
      </div>

      <div
        class="product-list-small slider"
        @touchmove="swipeHandler($event, 'smallProductList')"
        @touchstart="startTouch($event, 'smallProductList')"
        ref="productContainerSmall"
      >
        <div
          v-for="(item, index) in context && context.data && context.data.items"
          :key="index"
          class="product-small"
        >
          <div class="product-cont-small">
            <fdk-compare-action class="cross-btn">
              <template slot-scope="compareAction">
                <div @click="handleRemove(compareAction, item.slug)">
                  <img src="./../../assets/images/close-icon.png" />
                </div>
              </template>
            </fdk-compare-action>
            <img class="product-image-small" :src="item.medias[0].url" />
            <span class="product-name-small">{{ item.name }}</span>
            <p class="bullet-small">OR</p>
          </div>
        </div>
        <div
          class="empty-state-cont"
          v-if="
            (context &&
              context.data &&
              context.data.items &&
              context.data.items.length < 3) ||
            compare_slugs.length === 0
          "
        >
          <img src="./../../assets/images/empty-phone.png" alt />
          <div class="small-compare-btn" @click="showAddPhone()">
            Add Product
          </div>
        </div>
      </div>

      <!-- Attribute List -->
      <div class="attribute-list">
        <div
          class="attribute"
          v-if="
            context &&
            context.data &&
            context.data.items &&
            context.data.items.length > 0
          "
        >
          <div
            v-for="(attributes_metadata, id) in context.attributes_metadata"
            :key="id"
          >
            <div class="attr-title">{{ attributes_metadata.title }}</div>
            <div
              v-for="(attribute, aid) in attributes_metadata.details"
              :key="'cl' + id + aid"
            >
              <div
                class="attr-name"
                :class="{ differ: isDifferent(attribute) }"
              >
                {{ attribute.display }}
              </div>
              <div
                class="attr-desc slider"
                @touchmove="swipeHandler($event, 'attrDesc')"
                @touchstart="startTouch($event, 'attrDesc')"
              >
                <div
                  v-for="(cProduct, id) in context.data.items"
                  :key="'cp' + id"
                  class="attr-desc-name d-flex"
                >
                  <nm-image :src="attribute.logo" />
                  <span
                    class="attr"
                    v-if="checkHtml(getAttribute(cProduct, attribute))"
                    style="text-align: left"
                    v-html="getAttribute(cProduct, attribute)"
                  ></span>
                  <span class="attr" v-else>
                    {{ getAttribute(cProduct, attribute) }}
                  </span>
                </div>
                <div
                  class="attr-desc-name empty-attr"
                  v-if="
                    context &&
                    context.data &&
                    context.data.items &&
                    context.data.items.length < 3
                  "
                >
                  <img src="./../../assets/images/empty-phone.png" alt />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <toast :id="'toast-message'" :content="toast_message"></toast>
  </div>
</template>

<script>
import { checkHtml } from "../../helper/utils";
import toast from "./../components/toast.vue";
import nmImage from "./common/nm-image.vue";
export default {
  components: {
    toast,
    "nm-image": nmImage,
  },
  data: function data() {
    return {
      toast_message: "",
      is_difference_checked: false,
      showPopup: false,
      searchtext: "",
      dragging: false,
      scrollLeft: null,
      startX: null,
    };
  },
  props: {
    context: {
      type: Object,
    },
    compare_slugs: Array,
  },

  methods: {
    handleRemove(compareAction, slug) {
      compareAction.removeCompare(slug);
      this.$refs["compare-search"]?.fetchSuggestions();
    },
    handleSearch(searchData, evt) {
      this.searchtext = evt.target.value;
      searchData.fetchSuggestions({ search: this.searchtext, pageSize: 15 });
    },
    checkHtml,
    addCompareProducts(promiseFn, product_slug) {
      this.showPopup = false;
      window.scrollTo(0, 0);
      if (this.compare_slugs.length < 3) {
        promiseFn(product_slug)
          .then((res) => {
            //todo
          })
          .catch((err) => {
            //show error
            this.showToast(err.message || "Something went wrong");
          });
      } else {
        //show popup max upto 3
        this.showToast("You can only compare 3 products at a time");
      }
    },
    showToast(message) {
      if (message) {
        this.toast_message = message;
      }
      var x = document.getElementById("toast-message");
      x.className = "toast show";
      setTimeout(function () {
        x.className = x.className.replace("toast show", "toast hide");
      }, 3000);
    },
    getSearchFilteredData(item) {
      var array = [];
      var filteredArray = [];
      array = item.filter((res) => {
        const index = this.compare_slugs.findIndex((slug) => res.slug === slug);
        if (index === -1) {
          return res;
        }
      });
      filteredArray = array;
      return filteredArray;
    },
    isAlreadyInCompare(slug) {
      const found = this.compare_slugs.findIndex(
        (compare_slugs) => compare_slugs === slug
      );
      if (found === -1) return true;
      return false;
    },
    clearSearch(searchData, slug) {
      this.searchtext = "";
      this.selected = "";
      this.showPopup = false;
      let filterData = this.getFilterData(searchData, slug);
      this.$refs["compare-search"]?.fetchSuggestions({ filter: filterData });
      window.scrollTo(0, 0);
    },
    getFilterData(searchData, slug) {
      if (searchData.suggestions) {
        for (let i = 0; i < searchData.suggestions.length; i++) {
          if (searchData.suggestions[i].slug === slug) {
            return { l3_categories: searchData.suggestions[i].category_id };
          }
        }
      }
      return {};
    },

    showAddPhone() {
      this.showPopup = true;
      window.scrollTo(0, 0);
    },
    hideMenu(event) {
      event.stopPropagation();
      this.showPopup = false;
    },
    differenceClicked() {
      this.is_difference_checked = !this.is_difference_checked;
    },
    getProductLink(item) {
      this.$router.push("/product/" + item.slug);
    },
    isDifferent(id) {
      let temp = [];
      this.context?.data?.items.forEach((p) => {
        temp.push(p.attributes[id.key]);
      });
      var res = temp.every((v) => v === temp[0]);
      return !res && this.is_difference_checked;
    },
    getAttribute: function (item, attribute) {
      let value = item.attributes[attribute.key];
      if (!value) {
        return "-";
      } else if (Array.isArray(value)) {
        value = value.join(", ");
      }
      return value;
    },
    getPriceDifference(price) {
      return this.$options.filters.currencyformat(
        price.marked.max - price.effective.max
      );
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

    swipeHandler(e, type) {
      let slider;
      if (type === "attrDesc") {
        slider = document.querySelector(".attr-desc");
      } else if (type === "bigProductList") {
        slider = document.querySelector(".product-list");
      } else if (type === "smallProductList") {
        slider = document.querySelector(".product-list-small");
      }
      e.preventDefault();
      const x = e.changedTouches[0].pageX - slider.offsetLeft;
      const walk = x - this.startX;
      document.querySelectorAll(".slider").forEach((sliderItem) => {
        sliderItem.scrollLeft = this.scrollLeft - walk;
      });
    },
    startTouch(e, type) {
      let slider;
      if (type === "attrDesc") {
        slider = document.querySelector(".attr-desc");
      } else if (type === "bigProductList") {
        slider = document.querySelector(".product-list");
      } else if (type === "smallProductList") {
        slider = document.querySelector(".product-list-small");
      }
      this.startX = e.changedTouches[0].pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
    },
  },
  computed: {
    firstCategory() {
      return this.context?.data?.items[0]?.categories?.[0]?.uid;
    },
  },
  watch: {
    context(newValue) {
      this.context = newValue;
    },
  },
  mounted() {
    let value = 0;
    window.addEventListener("scroll", () => {
      {
        if (
          this.$refs &&
          this.$refs.productContainerSmall &&
          this.$refs.productContainerBig
        ) {
          let productContainerSmall = this.$refs.productContainerSmall;
          let productContainerBig = this.$refs.productContainerBig;
          let YOffset =
            productContainerBig.offsetTop + productContainerBig.offsetHeight;

          value = YOffset === 0 ? value : YOffset;
          if (window.pageYOffset >= value) {
            productContainerSmall.classList.add("sticky");
            productContainerSmall.style.display = "flex";
            productContainerBig.style.visibility = "hidden";
            productContainerSmall.scrollLeft = productContainerBig.scrollLeft;
          } else {
            productContainerSmall.classList.remove("sticky");
            productContainerBig.style.visibility = "visible";
            productContainerSmall.style.display = "none";
          }
        }
      }
    });
    if (
      this.$refs["compare-search"] &&
      this.$refs["compare-search"].suggestions &&
      this.$refs["compare-search"].suggestions.length
    ) {
      this.getSearchFilteredData(this.$refs["compare-search"].suggestions);
    }
  },
};
</script>

<style lang="less" scoped>
.compare-page {
  display: flex;
}
.add-search-container {
  background: #f1f5f6;
  position: sticky;
  top: 60px;
  align-self: flex-start;
  width: 35%;
  @media @tablet {
    display: none;
  }
  .add-search-title {
    background: #f1f5f6;
    padding: 30px 30px 20px 25px;
    font-size: 20px;
    font-weight: bold;
  }
  .search-box {
    .cross-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      display: none;
      @media @tablet {
        display: block;
      }
      img {
        width: 16px;
      }
    }
  }
}

.show-phone {
  display: block;
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 100vh;
}

.compare-container {
  width: 65%;
  @media @tablet {
    width: 100%;
  }
  .product-list {
    display: flex;
    box-shadow: 0px 3px 6px #00000029;
    background: #fff;
    @media @mobile {
      display: none;
    }
    .product {
      border-right: 1px solid #cecece;
      position: relative;
      flex: 1;
      width: 200px;
      .product-cont {
        display: flex;
        align-items: center;
        flex-direction: column;
        text-align: center;

        margin: 10px;
        .cross-btn {
          cursor: pointer;
          display: flex;
          align-self: flex-end;
          img {
            width: 22px;
          }
        }
        .product-image {
          padding-top: 10px;
          width: 100px;
        }
        .product-name {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          line-height: 20px;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .price-marked {
          .mrp-text {
            font-size: 10px;
            color: #444444;
          }
          .save-text {
            font-size: 10px;
            color: #079a18;
            margin-left: 5px;
          }
        }
        .pdp-btn {
          align-items: center;
          justify-content: center;
          outline: none;
          border: none;
          background-color: #004d9c;
          font-size: 10px;
          color: #ffffff;
          cursor: pointer;
          padding: 0;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
        }
      }
      &:last-child {
        border-right: 0;
      }
      &:last-child .bullet {
        display: none;
      }
    }
    .empty-state-cont {
      border-right: 1px solid #cecece;
      position: relative;
      display: flex;
      align-items: center;
      flex-direction: column;
      text-align: center;
      justify-content: center;
      flex: 1;
      padding: 10px;
      .empty-state-background {
        margin: 30px 0;
      }
      .add-phone-button {
        background: #fff;
        border: 1px solid @ds-black;
        border-radius: 4px;
        color: @ds-black;
        padding: 10px;
        font-size: 12px;
        position: absolute;
        display: none;
        @media @tablet {
          display: block;
        }
      }
    }
  }
  .attribute-list {
    // border-top: 1px solid #cecece;
    margin-top: 10px;
    .attribute {
      text-align: center;
      .attr-title {
        color: #5a5b5d;
        font-weight: bold;
        padding: 15px 0;
        border-bottom: 1px solid #cecece;
      }
      .attr-name {
        color: #909090;
        padding: 15px;
        line-height: 20px;
      }
      .attr-desc {
        display: flex;
        background: #fff;

        .attr-desc-name {
          padding: 20px 10px;
          flex: 1;
          border-right: 1px solid #cecece;
          span {
            word-wrap: break-word;
            line-height: 20px;
            @media @tablet {
              max-width: 150px;
            }
            @media @mobile {
              max-width: 100px;
            }
          }
          &:last-child {
            border-right: 0;
          }
        }
      }
    }
    .highlight-diff {
      display: flex;
      align-items: center;
      padding: 15px 10px;
      border-bottom: 1px solid #cecece;

      .text {
        color: #5a5b5d;
        padding-left: 10px;
        font-size: 14px;
        font-weight: 300;
      }
    }
  }
}

.popularhdng {
  font-size: 20px;
  color: #5a5b5c;
  background: #fff;
  padding: 30px 10px 10px 25px;
  font-weight: 700;
}
.notFound {
  font-size: 20px;
  color: #5a5b5c;
  margin: 50px;
}
.search-results {
  position: relative;
  height: 100vh;
  overflow: auto;
}

.landingBestsellerHandest {
  padding: 20px 30px;
  background: #fff;
  box-shadow: 0px 3px 6px #00000029;

  .whiteSmallRBox {
    width: 100%;
    background: #f1f5f6;
    border-radius: 5px;
    cursor: pointer;
    margin: 0 auto;
    padding: 12px 0 12px 10px;
    position: relative;
    margin-top: 12px;
  }
  .media {
    margin-top: 15px;
    display: flex;
    align-items: center;
    &:first-child {
      margin-top: 0;
    }
    .media-left {
      display: table-cell;
      vertical-align: top;
      padding-right: 10px;
      /deep/ .nm__img {
        width: 55px;
      }
    }
    .media-left-name {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .media-body {
      display: table-cell;
      margin-top: 18px;
      font-size: 15px;
      font-weight: 700;
      vertical-align: middle;
      color: #5a5b5c;
    }
  }
}

.add-compare-cont {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  overflow: auto;
  background-color: white;
  transition: all 0.25s ease;
  user-select: none;
  height: 100vh;
  .comparison-header {
    background: #004d9c;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .text {
      color: #fff;
      margin: auto;
      text-transform: uppercase;
    }
  }
}

.product-list-small {
  display: none;
  background: #fff;
  box-shadow: 0px 3px 6px #00000029;
  @media @mobile {
    display: flex;
  }
  .product-small {
    border-right: 1px solid #cecece;
    position: relative;

    flex: 1;
    .product-cont-small {
      width: 100%;
      margin: 10px 0px;
      .cross-btn {
        cursor: pointer;
        position: absolute;
        top: 15px;
        right: 10px;
        div {
          img {
            width: 12px;
          }
        }
      }
      .product-image-small {
        width: 50px;
        margin: auto;
        display: flex;
      }
      .product-name-small {
        padding-left: 10px;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        width: 90%;
        text-align: center;
        margin: auto;
        @media @tablet {
          max-width: 150px;
        }
        @media @mobile {
          max-width: 100px;
        }
      }
    }
    &:last-child {
      border-right: 0;
    }
    &:last-child .bullet-small {
      display: none;
    }
  }
  .bullet-small {
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    border-radius: 50%;
    background: #fff;
    right: -13px;
    width: 24px;
    height: 24px;
    border: 1px solid #cecece;
    position: absolute;
    top: 50%;
    transform: translate(0%, -50%);
  }
  .empty-state-cont {
    position: relative;
    flex: 1;
    margin: auto;
    text-align: center;
    min-height: 100px;
    img {
      // width: 20%;
      margin: 20px 0;
      @media @mobile {
        display: none;
      }
    }
  }
  .small-compare-btn {
    background: #fff;
    border: 1px solid @ds-black;
    border-radius: 4px;
    color: @ds-black;
    padding: 10px;
    font-size: 12px;
    position: absolute;
    margin: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 75px;
    height: 10px;
    display: none;
    @media @tablet {
      display: block;
    }
  }
}

.search-container {
  background-color: white;
  display: flex;
  border-radius: 4px;
  box-shadow: 0 0px 2px rgba(0, 0, 0, 0.16);
  position: relative;
  margin: 0 20px 35px 20px;
  .input-box {
    height: 40px;
    background-color: white;
    width: 100%;
    box-sizing: border-box;
    border: none;
    padding: 10px;

    font-size: 16px;
  }
  .search-icon {
    position: relative;
    padding: 0 10px;
  }
}

.slide-leave-active,
.slide-enter-active {
  transition: 0.5s;
}
.slide-enter {
  transform: translate(100%, 0);
}
.slide-leave-to {
  transform: translate(100%, 0);
}

.attr-name-spacing {
  padding-left: 10px;
}

.sticky {
  position: sticky;
  top: 60px;
  z-index: 1;
  @media @tablet {
    width: 100%;
  }
}

.spacing {
  padding: 20px 10px !important;
}

.attr {
  color: #5a5b5d;
  font-size: 14px;
  font-weight: 700;
}
.absolute-text {
  position: absolute;
  margin-top: 3px;
}

.relative-pos {
  position: relative;
}

.flex-align {
  display: flex;
  align-items: center;
  justify-content: center;
}
.differ {
  background: #eee;
  color: #000000 !important;
}

.bullet {
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  border-radius: 50%;
  background: #fff;
  right: -13px;
  width: 24px;
  height: 24px;
  border: 1px solid #cecece;
  top: 45%;
}

.compare-container::-webkit-scrollbar {
  display: none;
}

.empty-attr {
  /deep/ .nm__img {
    width: 20%;
  }
}
.d-flex {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  /deep/ .nm__img {
    width: 40px;
  }
}
</style>

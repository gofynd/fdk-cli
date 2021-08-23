<template>
  <div>
    <div
      v-if="compare.products && compare.products.length > 0"
      class="compare-desktop-container"
    >
      <div class="compare-container">
        <div class="compare-title bold-lg">{{ compare.title }}</div>
        <div class="compare-desc regular-xxs">
          {{ compare.subtitle }}
        </div>
        <div class="comp-outer">
          <div class="comp-inner">
            <table>
              <tbody>
                <tr class="comp-row product-display-row">
                  <td class="comp-col comp-attr"></td>
                  <td
                    class="comp-col"
                    v-for="(item, id) in compare.products"
                    :key="id"
                  >
                    <div class="comp-product">
                      <fdk-link :link="getProductLink(item)" class="img-cont">
                        <nm-image :src="getImageUrl(item.medias)" />
                      </fdk-link>
                      <div class="jm-product-cont">
                        <fdk-link :link="getProductLink(item)">
                          <div class="product-title product-name-small">
                            {{ item.name }}
                          </div>
                          <h5
                            v-if="item.attributes.subtitle"
                            class="product-subtitle-small"
                          >
                            {{ item.attributes.subtitle }}
                          </h5>
                        </fdk-link>
                        <div class="price">
                          <div class="price-effective">
                            {{ getPrice(item.price.effective) }}
                          </div>
                          <div
                            class="price-marked "
                            v-if="
                              item.price.effective.min != item.price.marked.min
                            "
                          >
                            {{ getPrice(item.price.marked) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <template
                  v-for="(attribute_metadata,
                  id) in compare.attributes_metadata"
                >
                  <tr class="comp-row comp-group-heading" :key="'pr' + id">
                    <td class="comp-col comp-attr bold-sm">
                      {{ attribute_metadata.title }}
                    </td>
                    <td
                      v-for="(cProduct, id) in compare.products"
                      :key="'d' + id"
                      class="comp-col"
                    ></td>
                  </tr>
                  <tr
                    class="comp-row"
                    v-for="(attribute, aid) in attribute_metadata.details"
                    :key="'cl' + id + aid"
                  >
                    <td class="comp-col comp-attr">
                      {{ attribute.display }}
                    </td>
                    <td
                      v-for="(cProduct, id) in compare.products"
                      :key="'cp' + id"
                      class="comp-col"
                    >
                      <template v-if="attribute.key === 'brand_rating'">
                        <ukt-rating
                          :rating="cProduct.attributes.brand_rating"
                        ></ukt-rating>
                      </template>
                      <span
                        v-else-if="checkHtml(getAttribute(cProduct, attribute))"
                        v-html="getAttribute(cProduct, attribute)"
                      ></span>
                      <span v-else>
                        {{ getAttribute(cProduct, attribute) }}
                      </span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="compare.products && compare.products.length > 0"
      class="compare-mobile-container"
    >
      <div class="compare-container">
        <h3 class="compare-title bold-lg">{{ compare.title }}</h3>
        <div class="compare-desc regular-xxs">
          {{ compare.subtitle }}
        </div>
      </div>
      <div
        class="compare-product-container slider"
        @touchmove="swipeHandler($event, 'bigProductList')"
        @touchstart="startTouch($event, 'bigProductList')"
        ref="productContainerBig"
      >
        <div
          v-for="(item, index) in compare.products"
          :key="index"
          class="container"
        >
          <div class="product">
            <fdk-link :link="getProductLink(item)" class="img-cont">
              <nm-image :src="getImageUrl(item.medias)" />
            </fdk-link>
            <div class="regular-xs text">{{ item.brand.name }}</div>
            <div class="regular-xs text">{{ item.name }}</div>
            <div class="bold-xs text">
              <span>
                {{ getPrice(item.price.effective) }}
              </span>
              <span
                class="regular-xs text price-marked"
                v-if="item.price.effective.min != item.price.marked.min"
              >
                {{ getPrice(item.price.marked) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="attribute-list">
        <div class="attribute">
          <div
            v-for="(attributes_metadata, id) in compare.attributes_metadata"
            :key="id"
          >
            <div class="attr-title">
              {{ attributes_metadata.title }}
            </div>
            <div
              v-for="(attribute, aid) in attributes_metadata.details"
              :key="'cl' + id + aid"
            >
              <div class="attr-name">
                {{ attribute.display }}
              </div>
              <div
                class="attr-desc slider"
                @touchmove="swipeHandler($event, 'attrDesc')"
                @touchstart="startTouch($event, 'attrDesc')"
              >
                <div
                  v-for="(cProduct, id) in compare.products"
                  :key="'cp' + id"
                  class="attr-desc-name d-flex"
                >
                  <span
                    class="attr"
                    v-if="checkHtml(getAttribute(cProduct, attribute))"
                    style="text-align: left;"
                    v-html="getAttribute(cProduct, attribute)"
                  ></span>
                  <span class="attr" v-else>
                    {{ getAttribute(cProduct, attribute) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
::-webkit-scrollbar {
  display: none;
}
.compare-desktop-container {
  display: inherit;
  @media @mobile {
    display: none;
  }

  .compare-container {
    background-color: #ffffff;
    color: #000000;
    border-radius: 3px;
    margin: 14px 0px;
    padding: 14px;
    .compare-title {
      text-transform: uppercase;
    }
    .compare-desc {
      margin-top: 5px;
    }
  }
  .comp-outer {
    position: relative;
    overflow: hidden;
    overflow-x: scroll;
    .comp-inner {
      overflow-y: visible;
    }
    .comp-row {
      .comp-col {
        padding: 5px;
        border-bottom: 1px solid 3px;
        border-right: 1px solid 3px;
        min-width: 200px;
        max-width: 200px;
        line-height: 30px;
        word-break: break-word;

        @media @mobile {
          min-width: 150px;
          max-width: 150px;
          line-height: 20px;
        }
      }
      .comp-attr {
        position: sticky;
        left: 0px;
        border-right: 1px solid 3px;
        background: #ffffff;
        z-index: 1;
        box-shadow: 0 0 1px 0 3px;
      }
      .comp-product {
        position: relative;
        .img-cont {
          /deep/ .nm__img {
            height: 100%;
            width: 100%;
            @media @mobile {
              width: 100px;
            }
          }
        }
      }
    }

    .product-display-row {
      .comp-attr {
        height: 100%;
      }
    }

    .comp-group-heading .comp-col {
      border-bottom-width: 0px;
    }

    :last-child.comp-row .comp-col {
      border-bottom-width: 0px;
    }

    :first-child.comp-row .comp-col {
      border-bottom-width: 0px;
    }
  }

  .price {
    display: flex;
    align-items: center;
    .price-effective {
      font-weight: 700;
      padding-right: 5px;
    }
    .price-marked {
      text-decoration: line-through;
    }
  }
}
.price-marked {
  text-decoration: line-through;
}
.compare-mobile-container {
  display: none;
  @media @mobile {
    display: inherit;
  }
  .compare-container {
    background-color: #ffffff;
    color: @Mako;
    border-radius: 3px;
    margin: 14px 0 0 0;
    padding: 14px;
    .compare-title {
      text-transform: uppercase;
    }
    .compare-desc {
      margin-top: 5px;
    }
  }
  .compare-product-container {
    background: #ffffff;
    overflow-x: scroll;
    display: flex;
    .container {
      padding: 10px;
      min-width: 150px;
      max-width: 150px;
      border-right: 1px solid #cecece;
      .product {
        .img-cont {
          /deep/ .nm__img {
            width: 120px;
          }
        }
      }
      .text {
        padding-top: 5px;
      }
    }
  }
  .attribute-list {
    .attribute {
      text-align: center;
      .attr-title {
        color: #5a5b5d;
        font-weight: bold;
        padding: 15px 0;
        border-bottom: 1px solid 3px;
      }
      .attr-name {
        color: #909090;
        padding: 15px;
        line-height: 20px;
      }
      .attr-desc {
        display: flex;
        background: #ffffff;
        overflow-x: scroll;
        .attr-desc-name {
          padding: 10px;
          min-width: 150px;
          max-width: 150px;
          border-right: 1px solid 3px;
          /deep/ .nm__img {
            width: 100%;
          }
          span {
            word-wrap: break-word;
            line-height: 20px;
          }
          &:last-child {
            border-right: 0;
          }
        }
      }
    }
  }
}
</style>

<script>
import uktrating from "./reviews/rating-star.vue";
import { checkHtml } from "./../../helper/utils.js";
import nmImage from "./common/nm-image.vue";

export default {
  name: "compare-product",
  components: {
    "ukt-rating": uktrating,
    "nm-image": nmImage,
  },
  props: {
    compare: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  methods: {
    checkHtml,
    getImageUrl(medias) {
      return medias[0].url;
    },
    getProductLink(item) {
      return "/product/" + item.slug;
    },
    getAttribute(item, attribute) {
      let value = item.attributes[attribute.key];
      if (!value) {
        return "-";
      } else if (Array.isArray(value)) {
        value = value.join(", ");
      }
      return value;
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
    getPriceDifference(price) {
      return this.$options.filters.currencyformat(
        price.marked.max - price.effective.max
      );
    },
    swipeHandler(e, type) {
      let slider;
      if (type === "attrDesc") {
        slider = document.querySelector(".attr-desc");
      } else if (type === "bigProductList") {
        slider = document.querySelector(".compare-product-container");
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
        slider = document.querySelector(".compare-product-container");
      }
      this.startX = e.changedTouches[0].pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
    },
  },
};
</script>

<template>
  <div>
    <div class="compare-desktop-container">
      <div class="compare-container">
        <div
          class="compare-title bold-lg"
          :style="'color:' + global_config.props.text_heading_link_color"
        >
          {{ compare.title }}
        </div>
        <div
          class="compare-desc regular-xxs"
          :style="'color:' + global_config.props.text_heading_link_color"
        >
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
                        <emerge-image :src="getImageUrl(item.medias)" :sources="[{width: 230}]"/>
                      </fdk-link>
                      <div class="jm-product-cont">
                        <fdk-link :to="getProductLink(item)">
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
                          <div
                            class="price-effective"
                            :style="
                              item.price.effective.min != item.price.marked.min
                                ? 'color:' +
                                  global_config.props.text_sale_price_color
                                : 'color:' +
                                  global_config.props.text_price_color
                            "
                          >
                            {{ getPrice(item.price.effective) }}
                          </div>
                          <div
                            class="price-marked "
                            :style="
                              'color:' +
                                global_config.props
                                  .text_strikethrough_price_color
                            "
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
                      <span
                        v-if="checkHtml(getAttribute(cProduct, attribute))"
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
    <div class="compare-mobile-container">
      <div class="compare-container">
        <div
          class="compare-title"
          :style="'color:' + global_config.props.text_heading_link_color"
        >
          {{ compare.title }}
        </div>
        <div
          class="compare-desc regular-xxs"
          :style="'color:' + global_config.props.text_heading_link_color"
        >
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
            <fdk-link :to="getProductLink(item)" class="img-cont">
              <!-- <img v-bind:src="getImageUrl(item.images)" /> -->
              <emerge-image :src="getImageUrl(item.medias)" :backgroundColor="'trasparent'" :sources="[{width: 150}]" />
            </fdk-link>
            <div class="regular-xs text">{{ item.brand.name }}</div>
            <div class="regular-xs text">{{ item.name }}</div>
            <div
              class="bold-xs text"
              :style="
                item.price.effective.min != item.price.marked.min
                  ? 'color:' + global_config.props.text_sale_price_color
                  : 'color:' + global_config.props.text_price_color
              "
            >
              <span>
                {{ getPrice(item.price.effective) }}
              </span>
              <span
                class="regular-xs text price-marked"
                :style="
                  'color:' + global_config.props.text_strikethrough_price_color
                "
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
                  <img :src="attribute.logo" alt />
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
.compare-desktop-container {
  display: inherit;
  @media @mobile {
    display: none;
  }

  ::-webkit-scrollbar {
    display: none;
  }
  .compare-container {
    background-color: @color-white;
    color: @color-black;
    border-radius: 1px;
    // margin: 14px 0px;
    // padding: 14px;
    .compare-title {
      margin-top: 3.125rem;
      font-size: 1.5625rem;
      text-align: center;
      font-weight: 600;
    }
    .compare-desc {
      margin-top: 15px;
      font-size: 18px;
      text-align: center;
    }
  }
  .comp-outer {
    position: relative;
    overflow: hidden;
    overflow-x: scroll;
    margin-top: 3.125rem;
    .comp-inner {
      overflow-y: visible;
    }
    .comp-row {
      .comp-col {
        padding: 3px 18px;
        border-bottom: 1px solid #efefef;
        border-right: 1px solid #efefef;
        min-width: 200px;
        max-width: 230px;
        line-height: 30px;
        word-break: break-word;
        font-size: 14px;
        font-weight: 500;
        @media @mobile {
          min-width: 150px;
          max-width: 150px;
          line-height: 20px;
        }
      }
      .comp-attr {
        position: sticky;
        left: 0px;
        /*border-right: 1px solid @border-color;*/
        background: @color-white;
        z-index: 1;
        /*box-shadow: 0 0 1px 0 @border-color;*/
        font-weight: 700;
        font-size: 12px;
        // text-transform:uppercase;
      }
      /deep/ .comp-product {
        position: relative;
        .img-cont {
          /deep/ .fy__img {
            height: 100%;
            width: 100%;
            border-radius: 8px;
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
      color: #999999;
      padding-top: 20px;
      padding-bottom: 0px;
    }

    :last-child.comp-row .comp-col {
      border-bottom-width: 0px;
    }

    :first-child.comp-row .comp-col {
      border-bottom-width: 0px;
    }
  }

  .product-title .product-name-small {
    line-height: 20px;
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
  margin-bottom: 30px;
  .compare-container {
    background-color: @color-white;
    color: @color-black;
    border-radius: 3px;

    .compare-title {
      margin-top: 3.125rem;
      text-align: center;
      font-weight: 600;
      font-size: 1.2rem;
    }
    .compare-desc {
      margin-top: 10px;
      text-align: center;
      font-size: 16px;
    }
  }
  .compare-product-container {
    background: @color-white;
    overflow-x: scroll;
    display: flex;
    margin-top: 1.5625rem;
    .container {
      padding: 10px;
      min-width: 150px;
      max-width: 150px;
      border-right: 1px solid #cecece;
      .product {
        img {
          width: 120px;
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
        border-bottom: 1px solid @BorderColor;
      }
      .attr-name {
        color: #909090;
        padding: 15px;
        line-height: 20px;
      }
      .attr-desc {
        display: flex;
        background: @color-white;
        overflow-x: scroll;
        .attr-desc-name {
          padding: 10px;
          min-width: 150px;
          max-width: 150px;
          border-right: 1px solid @BorderColor;
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
import { checkHtml } from "./../../helper/utils";
import emergeImage from "../../global/components/common/emerge-image.vue";

export default {
  name: "compare-product",
  components: {
    "emerge-image": emergeImage,
  },
  props: {
    compare: {
      type: Object,
    },
    global_config: {},
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

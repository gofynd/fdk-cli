<template>
  <div>
    <div class="compare-desktop-container">
      <div class="compare-container">
        <h3 class="compare-title bold-lg" v-if="settings.props.heading.value">
          {{ settings.props.heading.value }}
        </h3>
        <div
          class="comp-outer"
          v-if="compare.products && compare.products.length"
        >
          <div class="comp-inner">
            <table>
              <tbody>
                <tr class="comp-row product-display-row">
                  <td class="comp-col comp-attr"></td>
                  <td
                    class="comp-col"
                    v-for="(item, id) in compare.products &&
                      compare.products.slice(
                        0,
                        settings.props.item_count.value
                      )"
                    :key="id"
                  >
                    <div class="comp-product">
                      <fdk-link :link="getProductLink(item)" class="img-cont">
                        <nm-image
                          :src="getImageUrl(item.medias)"
                          :alt="item.name"
                        />
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
                            class="price-marked"
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
                  id) in compare.attributes_metadata || []"
                >
                  <tr class="comp-row comp-group-heading" :key="'pr' + id">
                    <td class="comp-col comp-attr bold-sm">
                      {{ attribute_metadata.title }}
                    </td>
                    <td
                      v-for="(cProduct, id) in compare.products &&
                        compare.products.slice(
                          0,
                          settings.props.item_count.value
                        )"
                      :key="'d' + id"
                      class="comp-col"
                    ></td>
                  </tr>
                  <tr
                    class="comp-row"
                    v-for="(attribute, aid) in attribute_metadata.details"
                    :key="'cl' + id + aid"
                  >
                    <td class="comp-col comp-attr">{{ attribute.display }}</td>
                    <td
                      v-for="(cProduct, id) in compare.products &&
                        compare.products.slice(
                          0,
                          settings.props.item_count.value
                        )"
                      :key="'cp' + id"
                      class="comp-col"
                    >
                      <span
                        v-if="checkHtml(getAttribute(cProduct, attribute))"
                        v-html="getAttribute(cProduct, attribute)"
                      ></span>
                      <span v-else>{{
                        getAttribute(cProduct, attribute)
                      }}</span>
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
        <h3 class="compare-title bold-lg" v-if="settings.props.heading.value">
          {{ settings.props.heading.value }}
        </h3>
      </div>
      <div
        class="compare-product-container slider"
        @touchmove="swipeHandler($event, 'bigProductList')"
        @touchstart="startTouch($event, 'bigProductList')"
        ref="productContainerBig"
      >
        <div
          v-for="(item, index) in compare.products &&
            compare.products.slice(0, settings.props.item_count.value)"
          :key="index"
          class="container"
        >
          <div class="product">
            <fdk-link :link="getProductLink(item)" class="img-cont">
              <nm-image :src="getImageUrl(item.images)" :alt="item.name" />
            </fdk-link>
            <div class="regular-xs text">{{ item.brand.name }}</div>
            <div class="regular-xs text">{{ item.name }}</div>
            <div class="bold-xs text">
              <span>{{ getPrice(item.price.effective) }}</span>
              <span
                class="regular-xs text price-marked"
                v-if="item.price.effective.min != item.price.marked.min"
                >{{ getPrice(item.price.marked) }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="attribute-list">
        <div class="attribute">
          <div
            v-for="(attributes_metadata, id) in compare.attributes_metadata ||
              []"
            :key="id"
          >
            <div class="attr-title">{{ attributes_metadata.title }}</div>
            <div
              v-for="(attribute, aid) in attributes_metadata.details"
              :key="'cl' + id + aid"
            >
              <div class="attr-name">{{ attribute.display }}</div>
              <div
                class="attr-desc slider"
                @touchmove="swipeHandler($event, 'attrDesc')"
                @touchstart="startTouch($event, 'attrDesc')"
                v-if="compare.products && compare.products.length"
              >
                <div
                  v-for="(cProduct, id) in compare.products"
                  :key="'cp' + id"
                  class="attr-desc-name d-flex"
                >
                  <nm-image :src="attribute.logo" alt />
                  <span
                    class="attr"
                    v-if="checkHtml(getAttribute(cProduct, attribute))"
                    style="text-align: left;"
                    v-html="getAttribute(cProduct, attribute)"
                  ></span>
                  <span class="attr" v-else>{{
                    getAttribute(cProduct, attribute)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<settings>
{
  "name": "compareProducts",
  "label": "Compare Products",
  
  "props": [
    {
      "type": "text",
      "id": "heading",
      "default": "Most Compared",
      "label": "Compare Heading"
    },
    {
      "type": "range",
      "id": "item_count",
      "min": 4,
      "max": 10,
      "step": 1,
      "unit": "",
      "label": "Products in Compare",
      "default": 4,
      "info": "Maximum items to show per row"
    },
    {
      "name":"SelectProduct",
      "type":"product",
      "id":"product",
      "label":"Select a product"
    }
  ]
}
</settings>
<style scoped lang="less">
.compare-desktop-container {
  ::-webkit-scrollbar {
    display: none;
  }
  .compare-container {
    background-color: @White;
    color: @Mako;
    border-radius: 1px;
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
        border-bottom: 1px solid @border-color;
        border-right: 1px solid @border-color;
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
        border-right: 1px solid @border-color;
        background: @White;
        z-index: 1;
        box-shadow: 0 0 1px 0 @border-color;
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
.compare-mobile-container {
  ::-webkit-scrollbar {
    display: none;
  }
  .compare-container {
    background-color: @White;
    color: @Mako;
    border-radius: @BorderRadius;
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
    background: @White;
    overflow-x: scroll;
    display: flex;
    .container {
      padding: 10px;
      min-width: 150px;
      max-width: 150px;
      border-right: 1px solid #cecece;
      .product {
        /deep/ .nm__img {
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
        border-bottom: 1px solid @border-color;
      }
      .attr-name {
        color: #909090;
        padding: 15px;
        line-height: 20px;
        border-top: 1px solid @border-color;
        border-bottom: 1px solid @border-color;
      }
      .attr-desc {
        display: flex;
        background: @White;
        overflow-x: scroll;
        .attr-desc-name {
          padding: 10px;
          min-width: 150px;
          max-width: 150px;
          border-right: 1px solid @border-color;
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
.compare-mobile-container {
  display: none;
}
@media screen and (min-width: 0px) and (max-width: 768px) {
  .compare-mobile-container {
    display: block;
  }
  .compare-desktop-container {
    display: none;
  }
}
</style>

<script>
import { checkHtml } from "./../helper/utils";
import nmImage from "./../global/components/common/nm-image.vue";
export default {
  components: {
    "nm-image": nmImage,
  },
  props: ["settings", "apiSDK", "serverProps"],
  initializeServerProps({ settings, route, apiSDK }) {
    return apiSDK.catalog
      .getComparedFrequentlyProductBySlug({
        slug: settings?.props?.product?.value,
      })
      .then((res) => {
        return res;
      });
  },
  mounted() {
    if (Object.keys(this.compare).length == 0) {
      this.$apiSDK.catalog
        .getComparedFrequentlyProductBySlug({
          slug: this.settings?.props?.product?.value,
        })
        .then((res) => {
          this.compare = res;
        });
    }
  },
  methods: {
    checkHtml,
    getImageUrl(images) {
      return images[0].url;
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
  data: function() {
    return {
      compare: this.serverProps || {},
    };
  },
};
</script>

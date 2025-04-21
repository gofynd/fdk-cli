<template>
  <div class="product-variants" v-if="variants && variants.length > 0">
    <div v-for="(item, type) in variants" :key="item.header + type">
      <template v-if="item.key === 'is_set'">
        <template v-for="(variant, index) in item.items">
          <template v-if="isProductSet !== variant.value">
            <div class="help light-xxs" :key="variant.slug + index">
              Interested in {{ getVariantSetText }}?
              <fdk-link class="ukt-links" :link="getProductLink(variant)">
                Pick {{ getVariantSetText }}
              </fdk-link>
            </div>
          </template>
        </template>
      </template>
      <template v-else>
        <div class="ukt-title">{{ item.header }}</div>
        <div v-if="item.display_type === 'image'">
          <div class="variant-container">
            <div
              v-for="(variant, index) in item.items"
              :key="variant.slug + index"
              class="variant-item-image"
              v-bind:class="{
                variantsel: isVariantSelected(variant),
                available: !variant.is_available,
              }"
            >
              <fdk-link :link="getProductLink(variant)">
                <emerge-image
                  :src="getImageURL(variant)"
                  :sources="[{ width: 50 }]"
                  :alt="variant.name"
                />
              </fdk-link>
            </div>
          </div>
        </div>
        <div v-else-if="item.display_type === 'color'">
          <div class="variant-container">
            <div
              v-for="(variant, index) in item.items"
              :key="variant.slug + index"
              class="variant-item-color"
              v-bind:class="{
                variantselcolor: isVariantSelected(variant),
              }"
            >
              <fdk-link :link="getProductLink(variant)">
                <div
                  v-bind:style="{
                    background: '#' + variant.color,
                  }"
                  class="color"
                ></div>
              </fdk-link>
            </div>
          </div>
        </div>
        <div v-else-if="item.display_type === 'text'">
          <div class="variant-container">
            <div
              v-for="(variant, index) in item.items"
              :key="variant.slug + index"
              class="variant-item-text"
              v-bind:class="{
                variantsel: isVariantSelected(variant),
                available: !variant.is_available,
              }"
            >
              <fdk-link :link="getProductLink(variant)">
                <div>{{ variant.value }}</div>
              </fdk-link>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ukt-title {
  padding: 5px 0px;
}
.variant-container {
  display: flex;
  flex-wrap: wrap;
  padding: 5px 0px;
  align-items: center;
  &::-webkit-scrollbar {
    display: none;
  }
  .variant-item-image {
    display: inline-block;
    margin: 10px;
    margin-bottom: 0px;
    margin-left: 0px;
    border: 1px dotted #c9c9c9;
    box-sizing: content-box;
    cursor: pointer;
    &:hover {
      border: 1px solid @PrimaryColor;
    }
    img {
      width: 50px;
      height: 78px;
      display: flex;
    }
    &.available {
      border: 3px dotted #c9c9c9;
    }
  }
  .variant-item-color {
    margin: 0 5px;
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
    .color {
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: none;
    }
  }
  .variant-item-text {
    display: inline-block;
    margin: 10px;
    margin-bottom: 0px;
    margin-left: 0px;
    border-radius: 6px;
    border: 1px dotted #c9c9c9;
    box-sizing: border-box;
    padding: 10px;
    cursor: pointer;
    &:hover {
      border: 1px solid @PrimaryColor;
    }
    &.available {
      border: 3px dotted #c9c9c9;
    }
  }
  .variantsel {
    border: 1px solid @PrimaryColor;
    box-sizing: content-box;
    border-radius: @border-radius;
  }
  .variantselcolor {
    border-radius: 50%;
    border: 1px solid black;
  }
  .available {
    border-style: dotted;
  }
}
</style>

<script>
import emergeImage from "./../../global/components/common/emerge-image.vue";

export default {
  name: "product-variants",
  components: {
    "emerge-image": emergeImage,
  },
  props: {
    variants: {
      type: Array,
    },
    product: {},
  },
  computed: {
    isProductSet() {
      return this.product.is_set;
    },
    getVariantSetText() {
      return this.isProductSet ? "Size" : "Set";
    },
  },
  methods: {
    getProductLink(item) {
      return "/product/" + item.slug;
    },
    getImageURL(item) {
      if (Array.isArray(item.medias) && item.medias.length > 0) {
        return item.medias[0].url;
      }
      return "";
    },
    isVariantSelected(item) {
      return item.slug === this.$route.params.slug;
    },
  },
};
</script>

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
        <div class="ukt-title">
          {{ item.header }}
        </div>
        <div
          v-if="item.display_type && item.display_type.includes('image')"
        >
          <div class="variant-container">
            <div
              v-for="(variant, index) in item.items"
              :key="variant.slug + index"
              class="variant-item-image"
              :class="{
                'selected': isVariantSelected(variant),
                'unavailable': !variant.is_available,
              }"
            >
              <fdk-link :link="getProductLink(variant)">
                <emerge-image
                  :src="getImageURL(variant)"
                  :sources="[{ width: 52 }]"
                  :alt="variant.name"
                />
                <div class="overlay"><span></span></div>
                <svg-wrapper
                  class="selected-icon"
                  :svg_src="'selected'"
                ></svg-wrapper>
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
            >
              <fdk-link :link="getProductLink(variant)" :title="variant.color_name">
                <div
                  :style="{
                    background: '#' + variant.color,
                  }"
                  class="color"
                  :class="{
                    'selected': isVariantSelected(variant),
                    'unavailable': !variant.is_available,
                  }"
                >
                  <div class="overlay"><span></span></div>
                  <svg-wrapper
                    class="selected-icon"
                    :svg_src="'selected'"
                  ></svg-wrapper>
                </div>
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
              :class="{
                'selected': isVariantSelected(variant),
                'unavailable': !variant.is_available,
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
  align-items: center;
  gap: 6px 8px;
  flex-wrap: wrap;
  padding: 5px 0px;
  &::-webkit-scrollbar {
    display: none;
  }
  .variant-item-image, .variant-item-color .color {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    padding: 1px;
    border: 1px solid #c9c9c9;
    @media @desktop {
      width: 56px;
      height: 56px;
    }
    &.selected{
      border: 1px solid var(--primaryColor);
    }
    &:not(.selected){
      .overlay, .selected-icon {
        display: none;
      }
    }
    &:is(.unavailable) {
      .overlay {
        display: block;
        background: rgba(255, 255, 255, 0.7);
        & > span {
          position: absolute;
          height: 80px;
          width: 80px;
          bottom: 0;
          border-left: 1px solid #c9c9c9;
          transform: rotate(45deg);
          transform-origin: bottom left;
        }
      }
    }
    &:hover {
      .overlay {
        display: block;
      }
    }
    .overlay {
      background: rgba(255, 255, 255, 0.4);
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
    .selected-icon {
      height: 25px;
      width: 25px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      fill: @PrimaryColor;
    }
  }
  .variant-item-image {
    display: inline-block;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .variant-item-color {
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    .color {
      width: 40px;
      height: 40px;
    }
  }
  .variant-item-text {
    display: inline-block;
    margin-bottom: 6px;
    border-radius: 4px;
    border: 1px solid #c9c9c9;
    padding: 4px 12px;
    color: @PrimaryColor;
    cursor: pointer;
    position: relative;
    &:not(.unavailable):hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    &.selected {
      background-color: rgba(0, 0, 0, 0.1);
      border-color: @PrimaryColor;
    }
    &.unavailable {
      color: #c9c9c9;
      background: linear-gradient(to top left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) calc(50% - 0.8px), #c9c9c9 50%, rgba(0, 0, 0, 0) calc(50% + 0.8px), rgba(0, 0, 0, 0) 100%);
    }
  }
}
</style>

<script>
import emergeImage from "./../../global/components/common/emerge-image.vue";
import SvgWrapper from "../../components/common/svg-wrapper.vue";

export default {
  name: "product-variants",
  components: {
    "emerge-image": emergeImage,
    "svg-wrapper": SvgWrapper,
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
      if (Array.isArray(this.product.medias) && this.product.medias.length > 0) {
        return this.product.medias[0].url;
      }
      return "";
    },
    isVariantSelected(item) {
      return item.slug === this.$route.params.slug;
    },
  },
};
</script>

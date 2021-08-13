<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <h1 class="section-heading" v-if="settings && settings.props.heading.value">
      {{ settings.props.heading.value }}
    </h1>
    <div class="section__items">
      <div
        class="item"
        :class="{
          'item__two-item': settings.props.item_count.value === 2,
          'item__three-item': settings.props.item_count.value === 3,
          'item__four-item': settings.props.item_count.value === 4,
          'item__five-item': settings.props.item_count.value === 5,
        }"
        v-for="(product, index) in products"
        :key="'feat-item-' + index"
        target="_blank"
      >
        <!-- {{ block }} -->
        <fdk-link
          :link="`/product/${product.slug}`"
          class="product-link"
          v-if="product"
        >
          <nm-image
            :alt="product.name"
            class="product-image"
            :src="product.medias.length > 0 ? product.medias[0].url : ''"
            :title="product.name"
          ></nm-image>
        </fdk-link>
        <fdk-placeholder type="product-2" v-else />
        <h3 class="product-title" v-if="product && product.name">
          {{ product.name }}
        </h3>
        <h3 class="product-title" v-else>Product{{ index }}</h3>
      </div>
    </div>
    <div v-if="products.length === 0">
      <placeholder-items
        :count="10"
        type="collection-1"
        text="Product"
        :layout="`grid`"
      />
    </div>
  </div>
</template>
<settings>
{
  "name": "featuredProducts",
  "label": "Featured Products",
  "blocks": [
    {
      "type": "product",
      "name": "Product",
      "props": [
        {
          "type": "product",
          "id": "product",
          "label": "Select a Product",
          "info":"Product Item to be displayed"
        }
      ]
    }
  ],
  "props": [
    {
      "type": "text",
      "id": "heading",
      "default": "Featured Products",
      "label": "Section Heading"
    },
    {
      "type": "range",
      "id": "item_count",
      "min": 2,
      "max": 5,
      "step": 1,
      "unit": "",
      "label": "Products per row",
      "default": 4,
      "info": "Maximum items allowed per row"
    },
      {
      "type":"checkbox",
      "id":"full_width",
      "default": false,
      "label": "Full width",
      "info":"Check to allow items to take entire width of the viewport"
    }
  ],
  "preset":{
    "blocks":[
      {
        "name":"Product"
      },
       {
        "name":"Product"
      }    
    ]
  }
}
</settings>
<style scoped lang="less">
.item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  a {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .product-link {
    // display: block;
    text-align: center;
  }
  .product-image {
    /deep/ .nm__img {
      width: 100%;
      @media @mobile {
        width: 80%;
      }
    }
  }
  .product-title {
    margin-top: 10px;
    text-transform: uppercase;
    font-weight: 700;
    text-align: center;
  }
}
</style>
<script>
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";
import nmImage from "./../global/components/common/nm-image.vue";

export default {
  props: ["settings", "apiSDK", "serverProps"],
  components: {
    "nm-image": nmImage,
    "placeholder-items": placeholderItemsVue,
  },
  initializeServerProps({ apiSDK, settings }) {
    const products =
      settings?.blocks?.map((b) => {
        return b?.props?.product?.value;
      }) || [];
    return Promise.all(
      products.map((slug) => {
        return apiSDK.catalog.getProductDetailBySlug({
          slug,
        });
      })
    )
      .then((results) => {
        return results;
      })
      .catch((e) => console.log);
  },
  watch: {
    settings(newSettings, oldSettings) {
      if (newSettings?.blocks.length !== oldSettings?.blocks.length) {
        const products =
          newSettings?.blocks?.map((b) => {
            return b?.props?.product?.value;
          }) || [];
        Promise.all(products.map(this.getProductDetails))
          .then((results) => {
            this.products = results;
          })
          .catch((e) => console.log);
      }
    },
  },
  mounted() {
    if (
      !this.products.length ||
      this.products.length == 0 ||
      this.settings?.blocks?.length !== this.products?.length
    ) {
      const products =
        this.settings?.blocks?.map((b) => {
          return b?.props?.product?.value;
        }) || [];
      Promise.all(products.map(this.getProductDetails))
        .then((results) => {
          this.products = results;
        })
        .catch((e) => console.log);
    }
  },
  data() {
    return {
      products: this.serverProps || [],
    };
  },
  methods: {
    getProductDetails(slug) {
      if (!slug) return;
      return this.$apiSDK.catalog
        .getProductDetailBySlug({
          slug,
        })
        .then((res) => {
          return res || {};
        });
    },
  },
};
</script>

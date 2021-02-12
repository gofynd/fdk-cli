<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <h1
      class="section-heading"
      v-if="settings && settings.props.heading.value"
    >{{ settings.props.heading.value }}</h1>
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
      >
        <!-- {{ block }} -->
        <fdk-link :link="`/product/${product.slug}`" class="product-link">
          <img
            alt="Shop Now"
            class="product-image"
            :src="product.images[0].url"
            :title="product.name"
          />
        </fdk-link>
        <h3 class="product-title">{{ product.name }}</h3>
      </div>
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
  ]
}
</settings>
<style scoped lang="less">
.item {
  .product-link {
    display: block;
    text-align: center;
  }
  .product-image {
    width: 100%;
    @media @mobile {
      width: 80%;
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
export default {
  props: ["settings", "provider"],
  watch: {
    settings: function(newVal, oldVal) {}
  },
  mounted() {
    this.settings = this.settings || {};
    this.settings.blocks = this.settings.blocks || [];
    let products = this.settings.blocks.map(b => {
      b.props = b.props || {};
      b.props.product = b.props.product || {};
      return b.props.product.value;
    });
    Promise.all(products.map(this.getProductDetails))
      .then(results => {
        this.products = results;
      })
      .catch(e => console.log);
  },
  data: function() {
    return {
      products: []
    };
  },
  methods: {
    getProductDetails(slug) {
      return this.provider.ProductDetail.fetchProductDetails({
        slug,
        image_size: "med"
      }).then(res => {
        return res.data || {};
      });
    }
  }
};
</script>

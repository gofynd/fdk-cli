<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <h2 v-if="settings.props.heading.value" class="section-heading">
      {{ settings.props.heading.value }}
    </h2>
    <div class="section__items" v-if="products.length > 0">
      <div
        class="item"
        :class="{
          'item__two-item': settings.props.item_count.value === 2,
          'item__three-item': settings.props.item_count.value === 3,
          'item__four-item': settings.props.item_count.value === 4,
          'item__five-item': settings.props.item_count.value === 5,
        }"
        v-for="(product, index) in products"
        :key="'prod-item-' + index"
      >
        <!-- {{ block }} -->
        <fdk-link :link="`/product/${product.slug}`">
          <nm-image
            :alt="product.name"
            class="product-image"
            :src="product.medias[0].url"
            :title="product.name"
            :sources="[{ width: 275 }]"
          />
        </fdk-link>
        <p class="product-brand">{{ product.brand.name }}</p>
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="price">
          <span>
            <meta v-if="hasDiscount(product)" />
            <span class="strike-through list" v-if="hasDiscount(product)">
              <span class="value">
                {{ product.price.marked.currency_symbol }}
                {{ product.price.marked.max }}
              </span>
            </span>
            <span
              class="product-total-discount list"
              v-if="hasDiscount(product)"
            >
              <span class="value">{{ product.discount }}</span>
            </span>
            <meta />
            <span class="sales">
              <span class="value">
                {{ product.price.effective.currency_symbol }}
                {{ getPrice(product, "effective") }}
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
    <div v-else-if="products.length === 0">
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
    "name":"productList",
    "label":"Product List",
    "props":[
        {
            "type": "text",
            "id": "heading",
            "default": "Featured Collections",
            "label": "Collection Heading"
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
            "type": "collection",
            "id": "collection",
            "label": "Collection",
            "info":"Select a collection to display its products"
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
<script>
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";
import nmImage from "./../global/components/common/nm-image.vue";

export default {
  props: ["settings", "apiSDK", "serverProps"],
  initializeServerProps({ apiSDK, settings, route }) {
    const collection = settings?.props?.collection?.value;
    return apiSDK.catalog
      .getCollectionItemsBySlug({
        slug: collection,
      })
      .then((res) => {
        return res?.items || [];
      })
      .catch((e) => console.log(e));
  },
  components: {
    "nm-image": nmImage,
    "placeholder-items": placeholderItemsVue,
  },
  mounted() {
    if (this.products.length == 0) {
      const collection = this.settings?.props?.collection?.value;
      this.getProducts(collection);
    }
  },
  watch: {
    settings(n, o) {
      if (n?.props?.collection?.value !== o?.props?.collection?.value) {
        const collection = n?.props?.collection?.value;
        this.getProducts(collection);
      }
    },
  },
  data() {
    return {
      products: this.serverProps || [],
    };
  },
  methods: {
    getProducts(slug) {
      if (!slug) return;
      this.$apiSDK.catalog
        .getCollectionItemsBySlug({
          slug: slug,
        })
        .then((res) => {
          this.products = res?.items || [];
        });
    },
    getPrice(product, key) {
      if (product && product.price) {
        return product.price[key].min !== product.price[key].max
          ? product.price[key].min + " - " + product.price[key].max
          : product.price[key].min;
      }
    },
    hasDiscount(product) {
      return (
        this.getPrice(product, "effective") !== this.getPrice(product, "marked")
      );
    },
  },
};
</script>

<style lang="less" scoped>
.item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  a {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .product-image {
    /deep/ .nm__img {
      width: 100%;
    }
  }
  .product-brand {
    font-size: 12px;
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .product-name {
    font-size: 18px;
    margin-top: 5px;
    font-weight: 700;
  }

  .price {
    margin-top: 10px;
    font-size: 14px;
    .strike-through {
      text-decoration: line-through;
      color: #cacaca;
    }
    .product-total-discount {
      padding: 0 10px;
    }
    .sales {
      font-weight: 400;
      .value {
        font-size: 15px;
        font-weight: bold;
      }
    }
  }
}
</style>

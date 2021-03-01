<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <h2
      v-if="settings.props.heading.value"
      class="section-heading"
    >{{ settings.props.heading.value }}</h2>
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
          <img
            alt="Shop Now"
            class="product-image"
            :src="product.images[0].url"
            :title="product.name"
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
            <span class="product-total-discount list" v-if="hasDiscount(product)">
              <span class="value">{{ product.discount }}</span>
            </span>
            <meta />
            <span class="sales">
              <span class="value">
                {{ product.price.effective.currency_symbol }}
                {{ getPrice(product, 'effective') }}
              </span>
            </span>
          </span>
        </div>
        <!-- <div class="product-price">
          <span>
            <span class="strike-through list" v-if="hasDiscount()">
              <span class="value">
                {{ product.price.marked.currency_symbol }}
                {{ product.price.marked.max | currencyformat }}
              </span>
            </span>
            <span class="product-total-discount list" v-if="hasDiscount()">
              <span class="value">{{ product.discount }}</span>
            </span>
            <span class="sales">
              <span class="value">
                {{ product.price.marked.currency_symbol }}
                {{ getPrice(product, 'effective') | currencyformat }}
              </span>
            </span>
          </span>
        </div>-->
      </div>
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
            "label": "Collections per row",
            "default": 2,
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
export default {
  props: ["settings", "provider"],
  mounted() {
    this.settings = this.settings || {};
    this.settings.props = this.settings.props || {};

    let { collection } = this.settings.props;
    collection = collection.value;

    this.getProducts(collection)
      .then(results => {
        results = results || {};
        results.items = results.items || [];
        this.products = results.items;
      })
      .catch(e => console.log);
  },
  data: function() {
    return {
      products: []
    };
  },
  methods: {
    getProducts(slug) {
      return this.provider.ProductListing.fetchCollectionListing({
        id: slug,
        image_size: "med"
      }).then(res => {
        return res.data || {};
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
    }
  }
};
</script>

<style lang="less" scoped>
.item {
  .product-image {
    width: 100%;
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

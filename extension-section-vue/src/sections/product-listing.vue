<template>
    <div class="main-div">
        <h1>Header - {{ getHeader }}</h1>
        <h2>Product List using Extension for Jetfire</h2>

        <div v-if="products.length == 0" class="no-product">
            No Products Found
        </div>
        <div class="container" v-else>
            <div
                v-for="product in products"
                :product="product"
                :key="product.slug"
                class="product"
            >
                <h1>{{ product.name }}</h1>
                <h2>{{ product.slug }}</h2>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'test',
    props: ['settings', 'apiSDK', 'serverProps', 'global_config'],
    async initializeServerProps({ settings, apiSDK }) {
        try {
            const data = await apiSDK.catalog.getProducts({
                pageId: '*',
                pageSize: 12,
            });
            return data;
        } catch (error) {
            console.log(error);
        }
    },
    data() {
        return {
            products: this.serverProps?.items || [],
        };
    },
    computed: {
        getHeader() {
            return this.settings?.props?.heading?.value;
        },
    },
    async mounted() {
        try {
            const data = await this.$apiSDK.catalog.getProducts({
                pageId: '*',
                pageSize: 12,
            });
            this.products = data?.items;
        } catch (error) {
            console.log(error);
        }
    },
};
</script>

<settings>
    {
      "name": "product-listing",
      "label": "product-listing",
      "props": [
        {
          "type": "text",
          "id": "heading",
          "default": "Products",
          "label": "Heading",
          "info":"Heading text of the section"
        }
      ],
      "blocks": [],
      "preset": {}
    }
  </settings>

<style lang="less" scoped>
.main-div {
    h1 {
        color: blue;
    }
    h2 {
        color: orange;
    }
    .no-product {
        color: red;
    }
    .container {
        display: flex;
        .product {
            border: 1px solid green;
            h1 {
                color: green;
            }
            h2 {
                color: green;
            }
        }
    }
}
</style>

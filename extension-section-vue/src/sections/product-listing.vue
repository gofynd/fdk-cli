<template>
    <div class="main-div">
        <h1>Product List using Extension for Jetfire</h1>
        <h2>Header - {{ getHeader }}</h2>

        <div class="container">
            <ProductCard
                v-for="(product) in products"
                :product="product"
                :key="product.slug"
            />
        </div>
    </div>
</template>

<script>
import ProductCard from './../components/product-card.vue';
export default {
    name: 'test',
    props: ['settings', 'apiSDK', 'serverProps', 'global_config'],
    initializeServerProps({ settings, apiSDK }) {
        return Promise.all(
            apiSDK.catalog.getProducts({
                pageId: '*',
                pageSize: 12,
            }),
        )
            .then((results) => {
                console.log('section result', results);
                return results;
            })
            .catch((e) => console.log(e));
    },
    data() {
        return {
            products: this.serverProps || [],
        };
    },
    computed: {
        getHeader() {
            return this.settings?.props?.heading?.value;
        },
    },
};
</script>

<settings>
    {
      "label": "Products List",
      "name": "product-list",
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
    .container {
        display: flex;
    }
}
</style>

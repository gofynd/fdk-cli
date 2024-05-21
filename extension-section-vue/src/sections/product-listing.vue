<template>
    <div class="main-div">
        <h1>Header - {{ getHeader }}</h1>
        <h2>Product List using Extension for Jetfire</h2>

        <div v-if="products.length == 0">No Products Found</div>
        <div class="container" v-else>
            <ProductCard
                v-for="product in products"
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
    async initializeServerProps({ settings, apiSDK }) {
        console.log('initializeServerProps entered');
        try {
            const data = await apiSDK.catalog.getProducts({
                pageId: '*',
                pageSize: 12,
            });
            console.log('product listing mserverfetch data', data);
            return data;
        } catch (error) {
            console.log(error);
        }
    },
    data() {
        console.log('section data load', this.serverProps);
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
        console.log('product listing mounted serverProps', this.serverProps);
        try {
            const data = await this.$apiSDK.catalog.getProducts({
                pageId: '*',
                pageSize: 12,
            });
            console.log('product listing mounted data', data);
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
    .container {
        display: flex;
    }
}
</style>

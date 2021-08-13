<template>
  <div class="section-main-container">
    <h2 v-if="settings.props.heading.value" class="section-heading">
      {{ settings.props.heading.value }}
    </h2>
    <div>
      <fdk-infinite-scrolling
        @loadmore="loadMoreWLData()"
        :loadingData="loading"
      >
        <div v-if="products.length > 0">
          <div class="product-container">
            <div
              v-for="(product, index) in products"
              :key="index + '-product.uid'"
            >
              <div @click="redirectToProduct('/product/' + product.slug)" class="product-item">
                <product-card :product="product" :context="context">
                </product-card>
                <fdk-product-card>
                  <template slot-scope="productData">
                    <button
                      class="button-no-defaults link-text ukt-links removeBtn"
                      @click="productData.updateWishList($event, product)"
                    >
                      Remove
                    </button>
                  </template>
                </fdk-product-card>
              </div>
            </div>
          </div>
        </div>
        <fdk-loader v-else-if="isLoading" />
        <fdk-empty-state
          v-else-if="products.length === 0 && isMounted"
          :title="'No wishlist items found'"
        ></fdk-empty-state>
      </fdk-infinite-scrolling>
    </div>
  </div>
</template>
<settings>
{
    "name":"infiniteWishlistListing",
    "label":"Infinite Wishlist Listing",
    "pages": ["wishlist"],
    "props":[
        {
            "type": "text",
            "id": "heading",
            "default": "",
            "label": "Wishlist List Heading"
        }
    ]
}
</settings>
<script>
import productcard from "./../global/components/product-card.vue";

export default {
  data() {
    return {
      products: [],
      isLoading: false,
      isMounted: false,
      page: { current: 0, has_next: true },
      context: {},
    };
  },
  props: ["settings", "apiSDK"],
  mounted() {
    this.isMounted = true;
    this.fetchWishlist();
  },
  components: {
    "product-card": productcard,
  },
  methods: {
    loadMoreWLData() {
      this.fetchWishlist();
    },
    fetchWishlist() {
      if (this.page && this.page.has_next && !this.isLoading) {
        this.isLoading = true;
        let pageObj = {};
         pageObj.collectionType = "products";
        if (this.page?.next_id) {
          pageObj.pageId = this.page.next_id; //NOTe: this is custom code for wishlist
        }
        this.$apiSDK.catalog.getFollowedListing(pageObj).then((data) => {
          this.page = data.page;
          data.items.map((item) => {
            item.follow = true;
          });
          this.products = [...this.products, ...data.items]; //NOTE: it is data.items for products listing, but different for wishlist
          this.isLoading = false;
        });
      }
    },
  },
};
</script>
<style lang="less" scoped>
.section-main-container {
  position: relative;
  margin-bottom: 0;
  background-color: #fff;
}
.section-heading {
  padding: 20px 0 0 0;
  font-size: 30px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 30px;
  text-align: left;
}
.product-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
  grid-auto-rows: auto;
  grid-gap: 3em;
  padding-top: 0;
}
.product-item{
  height: 100%;
}
.loader-center {
  grid-column-start: -1;
  grid-column-end: 1;
}
@media screen and (max-width: 768px) {
  .product-container {
    grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
    grid-gap: 0.5em;
    padding: 0.5em;
    & > div {
      margin-bottom: 25px;
    }
  }
}
</style>

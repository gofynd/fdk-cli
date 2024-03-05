<template>
  <div class="wl-cont" :style="global_config ? 'color:' + global_config.props.text_body_color : ''">
    <div v-if="context.favourites && context.favourites.loading">
      <fdk-loader></fdk-loader>
    </div>
    <template
      v-if="
        context &&
          context.favourites &&
          context.favourites.items &&
          context.favourites.items.length
      "
    >
      <div class="">
        <h2 class="heading">
          Wishlist
        </h2>
        <div>
          <fdk-infinite-favourites>
            <template slot-scope="infiniteLoaderData">
              <div class="grid-wrapper">
                <div class="group-cards">
                  <div
                    v-for="(product, index) in context.favourites.items"
                    :key="`p-wl-${index}`"
                  >
                    <fdk-link
                      :link="redirectPdp(product)"
                      class="wl-link"
                    >
                      <fy-product-card
                        :showWishlist="true"
                        :isWishListPage="true"
                        :product="product"
                        :global_config="global_config"
                      />
                    </fdk-link>
                  </div>
                   <fdk-loader
              id="loader"
              v-if="infiniteLoaderData.hasNext"
            ></fdk-loader>
                </div>

              </div>

            </template>
          </fdk-infinite-favourites>
        </div>
      </div>
    </template>
    <div v-else-if="context.favourites && !context.favourites.loading && !context.favourites.items.length">
      <fdk-empty-state title="Your Wishlist is empty." />
    </div>
  </div>
</template>
<style lang="less" scoped>
.wl-cont {
  min-height: 600px;
  background: @White;
  h2.heading {
    padding: 30px 0 0 20px;
    font-size: 30px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 30px;
    text-align: left;
  }
  .wl-link {
    -webkit-tap-highlight-color: transparent;
  }
  .grid-wrapper {
    margin: 0 20px;
  }
  .group-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15%, 1fr));
    grid-auto-rows: auto;
    grid-gap: 2em;
  }
  @media screen and (max-width: 768px) {
    .group-cards {
      grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
      grid-gap: 0.5em;
    }
  }
}
</style>
<script>
import productCard from "./../../global/components/fy-product-card.vue";
import loader from "./../../templates/components/loader.vue";

export default {
  name: "wishlist",
  components: {
    loader: loader,
    "fy-product-card": productCard,
  },
  methods: {
    redirectPdp(product) {
      if (product.sellable) {
        return `/product/${product.slug}`;
      }
      return;
    }
  },
};
</script>

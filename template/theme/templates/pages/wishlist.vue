<template>
  <div class="wishlist-pg">
    <div
      class="wishlistItemCards"
    >
      <div class="account-top-section">
        <h4 class="wishlist-title">Wishlist</h4>

        <div class="content-asset">
          <p
            class="cart-wishlist-text"
          >Create your wishlist by clicking the heart icon next to any product. You can see all your liked products here.</p>
        </div>
      </div>
    </div>
    <div class="main-product-container">
          <div class="product-container">
            <div v-for="(product, index) in context.favourites.data" :key="index + '-product.uid'">
              <div @click="redirectToProduct('/product/'+ product.slug)">
                <product-card :product="product" :context="context"></product-card>
              </div>
            </div>
          </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.wishlist-pg {
  background-color: #ffffff;
  padding: 20px 0;
}
.main-product-container {
  width: 100%;
  max-width: 1200px;
  min-width: 1200px;
  margin: 0 auto 100px auto;
  padding: 50px 0;

  .product-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
    grid-auto-rows: auto;
    grid-gap: 3em;
    padding-top: 0;
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
}

@media (min-width: 0px) and (max-width: 991.98px) {
  .main-product-container {
    min-width: auto;
  }
}
.wishlistItemCards {
  max-width: 1200px;
  margin: 0 auto;
}
.account-top-section {
    border: 1px solid #e9e9e9;
    display: block;
    font-family: Roboto,sans-serif;
    font-size: .75rem;
    position: relative;
    letter-spacing: .5px;
    letter-spacing: .03125rem;
    padding: 27px 20px 35px;
    padding: 1.6875rem 1.25rem 2.1875rem;
    margin-bottom: 38px;
    margin-bottom: 2.375rem;
    .wishlist-title {
        font-size: 1.125rem;
        font-weight: 700;
        text-transform: uppercase;
        margin: 0px;
        margin: 0rem;
    }
}

.account-top-section p {
    font-size: 0.75rem;
    margin: 0px 0px 10px 0px;
    margin: 0rem 0rem 0.625rem 0rem;
    line-height: 21px;
    line-height: 1.3125rem;
    letter-spacing: 0.5px;
    letter-spacing: 0.03125rem;
    max-width: 760px;
    max-width: 47.5rem;
}
@media (min-width: 768px)  {
  .account-top-section p {
      font-size: 0.875rem;
      line-height: 24px;
      line-height: 1.5rem;
  }
}

@media(min-width: 992px) {
    .account-top-section {
        padding:37px 40px;
        padding: 2.3125rem 2.5rem
    }
}

.account-top-section .heading {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: justify;
    justify-content: space-between
}

.account-top-section .title {
    font-family: roboto condensed,sans-serif;
    font-size: .875rem;
    font-weight: 700;
    display: inline-block;
    margin-top: 0;
    padding: 0
}

</style>
<script>
import productcard from "./../../global/components/product-card.vue";
export default {
  data() {
    return {
      favourites: []
    };
  },
  components: {
    "product-card": productcard
  },
  methods: {
    redirectToProduct: function redirectToProduct(productUrl) {
      this.$router.push(productUrl);
    }
  },
  watch: {
    context: function(newValue) {
      console.log("newValue ----- ", newValue);
      this.context = newValue;
    }
  }
};
</script>
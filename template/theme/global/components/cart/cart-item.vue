<template>
  <div class="cart-item">
    <div class="cart-image">
      <fdk-link :link="`/product/${item.product.slug}`">
        <img :src="item.product.images[0].url" alt="" />
      </fdk-link>
    </div>
    <div class="product-details">
      <div class="details">
        <p class="product-name">
          {{ item.product.name }}
        </p>
        <div class="product-attr">
          <div>
            <span class="brand">Brand: </span>
            <span>{{ item.product.brand.name }}</span>
          </div>
          <div>
            <span class="size">Size: </span>
            <span>{{ item.article.size }}</span>
          </div>
        </div>
      </div>

      <fdk-cart class="quantity-container">
        <template slot-scope="cart">
          <div class="quantity">
            <div
              class="quantity__button minus"
              @click="updateCart(cart.updateCart, item, 'dec')"
            >
              <fdk-inline-svg src="minus-black" />
            </div>
            <div class="quantity__input">
              {{ item.quantity }}
            </div>
            <div
              class="quantity__button plus"
              @click="updateCart(cart.updateCart, item, 'inc')"
            >
              <fdk-inline-svg src="plus-black" />
            </div>
          </div>
          <div class="cart-price">
            {{ item.price.base.currency_symbol }}

            {{ item.price.base.effective }}
          </div>
          <div
            class="remove-item"
            @click="updateCart(cart.updateCart, item, 'del')"
          >
            <fdk-inline-svg src="cross-black" />
          </div>
        </template>
      </fdk-cart>
    </div>
    <p class="cart-error" v-if="item.availability.out_of_stock">
      Out of stock. Please remove item or adjust quantity
    </p>
  </div>
</template>

<script>
export default {
  name: 'cart-item',
  props: ['item'],
  methods: {
    updateCart(func, item, operation) {
      console.log(func, item, operation);
      this.$emit('update-cart', { func, item, operation });
    },
  },
};
</script>

<style lang="less" scoped>
.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  border-top: 1px solid #ccc;

  position: relative;
  .cart-image {
    max-width: 90px;
    img {
      max-width: 100%;
    }
  }
  .product-details {
    width: calc(100% - 100px);
    display: flex;
    justify-content: space-between;
    @media @mobile {
      flex-direction: column;
      justify-content: flex-start;
    }
    .details {
      width: 250px;
      margin-left: 10px;
      @media @mobile {
        margin: 0;
      }
      .product-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .product-attr {
        div {
          margin-bottom: 10px;
        }
        .brand,
        .size {
          text-transform: uppercase;
          width: 50%;
          float: left;
        }
      }
    }

    .quantity-container {
      display: flex;
      height: 26px;
      align-items: center;
      .quantity {
        background: white;
        display: flex;
        height: 24px;

        border: 1px solid #ccc;
        &__button {
          width: 20px;
          cursor: pointer;
        }
        .minus {
          border-right: 1px solid #ccc;
        }
        .plus {
          border-left: 1px solid #ccc;
        }
        &__input {
          padding: 5px 10px;
          border: none;
          text-align: center;
        }
      }
      .cart-price {
        margin-left: 20px;
        width: 100px;
      }
    }
  }

  .remove-item {
    position: absolute;
    top: 2px;
    cursor: pointer;
    right: 0;
  }
  .cart-error {
    position: absolute;
    top: 120px;
    left: 110px;
    color: red;
    @media @mobile {
      position: absolute;
      top: 150px;
      left: 100px;
      color: red;
      font-size: 10px;
    }
  }
}
</style>

<template>
  <div class="cart-item-container">
    <div class="cart-item">
      <div class="cart-image">
        <fdk-link :link="`/product/${item.product.slug}`">
          <nm-image
            :src="item.product && item.product.images[0].url"
            :sources="[{ width: 360 }]"
            :alt="item.product.name"
          />
        </fdk-link>
      </div>
      <div class="product-details">
        <div class="details">
          <p class="product-name">
            {{ item.product.name }}
          </p>
          <div class="store-info">
            Sold by: {{ item.article.store.name + "," }}
            {{ item.article.seller.name }}
          </div>
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
          <div
            v-if="item.coupon_message && item.coupon_message != ''"
            class="offers-container"
          >
            <span class="offer-applied">{{ item.coupon_message }}</span>
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
              <span>
                {{ item.price.base.currency_symbol }}
                {{ item.price.base.effective }}
              </span>
              <span
                v-if="item.price.base.effective !== item.price.base.marked"
                class="marked-price"
              >
                {{ item.price.base.currency_symbol }}
                {{ item.price.base.marked }}
              </span>
            </div>
            <div
              class="remove-item"
              @click="updateCart(cart.removeCart, item, 'del')"
            >
              <fdk-inline-svg src="cross-black" />
            </div>
          </template>
        </fdk-cart>
      </div>
    </div>
    <div class="cart-error">
      <span v-if="showQuantityError">
        Max Quantity: {{ item.article.quantity }}
      </span>
      <span
        v-if="item.availability.out_of_stock"
        :class="{ 'space-left': showQuantityError }"
      >
        Out of stock. Please remove item or adjust quantity
      </span>
    </div>
  </div>
</template>

<script>
import nmImageVue from "../common/nm-image.vue";

export default {
  name: "cart-item",
  props: ["item"],
  components: {
    "nm-image": nmImageVue,
  },
  data() {
    return {
      showQuantityError: false,
    };
  },
  methods: {
    updateCart(func, item, operation) {
      let total = this.item.quantity;
      let stotal = operation === "inc" ? total + 1 : total - 1;
      if (stotal > this.item.article.quantity) {
        this.showQuantityError = true;
        setTimeout(() => {
          this.showQuantityError = false;
        }, 3000);
        return;
      } else {
        this.showQuantityError = false;
      }
      this.$emit("update-cart", { func, item, operation });
    },
  },
};
</script>

<style lang="less" scoped>
.cart-error {
  color: red;
  margin-left: 100px;
  margin-top: 12px;
  // @media only screen and (max-width: 600px) {
  //   margin-top: 6px;
  // }
  .space-left {
    margin-left: 6px;
  }
}
.offers-container {
  display: flex;
  align-items: center;

  .offer-applied {
    color: #20ce81;
    font-weight: 300;
    font-size: 13px;
  }
}
.cart-item-container {
  padding: 20px 0;
  border-top: 1px solid #ccc;
  position: relative;
}
.cart-item {
  display: flex;
  justify-content: space-between;

  .cart-image {
    max-width: 90px;
    /deep/ .nm__img {
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
      .store-info {
        margin-bottom: 10px;
        color: #909090;
        line-height: 20px;
        font-weight: 300;
        text-transform: lowercase;
        font-size: 14px;
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
        .marked-price {
          margin: 4px 0px 0px 0px;
          font-size: 13px;
          text-decoration: line-through;
          color: #41434c;
        }
      }
    }
  }

  .remove-item {
    position: absolute;
    top: 2px;
    cursor: pointer;
    right: 0;
  }
}
</style>

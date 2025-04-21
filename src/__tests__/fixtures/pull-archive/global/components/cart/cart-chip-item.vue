<template>
  <div class="bag-item">
    <fdk-cart>
      <template slot-scope="cart">
        <div class="chip regular-xxs">
          <div class="product-metas">
            <div v-if="chiptype === 'pdp' || chiptype === 'review'">
              <span class="strong bold-xxs">{{ item.article.size }}</span>
              <span class="strong bold-xxs">|</span>
            </div>
            <div v-if="chiptype === 'bag'">
              <select
                class="custom-select"
                @change="onSizeChange($event, cart)"
              >
                <option
                  v-for="(opt, index) in arrSizes"
                  :key="index"
                  :selected="opt === item.article.size"
                  >{{ opt }}</option
                >
              </select>
            </div>
            <div class="price-cntr">
              <span class="effective-price strong bold-xxs">
                <template v-if="item.is_set">
                  {{ item.price_per_unit.converted.effective | currencyformat }}
                  /Pcs
                </template>
                <template v-else>
                  {{ item.price.converted.effective | currencyformat }}
                </template>
              </span>
              <span
                class="marked-price"
                v-if="
                  item.price.converted.effective !== item.price.converted.marked
                "
              >
                <template v-if="item.is_set">
                  {{ item.price_per_unit.converted.marked | currencyformat }}
                  /Pcs
                </template>
                <template v-else>
                  {{ item.price.converted.marked | currencyformat }}
                </template>
              </span>
            </div>
            <div class="discount-cntr">
              <span class="discount regular-xxxs">
                {{ item.article.discount }}
              </span>
            </div>
          </div>

          <div class="right-items">
            <div class="quantity-container">
              <div class="quantity">
                <quantity-ctrl
                  v-if="chiptype !== 'review'"
                  :currquantity="item.quantity"
                  v-on:inc-quantity="
                    updateCart($event, cart.updateCart, item, 'dec')
                  "
                  v-on:dec-quantity="
                    updateCart($event, cart.updateCart, item, 'inc')
                  "
                  v-on:change-qty="changeQuantity($event, cart)"
                  :isdisabled="chiptype === 'review'"
                  ref="qty"
                ></quantity-ctrl>
                <span v-if="chiptype === 'review'" class="light-xxs">
                  {{ item.quantity }}
                  <template v-if="item.quantity > 1">Pieces</template>
                  <template v-if="item.quantity == 1">Piece</template>
                </span>
              </div>
            </div>
            <div
              class="remove"
              @click="removeCart(cart.removeCart, item)"
              v-if="chiptype == 'pdp' || chiptype == 'bag'"
            >
              <fdk-inline-svg :src="'cross-grey'"></fdk-inline-svg>
            </div>
          </div>
        </div>

        <div class="max-avail chip regular-xxs" v-if="showQuantityError">
          Max Quantity: {{ item.article.quantity }}
        </div>
        <div
          v-if="
            (chiptype === 'pdp' || chiptype === 'bag') &&
              item.availability.out_of_stock
          "
          class="chip out-of-stock regular-xxs"
        >
          {{ item.message }}
        </div>
        <div
          v-if="item.coupon_message && item.coupon_message != ''"
          class="offers-container chip regular-xxs"
        >
          <span class="offer-applied light-xxs">{{ item.coupon_message }}</span>
        </div>
        <div
          v-if="item.bulk_message && item.bulk_message != ''"
          class="offers-container chip regular-xxs"
        >
          <span class="offer-applied light-xxs">{{ item.bulk_message }}</span>
        </div>
      </template>
    </fdk-cart>
  </div>
</template>

<script>
import quantityctrl from "./quantity-ctrl.vue";

export default {
  name: "bag-chip-item",
  props: {
    item: {},
    chiptype: {
      type: String,
      enum: ["pdp", "bag", "review"],
    },
    updateCartSize: {},
  },
  components: {
    "quantity-ctrl": quantityctrl,
  },
  computed: {},
  methods: {
    updateCart(total, func, item, operation) {
      let stotal =
        operation === "qty"
          ? total
          : operation === "inc"
          ? total + 1
          : operation === "dec"
          ? total - 1
          : total;
      if (stotal > this.item.article.quantity&&operation === "inc") {
        this.$refs["qty"].resetQuantity(item.quantity);
        this.showQuantityError = true;
        setTimeout(() => {
          this.showQuantityError = false;
        }, 3000);
        return;
      }else if(stotal > this.item.article.quantity&&operation === "dec"){
        item.quantity=this.item.article.quantity+1
        this.showQuantityError = false;
      }  else {
        this.showQuantityError = false;
      }
      this.$emit("update-cart", { func, item, operation });
    },
    removeCart(func, item, operation) {
      this.$emit("remove-cart", { func, item });
    },
    changeQuantity(total, cart) {
      if (this.item.availability.out_of_stock) {
        this.showQuantityError = false;
        total = this.item.article.quantity;
        this.updateQuantity(total, cart);
      } else if (total > this.item.article.quantity) {
        this.$refs["qty"].resetQuantity(this.item.quantity);
        this.showQuantityError = true;
        setTimeout(() => {
          this.showQuantityError = false;
        }, 3000);
        return;
      } else if (total === 0) {
        this.showQuantityError = false;
        this.removeFromCart(cart);
      } else {
        this.showQuantityError = false;
        this.updateQuantity(total, cart);
      }
    },
    onSizeChange(event, cart) {
      let data = {
        item_id: this.item.product.uid,
        item_size: event.target.value,
        article_id: this.item.key,
        quantity: this.item.quantity,
        item_index: this.item.item_index,
        identifiers: this.item.identifiers,
      };
      this.showQuantityError = false;
      this.updateCart(this.item.quantity, cart.updateCart, data, "size");
    },
    updateQuantity(quantity, cart) {
      let data = {
        item_id: this.item.product.uid,
        quantity: Number(quantity),
        article_id: this.item.key,
        item_size: this.item.article.size,
        item_index: this.item.item_index,
        identifiers: this.item.identifiers,
      };
      this.showQuantityError = false;
      this.updateCart(quantity, cart.updateCart, data, "qty");
    },
    removeFromCart(cart) {
      let data = {
        item_id: this.item.product.uid,
        quantity: Number(this.item.quantity),
        article_id: this.item.key,
        item_size: this.item.article.size,
        item_index: this.item.item_index,
        identifiers: this.item.identifiers,
      };
      this.showQuantityError = false;
      this.$emit("remove-cart", { item: data, func: cart.removeCart });
    },
  },
  data() {
    return {
      showQuantityError: false,
      arrSizes:
        this.item.availability.sizes.filter(
          (it) => it === this.item.article.size
        ).length > 0
          ? this.item.availability.sizes
          : [].concat(this.item.article.size),
    };
  },
};
</script>

<style lang="less" scoped>
::v-deep .right-items {
  display: flex;
  margin-left: auto;
  align-content: center;
  @media @mobile {
    margin-left: 0;
  }
  .remove {
    cursor: pointer;
    .flex-center();
    margin-left: 15px;
  }
}
.bag-item {
  position: relative;
  width: 100%;
  background-color: @Alabaster2;
  margin: 10px 0px;
  padding-bottom: 10px;
  /*max-width: 450px;*/
}
.out-of-stock {
  color: @Required;
}
.custom-select {
  width: 100%;
  min-width: 42px;
  margin-right: 10px;
  padding: 0 20px 0 5px;
  text-overflow: ellipsis;
}
.strong {
  color: @Mako;
}
.offers-container {
  display: flex;
  align-items: center;
  .offer-applied {
    color: @Profit;
  }
}
.max-avail {
  text-align: left;
  color: @Required;
}
::v-deep .chip {
  padding: 10px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  padding-bottom: 0;
  @media @mobile {
    align-items: flex-start;
    flex-direction: column;
  }
  .product-metas {
    display: flex;
    align-items: center;
    @media @mobile {
      flex-wrap: column;
      align-items: center;
    }
    .price-cntr {
      margin: 0px 0px 0px 5px;
      @media @mobile {
        margin: 0px;
      }
    }
    .effective-price {
      line-height: inherit;
      font-weight: 700;
    }
    span {
      margin: 0px 2px;
    }
    .discount {
      color: @Required;
    }
  }
  ::v-deep .right-items {
    display: flex;
    margin-left: auto;
    align-content: center;
    @media @mobile {
      margin-left: 0;
    }
    .remove {
      cursor: pointer;
      .flex-center();
      margin-left: 15px;
    }
  }
}
::v-deep .quantity-container {
  display: flex;
  height: 26px;
  align-items: center;
  .quantity {
    background: white;
    display: flex;
    height: 24px;

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
</style>

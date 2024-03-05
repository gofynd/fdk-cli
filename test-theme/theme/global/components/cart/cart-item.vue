<template>
  <fdk-product-card>
    <template slot-scope="productData">
      <fdk-accounts>
        <template scope="accountsData">
          <div class="bag">
            <div>
              <div
                class="bag-left"
                v-bind:class="{ outofStock: item.availability.out_of_stock }"
              >
                <fdk-link :link="`/product/${item.product.slug}`">
                  <emerge-image
                    :src="item.product.images[0].url"
                    :sources="[{ width: 110 }]"
                  />
                </fdk-link>
              </div>
              <div class="bag-right">
                <div class="bag-brand-name">
                  <div
                    class="bag-brand bold-sm"
                    v-bind:class="{
                      outofStock: item.availability.out_of_stock,
                    }"
                  >
                    {{ item.product.brand.name }}
                  </div>
                  <div
                    class="view-ladder-price-option"
                    v-if="isLadderPricing"
                    @click="openLadderPopup"
                  >
                    View Price Options
                    <svg-wrapper class="price-option-icon" :svg_src="'info-grey'"></svg-wrapper>
                  </div>
                </div>
                <ladder-pricing-popup
                  v-if="isShowLadderPopup"
                  @close_ladder_popup="closeLadderPopup"
                  :item="item"
                />
                <div
                  class="bag-name light-xs"
                  v-bind:class="{ outofStock: item.availability.out_of_stock }"
                >
                  <fdk-link :link="`/product/${item.product.slug}`">
                    {{ item.product.name }}
                  </fdk-link>
                </div>
                <div
                  class="bag-name soldby light-xs"
                  v-bind:class="{ outofStock: item.availability.out_of_stock }"
                >
                  Sold by: {{ item.article.store.name + "," }}
                  {{ item.article.seller.name }}
                </div>
                <chip-item
                  class="desktop"
                  :item="getItem"
                  :chiptype="'bag'"
                  @remove-cart="modalHandle"
                  @update-cart="updateCart"
                ></chip-item>
                <div class="bag-name">
                  <span class="bold-xs">
                    Total: {{ getTotal() | currencyformat }}</span
                  >
                  <span class="light-xs">
                    (1 Size, {{ getPieces() }} Piece{{
                      getPieces() > 1 ? "s" : ""
                    }})</span
                  >
                </div>
              </div>
              <div class="bag-bottom mobile">
                <template>
                  <chip-item
                    :item="item"
                    :chiptype="'bag'"
                    @remove-cart="modalHandle"
                    @update-cart="updateCart"
                  ></chip-item>
                </template>
              </div>
            </div>
            <div class="links">
              <a class="" @click="modalHandle()"> REMOVE PRODUCT </a>
              <a
                class=""
                @click="wishlistAction($event, productData, accountsData, item)"
              >
                BUY LATER
              </a>
            </div>
            <modal
              class="product-remove"
              :isOpen="confirmModalvisible"
              :title="'Remove Product'"
              @closedialog="confirmModalvisible = false"
            >
              <p class="message-body light-xs">
                Are you sure you want to remove this product from cart?
              </p>
              <div class="btn-container">
                <a
                  class="no-button bold-sm"
                  @click="confirmModalvisible = false"
                  >No</a
                >
                <div class="separator light-xxxxl">|</div>
                <a
                  class="yes-button bold-sm"
                  @click="removeFromCart"
                  >Yes</a
                >
              </div>
            </modal>
          </div>
        </template>
      </fdk-accounts>
    </template>
  </fdk-product-card>
</template>
<script>
import quantityctrl from "./quantity-ctrl.vue";
import chipitem from "./cart-chip-item.vue";
import emergeImage from "../../components/common/emerge-image.vue";
import modal from "../../../global/components/modal.vue";
import ladderPricePopup from "./ladder-price-popop.vue";
import SvgWrapper from '../../../components/common/svg-wrapper.vue';

export default {
  data() {
    return {
      confirmModalvisible: false,
      isShowLadderPopup: false,
    };
  },
  name: "cart-item",
  props: ["item", "updateCart", "removeCart", "cart"],
  components: {
    "quantity-ctrl": quantityctrl,
    "chip-item": chipitem,
    "emerge-image": emergeImage,
    "ladder-pricing-popup": ladderPricePopup,
    "svg-wrapper": SvgWrapper,
    modal,
  },
  computed:{
    getItem(){
      return this.item
    },
    isLadderPricing() {
      let getLadderPricing= this.item?.promotions_applied.find(val=>val.promotion_type== "ladder_price");
      return getLadderPricing;
    }
  },
  methods: {
    openLadderPopup() {
      const body = document.body;
      body.classList.add("no-scroll");
      this.isShowLadderPopup = true;
    },
    closeLadderPopup() {
      const body = document.body;
      body.classList.remove("no-scroll");
      this.isShowLadderPopup = false;
    },
    getTotal() {
      return this.item.article.price.converted.selling * this.item.quantity;
    },
    getPieces() {
      return this.item.quantity;
    },
    modalHandle() {
      this.confirmModalvisible = !this.confirmModalvisible;
    },
    removeFromCart() {
      this.confirmModalvisible = false;
      this.$emit("removeCart", { item: this.item, func: this.cart.removeCart });
    },
    wishlistAction(event, productData, accountsData) {
      if (accountsData.is_logged_in) {
        productData.updateWishList(
          event,
          this.item?.product,
          this.$emit("removeCart", {
            item: this.item,
            func: this.cart.removeCart,
          })
        );
      } else {
        accountsData.openLogin();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@media @mobile {
  /deep/.modal-container {
    width: 80% !important;
    height: auto !important;
  }
  /deep/.modal-header {
    padding: 10px 0 !important;
  }
}
/deep/.modal-body {
  margin-top: 0 !important;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;

  position: relative;
  .cart-image {
    max-width: 90px;
    img {
      max-width: 100%;
    }
  }
  .product-details {
    width: calc(100% - 80px);
    display: flex;
    // justify-content: space-between;
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
        margin-top: 10px;
        margin-bottom: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .product-attr {
        div {
          margin-bottom: 10px;
        }
        .brand,
        .size {
          // text-transform: uppercase;
          font-weight: bold;
          width: 50%;
          // float: left;
        }
      }
    }
  }

  .remove-item {
    position: absolute;
    top: 10px;
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
.outofStock {
  opacity: 0.3;
}
.bag {
  display: table;
  border-collapse: separate;
  border-spacing: 10px;
  border-bottom: 1px solid @LightGray;
  background-color: #ffffff;
  // box-shadow:2px 6px 4px rgba(0,0,0,.05);
  margin-bottom: 20px;
  // border-radius:8px;
  width: 100%;
  &:last-child {
    border-bottom: none;
  }
  .bag-left {
    display: table-cell;
    width: 125px;
    a {
      display: block;
    }
    img {
      max-width: 110px;
      max-height: 180px;
      cursor: pointer;
    }
  }
  .bag-right {
    display: table-cell;
    vertical-align: top;
    color: @Mako;
    width: 84%;
    .bag-brand {
      text-transform: uppercase;
    }

    .bag-name {
      color: @Mako;
      margin: 10px 0px;
      text-transform: capitalize;
      font-weight: 700;
      .bag-edit {
        max-width: 75px;
        border-radius: @border-radius;
        padding: 10px 20px;
        margin: 5px 0px;
        display: inline-flex;
      }
    }
    .soldby {
      color: #909090;
      line-height: 20px;
      font-weight: 300;
      text-transform: lowercase;
      font-size: 14px;
    }
    .qty-control {
      .flex-center();
      border: 1px solid @LightGray;
      .operator {
        cursor: pointer;
        width: 24px;
        height: 24px;
        background: @White;
        display: inline-block;
        border: none;
        cursor: pointer;
        padding: 2px;
        &:hover {
          background: @LightGray;
        }
      }
    }
  }
  /deep/.bag-item {
    margin: 0;
    padding: 10px;
    box-sizing: border-box;
    .chip {
      padding: 0;
      flex-direction: row;
      justify-content: space-between;
    }
  }
  .bag-bottom {
    clear: both;
  }
  .btn-container {
    border-top: 1px solid #e6e6e6;
    display: table;
    width: 100%;
    margin-bottom: 3px;
    .no-button {
      display: table-cell;
      width: 49%;
      color: #33b2c1;
      cursor: pointer;
      text-align: center;
      vertical-align: middle;
      text-decoration: none;
      background: inherit;
      padding-top: 5px;
    }
    .separator {
      color: #41434c;
      opacity: 0.2;
      margin-top: 7px;
    }
    .yes-button {
      display: table-cell;
      width: 49%;
      color: #33b2c1;
      cursor: pointer;
      text-align: center;
      vertical-align: middle;
      text-decoration: none;
      background: inherit;
      padding-top: 5px;
    }
  }
  .links {
    display: flex;
    justify-content: center;
    a {
      flex: 1;
      justify-content: center;
      display: flex;
      cursor: pointer;
      padding: 15px 10px;
      border-top: 1px solid #eee;
      border-right: 1px solid #eee;
      text-align: center;
      align-items: center;
    }
  }
}
.modal {
  background-color: rgba(82, 78, 78, 0.52) !important;
  .message-body {
    margin: 4px 0 18px;
    line-height: 20px;
    text-align: center;
  }
  &.product-remove {
    .btn-container {
      display: flex;
      align-items: center;
      a {
          flex: 1;
          justify-content: center;
          display: flex;
          cursor: pointer;
          padding: 10px;
      }
    }
  }
}
.bag-brand-name {
  display: flex;
  justify-content: space-between;
}
.view-ladder-price-option{
  display: flex;
  align-items: center;
  font-size: 16px;
  @media @tablet{
    font-size: 14px;
  }
  .price-option-icon{
     display: flex;
     align-items: center;
     height:17px ;
     width:17px ;
     margin-left: 5px;
     img{
       height: 100%;
       width: 100%;
     }
  }
  cursor: pointer;
}
</style>

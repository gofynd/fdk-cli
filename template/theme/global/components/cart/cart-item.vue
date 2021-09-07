<template>
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
        <div
          class="bag-brand bold-sm"
          v-bind:class="{ outofStock: item.availability.out_of_stock }"
        >
          {{ item.product.brand.name }}
        </div>
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
          :item="item"
          :chiptype="'bag'"
          @remove-cart="removeCart"
          @update-cart="updateCart"
        ></chip-item>
        <div class="bag-name">
          <span class="bold-xs"> Total: {{ getTotal() | currencyformat }}</span>
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
            @remove-cart="removeCart"
            @update-cart="updateCart"
          ></chip-item>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import quantityctrl from "./quantity-ctrl.vue";
import chipitem from "./cart-chip-item.vue";
import emergeImage from "../../components/common/emerge-image.vue";

export default {
  name: "cart-item",
  props: ["item", "updateCart", "removeCart"],
  components: {
    "quantity-ctrl": quantityctrl,
    "chip-item": chipitem,
    "emerge-image": emergeImage,
  },
  methods: {
    getTotal() {
      return this.item.article.price.converted.effective * this.item.quantity;
    },
    getPieces() {
      return this.item.quantity;
    },
  },
};
</script>

<style lang="less" scoped>
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
}
</style>

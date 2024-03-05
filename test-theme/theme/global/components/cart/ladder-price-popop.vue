<template>
  <div class="ladder-popup-container" v-if="ladderPrices">
    <div
      class="ladder-popup-overlay"
      @click.self="closePopup"
    >
      <div class="ladder-popup">
        <div class="ladder-popup-header">
          <h2 class="header-text">Price Options</h2>
          <div class="ladder-popup-close-btn" @click="closePopup">
            <img
              src="../../../assets/images/close-icon.png"
            />
          </div>
        </div>
        <div class="ladder-popup-price-detail">
          <div class="ladder-popup-product-img" @click="onProductClick">
            <img :src="getProductImg" alt="product-img" />
          </div>
          <div @click="onProductClick" class="ladder-popup-product-title">{{ getProductName }}</div>
        </div>
        <div class="ladder-price-wrapper">
          <ladder-pricing
            :ladderPrices="ladderPrices"
            :cartItem="item"
            :activeLadderIndex="activeLadderIndex"
            class="ladder-pricing"
          ></ladder-pricing>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LadderPricing from "../../../templates/components/product-description/ladder-price.vue";
import { isBrowser } from "browser-or-node";
export default {
  name: "ladder-price",
  components: {
    "ladder-pricing": LadderPricing,
  },
  props: ["item"],
  computed: {
    ladderOffers() {
      return (
        this.ladderPrices?.available_offers[0].offer_prices
      );
    },
    getProductImg() {
      return this.item?.product?.images[0]?.url;
    },
    getProductName() {
      return this.item?.product?.name;
    },
  },
  data() {
    return {
      ladderPrices: null,
      activeLadderIndex: null,
    };
  },
  mounted() {
    let getLadderPricing= this.item?.promotions_applied.find(val=>val.promotion_type== "ladder_price");
    this.$root.$apiSDK.cart
      .getLadderOffers({
        slug: this.item.product.slug,
        promotionId: getLadderPricing.promo_id,
      })
      .then((res) => {
        this.ladderPrices = { ...res };
        this.isAplliedLadderPrice();
      })
      .catch((err) => {
        this.ladderPrices = null;
      });
  },
  methods: {
    onProductClick(){
        if (isBrowser && this.item?.product?.slug) window.location = `/product/${this.item?.product?.slug}`;
    },
    closePopup(e) {
      this.$emit("close_ladder_popup");
    },
    isAplliedLadderPrice() {
      if (!this.item?.quantity) return false;
      let isFoundInLadder = false;

      for (let i = 0; i < this.ladderOffers.length; i++) {
        let isLastIndex = this.ladderOffers.length - 1 == i;
        if (isLastIndex) {
          isFoundInLadder =
            this.item.quantity >= this.ladderOffers[i].min_quantity;
        } else {
          isFoundInLadder =
            this.item.quantity >= this.ladderOffers[i].min_quantity &&
            this.item.quantity <= this.ladderOffers[i].max_quantity;
        }
        if (isFoundInLadder) {
          this.activeLadderIndex = i;
          break;
        }
      }
      if (!isFoundInLadder) {
        this.activeLadderIndex = null;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ladder-popup-overlay {
  opacity: 1;
  overflow: visible;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.ladder-popup {
  padding: 10px 15px;
  background-color: white;
  min-width: 460px;
  border-radius: 3px;
  overflow: hidden;
  border-radius: 10px;
  position: fixed;
  transition: all 0s;
  @media @mobile {
    min-width: 360px;
  }
}
.ladder-popup-header {
  margin-bottom: 10px;
  line-height: 24px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
}
.header-text {
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000;
}
.ladder-popup-price-detail {
  display: flex;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 4px 0 14px 0;
}
.ladder-pricing {
  margin-bottom: 25px;
}
.ladder-popup-product-img {
  cursor: pointer;
  width: 61px;
  height: 65px;
  img {
    width: 100%;
    height: 100%;
  }
}
.ladder-popup-product-title {
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  line-height: 18px;
  color: #000;
  padding-left: 16px;
}
.ladder-popup-close-btn {
  cursor: pointer;
  img{
    height: 10px;
    width: 10px;
  }
}
</style>

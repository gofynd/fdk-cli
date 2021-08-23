<template>
  <div class="main" v-if="sellerData.length > 0">
    <div class="title dark-xxs" v-if="bestOffer">
      {{ bestOffer.message }}
    </div>
    <div class="badge">
      <fdk-inline-svg src="ribbon-vertical">
        {{ bestOffer.margin }}
      </fdk-inline-svg>
      <div class="badge-discount dark-xs cl-White" v-if="bestOffer">
        {{ bestOffer.margin }}
      </div>
      <div class="regular-xxxxs cl-White">Margin</div>
    </div>
    <div class="seller-box" v-if="showMore">
      <div v-for="(item, index) in sellerData" :key="index">
        <div class="store-name regular-xxxs">
          {{ item.seller_name }}
        </div>
        <ul class="offers">
          <li
            v-for="(offer, index) in item.offers"
            :key="index"
            class="offer-list regular-xxs"
          >
            {{ offer.message }}
            <span class="margin-text">&nbsp; {{ offer.margin }} Margin</span>
          </li>
        </ul>
      </div>
      <div class="helper" @click="showMore = !showMore">
        <div class="helper-text regular-xxxs">hide offers</div>
        <fdk-inline-svg
          v-bind:class="{ 'filter-arrow-up': !helperArrowDown }"
          :src="'arrow-dropdown-black'"
        ></fdk-inline-svg>
      </div>
    </div>
    <div v-else-if="!showMore" class="seller-box">
      <div class="store-name regular-xxxs" v-if="bestOffer">
        Sold by : {{ bestOffer.seller }}
      </div>
      <div class="helper" @click="showMore = !showMore">
        <div class="helper-text regular-xxxs">
          {{
            sellerData.length - 1
              ? `${sellerData.length - 1} other Sellers`
              : "more offers"
          }}
        </div>
        <fdk-inline-svg :src="'arrow-dropdown-black'"></fdk-inline-svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "storeCoupons",
  props: {
    bulkPrices: {},
  },
  components: {},
  data: function() {
    return {
      showMore: false,
      helperArrowDown: false,
      bestOffer: "",
      sellerData: [],
    };
  },
  mounted() {
    if (this.bulkPrices && this.bulkPrices.data) {
      this.bulkPrices.data.forEach((item) => {
        let seller = { offers: [] };
        seller.seller_name = item.seller.name;
        item.offers.forEach((offer) => {
          let offerInfo = {
            message: `${
              offer.quantity
            } pieces @ ${this.$options.filters.currencyformat(
              offer.price.bulk_effective
            )} each`,
            margin: `${offer.margin}%`,
          };
          seller.offers.push(offerInfo);
          if (offer.best) {
            this.bestOffer = {
              ...offerInfo,
              seller: seller.seller_name,
            };
          }
        });
        this.sellerData.push(seller);
      });
    }
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.main {
  display: flex;
  border: 1px dashed #6b6b6b;
  position: relative;
  color: #41434c;
  margin-bottom: 15px;
  margin-top: 30px;
  .title {
    position: absolute;
    top: -15px;
    border: 1px solid #898a93;
    left: 15px;
    padding: 5px 10px;
    background-color: @ds-white;
    border-radius: 3px;
  }
  .badge {
    position: absolute;
    right: 20px;
    text-align: center;
    max-width: 40px;
    top: -7px;
    .badge-discount {
      margin-top: -40px;
    }
  }
  .seller-box {
    margin-top: 15px;
    padding-left: 15px;
    width: 100%;
    .offers {
      margin-top: 3px;
      padding-left: 15px;
      list-style: disc;
      .margin-text {
        color: @ds-black;
      }
      .offer-list {
        line-height: 1.5;
      }
    }
    .helper {
      display: flex;
      margin-top: 5px;
      .helper-text {
        margin: 5px 0px 0px 0px;
        color: @ds-black;
        cursor: pointer;
      }
      .filter-arrow-up {
        transform: rotate(180deg);
      }
    }
  }
  .show-less {
    padding: 0px 10px 0px 0px;
    margin: 10px 15px 0px;
  }
}
.store-name {
  margin-top: 10px;
  color: @Mako;
  opacity: 0.5;
  width: 80%;
}
</style>

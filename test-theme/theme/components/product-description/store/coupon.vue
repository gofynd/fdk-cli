<template>
  <div class="main" v-if="sellerData.length > 0" 
    :style="`--color-porsche: #e8a76c;--text_discount_color:${global_config.props.text_discount_color};--text_heading_link_color:${global_config.props.text_heading_link_color}`">
    <div class="title dark-xxs" v-if="bestOffer">
      {{ bestOffer.message }}
    </div>
    <div class="badge">
      <svg width="52px" height="52px" viewBox="0 0 52 52" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <!-- Generator: Sketch 55.1 (78136) - https://sketchapp.com -->
          <title>Artboard</title>
          <desc>Created with Sketch.</desc>
          <g id="Artboard" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <polygon id="Path-1237-Copy" :fill="`${get_text_discount_color}`" transform="translate(26.000000, 26.000000) scale(-1, 1) translate(-26.000000, -26.000000) " points="0 1.16096511e-30 0 51.7456172 27.0177165 43.8663216 52 52 52 0.121036541"></polygon>
          </g>
      </svg>

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
        <svg-wrapper
          v-bind:class="{ 'filter-arrow-up': !helperArrowDown }"
          :svg_src="'arrow-dropdown-black'"
        ></svg-wrapper>
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
        <svg-wrapper :svg_src="'arrow-dropdown-black'"></svg-wrapper>
      </div>
    </div>
  </div>
</template>

<script>
import SvgWrapper from '../../common/svg-wrapper.vue';
export default {
  name: "storeCoupons",
  props: {
    bulkPrices: {},
    global_config: {}
  },
  components: {
    "svg-wrapper": SvgWrapper
  },
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
            message: `${offer.quantity} pieces @ ${this.$options.filters.currencyformat(offer.price.bulk_effective)} each`,
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
  computed : {
    get_text_discount_color () {
      return this.global_config?.props?.text_discount_color ? this.global_config.props.text_discount_color : 'var(--color-porsche)'
    }
  },
};
</script>

<style lang="less" scoped>
.main {
  display: flex;
  border: 1px dashed @DoveGray;
  position: relative;
  color: @Mako;
  margin-bottom: 15px;
  margin-top: 20px;
  .title {
    position: absolute;
    top: -15px;
    border: 1px solid @DarkGray;
    left: 15px;
    padding: 5px 10px;
    background-color: @White;
    border-radius: @border-radius;
  }
  .badge {
    position: absolute;
    right: 20px;
    text-align: center;
    max-width: 40px;
    top: -1px;
    svg {
      width: 40px;
      height: 40px;
    }
    .badge-discount {
      margin-top: -37px;
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
        color: var(--text_discount_color, @color-porsche);
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
        color: var(--text_heading_link_color, @LinkColor);
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

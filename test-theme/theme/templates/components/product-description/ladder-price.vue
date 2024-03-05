<template>
  <div class="container ladder-pricing">
    <table>
      <tr>
        <th>Quantity</th>
        <th>Price/unit</th>
        <th>Profit Percent</th>
        <template></template>
      </tr>

      <tr v-for="(ladder, index) in ladderOffers" :key="index">
        <td class="qty-data">
          <span
            class="applied-range"
            :class="activeLadderIndex === index ? 'applied' : null"
          >
            <svg-wrapper :svg_src="'done'"></svg-wrapper> 
          </span>
          <span class="td-content">
            <span class="qty-range">{{
              getQtyFormattedRange(ladder, index)
            }}</span>
          </span>
        </td>
        <td class="qty-per">
          {{ ladderPrices.currency.symbol }}{{ ladder.price.offer_price }}
        </td>
        <td class="qty-per">{{ ladder.margin }}%</td>
      </tr>
    </table>
  </div>
</template>

<script>
import SvgWrapper from '../../../components/common/svg-wrapper.vue';
export default {
  data() {
    return {};
  },
  components: {
    "svg-wrapper": SvgWrapper
  },
  props: {
    ladderPrices: Object,
    cartItem: Object,
    activeLadderIndex:Number
  },
  computed: {
    ladderOffers() {
      return this.ladderPrices?.available_offers[0]?.offer_prices;
    },
  },
  methods: {
    getQtyFormattedRange(ladder, index) {
      let isLastIndex = this.ladderOffers.length - 1 == index;
      return isLastIndex
        ? `${ladder.min_quantity} and above`
        : `${ladder.min_quantity} - ${ladder.max_quantity}`;
    },
  },
};
</script>

<style lang="less" scoped>
.ladder-pricing {
  margin-top: 28px;
  width: calc(100% - 30px);
}
.container {
  display: inline-block;
  padding: 0 15px;
  background: #f7f6ff;
  border-radius: 5px;
  table {
    width: 100%;
    font-size: 12px;
    font-weight: 600;
    line-height: 18.5px;
    tr {
      border-bottom: 1px solid #e8e2e2;
      th {
        font-weight: 600;
      }
      th,
      td {
        text-align: center;
        padding: 7px 7px;
        &:first-child {
          padding-left: 0;
        }
        &:last-child {
          padding-right: 0;
        }
      }
      td {
        .td-content {
          display: flex;
          align-items: center;
          margin-left: 10px;
          .moq {
            padding: 3px 7px;
            border: 1px solid #afb4c5;
            border-radius: 15px;
            font-size: 10px;
            margin-left: 3px;
          }
        }
      }
      &:last-child {
        border: none;
      }
      .qty-data {
        display: flex;
        .applied-range {
          opacity: 0;
          display: flex;
          align-items: center;
          img{
            pointer-events: none;
          }
          &.applied {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>

<template>
  <div class="product-wrapper">
    <div class="product-card animated fadeIn">
      <div class="product-image">
        <fdk-placeholder type="product-2" />
        <div class="discount-container">
          <div class="discount">
            <div class="special-offer-text bold-xxxxs">
              10% OFF
            </div>
          </div>
        </div>
      </div>

      <div class="product-desc">
        <!-- Product Rating -->
        <div class="rating">
          <fy-rating v-if="5"></fy-rating>
        </div>

        <!-- End of Product Rating -->
        <h5 class="wrap-text">
          <b class="bold-xs cl-Mako brand-name">{{ brand }}</b>
          <span class="regular-xxs cl-DoveGray text-seperator">|</span>
          <span class="regular-xxs cl-DoveGray">{{ name }}</span>
        </h5>
        <div>
          <span class="regular-xs cl-Profit">
            <span> {{ 100 | currencyformat }}</span>
          </span>
          <span class="regular-xxxs text-seperator"></span>
          <span class="strike-through regular-xxxs cl-DustyGray2">
            {{ 110 | currencyformat }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fyRatingVue from '../fy-rating.vue';
export default {
  components: {
    'fy-rating': fyRatingVue,
  },
  props: ['name', 'brand'],

  mounted() {
    this.isMounted = true;
  },
  data() {
    return {
      isMounted: false,
    };
  },
};
</script>

<style scoped lang="less">
.product-wrapper {
  height: 100%;
}
/deep/.imgClass {
  .fy__img {
    border-radius: 2px;
  }
}
.product-card {
  width: 100%;
  position: relative;
  border-radius: 5%;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .product-image {
    border-radius: 8px;
    overflow: hidden;
    min-height: 200px;
    height: 100%;
    display: flex;
    align-items: center;
    background: #f2f2f2;
    justify-content: center;
    position: relative;
  }
}

.discount-container {
  position: absolute;
  bottom: 0;
  color: white;
  width: 100%;
  height: 25px;
  @media @mobile {
    bottom: 0;
  }
}
.discount {
  background: url('../../../assets/images/special-badge.png')
    bottom left no-repeat;
}
.special-offer-text {
  text-align: left;
  line-height: 25px;
  padding-left: 8px;
}
.product-desc {
  // padding: 8px 0 0 6px;
  display: block;
  .rating {
    height: 20px;
    margin: 5px 0;
  }
}

.text-seperator {
  padding: 0 5px;
}
.rupeeSymbol {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 10px;
  color: inherit;
  padding: 0 2px 0 0;
}
.cl-Profit {
  color: #fb406b;
}

.strike-through {
  text-decoration: line-through;
}
</style>

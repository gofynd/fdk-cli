<template>
  <fdk-link :link="product.url" class="product-card">
    <div class="product-card__image">
      <img :src="getImageTransformUrl(product.images[0].url)" />
    </div>
    <div class="product-card__details">
      <div class="product-card__details--title">{{ product.name }}</div>
      <div class="product-card__details--price">
        <span class="price-effective" :style="(product.price.effective.min != product.price.marked.min) ? 'color:' + global_config.props.text_sale_price_color : 'color:' + global_config.props.text_price_color">
          {{ getPrice(product.price.effective) }}
        </span>
        <span
          class="price-marked ml-3 strikethrough" :style="'color:' + global_config.props.text_strikethrough_price_color"
          v-if="product.price.effective.min != product.price.marked.min"
          >{{ getPrice(product.price.marked) }}</span
        >
      </div>
    </div>
  </fdk-link>
</template>

<script>
export default {
  props: {
    product: {},
    global_config: {}
  },
  methods: {
    getImageTransformUrl(imageUrl){
      let retUrl=imageUrl;
      const arrSizes= ['270x0', '540x0', '720x0'];
      for (let i = 0; i < arrSizes.length; i++) {
          let regexExp = new RegExp(arrSizes[i], 'g');
          retUrl = retUrl.replace(regexExp, 'original');
      }
      return retUrl;
    },
    getPrice(price) {
      if (price.min === price.max) {
        return this.$options.filters.currencyformat(price.min);
      }
      return (
        this.$options.filters.currencyformat(price.min) +
        ' - ' +
        this.$options.filters.currencyformat(price.max)
      );
    },
    getHighResImage(url) {
      let hurl = url.replace('/270x0/', '/360x0/');
      hurl = hurl.replace('/360x0/', '/540x0/');
      hurl = hurl.replace('/540x0/', '/720x0/');
      return hurl;
    },
  },
};
</script>

<style lang="less" scoped>
.product-card {
  background-color: #fff;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    .product-card__image {
      opacity: 0.7;
    }
  }
  &__image {
    transition: all 0.4s;
    width: 21.875rem;
    min-height: 33.75rem;
    img {
      width: 21.875rem;
    }
  }
  &__details {
    padding: 15px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    &--title {
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
    &--price {
      font-size: 14px;
      // color: #999;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      margin-top: 5px;
      letter-spacing: 1.5px;
      span {
        display: inline-block;
      }
      .strikethrough {
        text-decoration: line-through;
      }
      .price-marked {
        font-weight: 600;
        // color: #c33;
        font-size: 0.75rem;
      }
    }
  }
}
</style>

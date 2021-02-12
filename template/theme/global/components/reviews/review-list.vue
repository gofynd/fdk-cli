<template>
  <div class="review-list">
    <h2 class="review-list__title">
      {{ title }}
    </h2>
    <!-- ★ -->
    <!-- ♥ -->
    <div class="review-list__overall-rating">
      Overall
      <span>
        <rating-star :stars="product.rating" />
      </span>
      <span> {{ product.rating_count }} ratings </span>
    </div>
    <div class="review-list__list">
      <div
        class="review-list__item"
        v-for="(review, index) in reviews"
        :key="index + '-review'"
      >
        <review-item :reviewitem="review" :reviewspage="reviewspage" />
      </div>
    </div>
  </div>
</template>

<script>
import ratingstar from './rating-star';
import reviewitem from './review-item';
export default {
  name: 'review-list',
  components: {
    'rating-star': ratingstar,
    'review-item': reviewitem,
  },
  props: {
    reviews: {
      type: Array,
      default: [],
    },
    product: {
      type: Object,
      default: {},
    },
    reviewspage: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Ratings and Review',
    },
  },
};
</script>

<style lang="less" scoped>
.review-list {
  margin-top: 50px;
  font-family: roboto condensed, Arial, Helvetica, sans-serif;
  &__title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 30px;
  }
  &__overall-rating {
    margin-bottom: 10px;
    span {
      margin-left: 8px;
    }
  }
  &__item {
    border-top: 1px solid #ccc;
    &:last-child {
      border-bottom: 1px solid #ccc;
    }
  }
}
</style>

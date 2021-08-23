<template>
  <div
    class="review"
    v-if="reviewitem && reviewitem.rating && reviewitem.review"
  >
    <div class="review__title">
      <rating-star
        size="small"
        :stars="reviewitem.rating.value"
        v-if="reviewitem.rating"
      />
      <p>{{ reviewitem.review.title }}</p>
    </div>
    <div class="review__desc">
      <p class="show-less" v-if="!showMore">
        {{ reviewitem.review.description.slice(0, trimLength) }}
        <span
          v-if="reviewitem.review.description.length > trimLength || hasMedia"
          @click="showMore = true"
        >
          more...
        </span>
      </p>
      <div class="show-more" v-else>
        {{ reviewitem.review.description }}

        <review-media-list
          v-if="hasMedia"
          :media="reviewitem.review.media_meta"
          @click="showModal = true"
        />
        <review-modal
          v-if="showMore"
          :reviewitem="reviewitem"
          :isOpen="showModal"
          @closereviewdialog="showModal = false"
        />
        <span @click="showMore = false" v-if="!reviewspage">
          less...
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import ratingstar from './rating-star';
import reviewmodal from './review-modal';
import reviewmedialist from './review-media-list';
export default {
  name: 'review-item',
  components: {
    'rating-star': ratingstar,
    'review-modal': reviewmodal,
    'review-media-list': reviewmedialist,
  },
  props: {
    reviewitem: {
      type: Object,
      default: {},
    },
    reviewspage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      trimLength: 60,
      showMore: false,
      showModal: false,
    };
  },
  mounted() {
    if (this.reviewspage) {
      this.showMore = true;
    }
  },
  watch: {
    reviewspage(n) {
      if (n) {
        this.showMore = true;
      }
    },
  },
  computed: {
    hasMedia() {
      return (
        this.reviewitem.review.media_meta &&
        this.reviewitem.review.media_meta.length
      );
    },
  },
};
</script>

<style lang="less" scoped>
.review {
  padding-top: 10px;
  &__title {
    display: flex;
    align-items: center;
    p {
      margin-left: 10px;
      font-weight: bold;
    }
  }
  &__desc {
    margin-top: 10px;
  }

  .show-less,
  .show-more {
    margin-bottom: 10px;
    span {
      font-weight: 700;
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>

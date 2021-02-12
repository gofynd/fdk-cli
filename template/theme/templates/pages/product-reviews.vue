<template>
  <div class="main-review-container" v-if="context && context.product">
    <div class="left">
      <div @click="redirectToProduct()">
        <product-card :product="getProduct" class="product-card" />
      </div>
      <div class="images">
        <p>User Images</p>

        <review-media-list
          :media="reviewMediaData"
          :max_limit="5"
          @click="showImageModal = true"
        />
      </div>
    </div>
    <div class="right">
      <fdk-infinite-reviews
        v-if="context && context.reviews && context.reviews.data"
        class="list-items"
      >
        <template slot-scope="infiniteReviews">
          <review-list
            :reviews="context.reviews.data"
            :product="context.product"
            :reviewspage="true"
            :title="context.product.name"
          />
          <loader
            id="loader"
            class="loader-center"
            v-if="infiniteReviews.hasNext"
          ></loader>
        </template>
      </fdk-infinite-reviews>

      <div v-else>
        No reviews found
      </div>
    </div>
    <review-image-modal
      :isOpen="showImageModal"
      v-if="showImageModal"
      :media="reviewMediaData"
      @closedialog="showImageModal = false"
    />
  </div>
</template>

<script>
import productcard from './../../global/components/product-card';
import ratinglist from './../../global/components/reviews/review-list';
import reviewmedialist from './../../global/components/reviews/review-media-list';
import reviewimagemodal from './../../global/components/reviews/review-image-modal';
import loader from './../components/loader';

export default {
  name: 'reviews-page',
  props: {
    context: {},
  },
  components: {
    'review-list': ratinglist,
    'product-card': productcard,
    'review-media-list': reviewmedialist,
    'review-image-modal': reviewimagemodal,
    loader,
  },
  data() {
    return {
      showImageModal: false,
    };
  },
  computed: {
    getProduct() {
      return {
        ...this.context.product,
        attributes: {
          ...this.context.product.attributes,
          discount: this.context.product_meta.discount,
        },
        price: this.context.product_meta.price,
      };
    },
    reviewMediaData() {
      let mediaArr = [];
      (this.context.reviews.data || []).forEach((reviewitem) => {
        //   console.log(s, reviewitem);
        if (this.hasMedia(reviewitem) && reviewitem.review) {
          reviewitem.review.media_meta.map((i) => (i._review = reviewitem));
          mediaArr.push(...reviewitem.review.media_meta);
        }
      }, []);
      console.log(mediaArr);
      return mediaArr;
    },
  },
  methods: {
    redirectToProduct() {
      window.open(`/product/${this.context.product.slug}`, '_blank');
    },
    hasMedia(reviewitem) {
      if (reviewitem.review) {
        return (
          reviewitem.review.media_meta && reviewitem.review.media_meta.length
        );
      }
      return false;
    },
  },
};
</script>

<style lang="less" scoped>
.main-review-container {
  display: flex;

  .left {
    width: 25%;
    box-sizing: border-box;
    border-right: 1px solid #ccc;
    .product-card {
      padding: 20px;
      border-bottom: 1px solid #ccc;
    }
    .images {
      padding: 20px;
    }
    @media @mobile {
      display: none;
    }
  }
  .right {
    width: 75%;
    padding: 20px;
    box-sizing: border-box;
    @media @mobile {
      width: 100%;
    }
    /deep/.show-more {
      line-height: 25px;
    }
    /deep/.review-list {
      margin-top: 10px;
    }
    .list-items {
      background-color: #ffffff;
    }
  }
}
::-webkit-scrollbar {
  width: 0;
}
</style>

<template>
  <div
    class="main-review-container coll-cont"
    v-if="context && context.product"
    :style="global_config ? 'color:' + global_config.props.text_body_color : ''"
  >
    <div class="left">
      <div @click="redirectToProduct()">
        <product-card
          :product="getProduct"
          class="product-card"
          :global_config="global_config"
        />
      </div>
      <div class="images" v-if="reviewMediaData.length">
        <p>User Images</p>

        <review-media-list
          :media="reviewMediaData"
          :max_limit="5"
          @click="showImageDialog($event)"
        />
      </div>
    </div>
    <div class="right">
      <fdk-infinite-reviews
        v-if="
          context &&
          context.reviews &&
          context.reviews.items &&
          context.reviews.items.length
        "
        class="list-items"
      >
        <template slot-scope="infiniteReviews">
          <review-list
            :reviews="context.reviews.items"
            :product="context.product"
            :reviewspage="true"
            :title="context.product.name"
          />
          <!-- <fdk-loader
            id="loader"
            class="loader-center"
            v-if="infiniteReviews.hasNext"
          ></fdk-loader> -->
          <div class="loader-center" v-if="infiniteReviews.hasNext">
            <fdk-loader />
          </div>
        </template>
      </fdk-infinite-reviews>

      <div v-else>No reviews found</div>
    </div>
    <review-image-modal
      :isOpen="showImageModal"
      v-if="showImageModal"
      :media="reviewMediaData"
      :activeImageIndex="activeImageIndex"
      @closedialog="showImageModal = false"
    />
  </div>
</template>

<script>
import productcard from "./../../templates/components/product-description/product-card.vue";

import ratinglist from "./../../global/components/reviews/review-list";
import reviewmedialist from "./../../global/components/reviews/review-media-list";
import reviewimagemodal from "./../../global/components/reviews/review-image-modal";

export default {
  name: "reviews-page",
  props: {
    context: {},
    global_config: {},
  },
  components: {
    "review-list": ratinglist,
    "product-card": productcard,
    "review-media-list": reviewmedialist,
    "review-image-modal": reviewimagemodal,
  },
  data() {
    return {
      showImageModal: false,
      activeImageIndex: 0,
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
      (this.context.reviews.items || []).forEach((reviewitem) => {
        if (this.hasMedia(reviewitem) && reviewitem.review) {
          reviewitem.review.media_meta.map((i) => (i._review = reviewitem));
          mediaArr.push(...reviewitem.review.media_meta);
        }
      }, []);

      return mediaArr;
    },
  },
  methods: {
    redirectToProduct() {
      window.open(`/product/${this.context.product.slug}`, "_blank");
    },
    hasMedia(reviewitem) {
      if (reviewitem.review) {
        return (
          reviewitem.review.media_meta && reviewitem.review.media_meta.length
        );
      }
      return false;
    },
    showImageDialog(index) {
      this.activeImageIndex = index || 0;
      this.showImageModal = true;
    },
  },
};
</script>

<style lang="less" scoped>
.main-review-container {
  display: flex;
  background-color: @White;
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
    .loader-center {
      grid-column-start: -1;
      grid-column-end: 1;
      text-align: center;
      margin: 20px 0;
    }
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

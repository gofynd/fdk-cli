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
          @click="showImageModal($event)"
        />
        <review-modal
          v-if="showMore"
          :reviewitem="reviewitem"
          :activeImageIndex="activeImageIndex"
          :isOpen="showModal"
          @closereviewdialog="showModal = false"
        />
        <span @click="showMore = false" v-if="!reviewspage">
          less...
        </span>
      </div>
    </div>
    <div class="review__footer">
      <div class="review__footer__info">
        <div class="review__footer__created">
          Created by <span>{{ reviewitem.created_by.name }}</span>
          {{ differenceInDays(reviewitem.date_meta.created_on, new Date()) }}
          ago
        </div>
        <!-- <div class="review__footer__date">
          
        </div> -->
      </div>
      <fdk-vote-review>
        <template slot-scope="voteReviewData">
          <div class="review__footer__vote">
            <div
              class="review__footer__upvote"
              @click="voteReview('upvote', voteReviewData)"
            >
              <img src="../../../assets/images/like.png" />
              {{ reviewitem.vote_count.upvote }}
            </div>
            <div
              class="review__footer__downvote"
              @click="voteReview('downvote', voteReviewData)"
            >
              <img class="reverse" src="../../../assets/images/like.png" />
              {{ reviewitem.vote_count.downvote }}
            </div>
          </div>
        </template>
      </fdk-vote-review>
    </div>
  </div>
</template>

<script>
import ratingstar from "./rating-star";
import reviewmodal from "./review-modal";
import reviewmedialist from "./review-media-list";
import { differenceInDays } from "../../../helper/utils";

export default {
  name: "review-item",
  components: {
    "rating-star": ratingstar,
    "review-modal": reviewmodal,
    "review-media-list": reviewmedialist,
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
      activeImageIndex: 0,
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
  methods: {
    differenceInDays,
    showImageModal(index) {
      this.activeImageIndex = index || 0;
      this.showModal = true;
    },
    voteReview(type, vote) {
      const obj = this.getVoteReviewData(type);
      vote
        .voteReview(obj)
        .then((res) => {
          if (res.success) {
            type == "upvote"
              ? this.reviewitem.vote_count.upvote++
              : this.reviewitem.vote_count.downvote++;
          }
        })
        .catch((err) => {});
    },
    getVoteReviewData(type) {
      const obj = {
        entity_id: this.reviewitem.entity.id,
        entity_type: this.reviewitem.entity.type,
        ref_id: this.reviewitem.id, //review id
        ref_type: "review",
        action: type,
      };
      return obj;
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
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // color: @Mako;
    font-size: 14px;
    margin-bottom: 16px;
    &__info {
      // display: flex;
      line-height: 20px;
      margin-right: 12px;
    }
    &__vote {
      display: flex;
      margin-right: 16px;
      img {
        height: 18px;
        width: 18px;
        margin-right: 12px;
      }
    }
    &__created {
      span {
        font-weight: bold;
      }
    }
    // &__date{
    //   margin-left: 6px;
    // }
    &__upvote {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    &__downvote {
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-left: 12px;
      .reverse {
        -webkit-transform: scaleY(-1);
        transform: scaleY(-1);
      }
    }
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

<template>
  <modal
    :isOpen="isOpen"
    v-on:closedialog="closeDialog"
    :showHeader="false"
    :enableOutsideClick="enableOutsideClick"
  >
    <div class="cross" @click="closeDialog">
      <img src="../../../assets/images/close-icon.png" alt="Close" />
    </div>
    <div class="review-modal-body">
      <div class="review__media" v-if="hasMedia">
        <span
          class="chevron left"
          v-if="selectedIndex !== 0"
          @click.stop="prev"
        ></span>
        <span
          @click.stop="next"
          class="chevron right"
          v-if="selectedIndex !== this.reviewitem.review.media_meta.length - 1"
        ></span>
        <img
          :src="selectedMedia.url.main"
          v-if="selectedMedia.type === 'image'"
          alt="review_image"
          class="review__media--image"
        />
        <div
          v-else-if="selectedMedia.type === 'video'"
          class="review__media--video"
        >
          <iframe
            width="100%"
            height="100%"
            :src="getEmbedURL(selectedMedia.url.main)"
            v-if="isYoutube(selectedMedia.url.main)"
          ></iframe>
          <video v-else controls>
            <source :src="selectedMedia.url.main" type="video/mp4" />
          </video>
        </div>
      </div>
      <div class="review__data" :style="{ width: hasMedia ? '40%' : '100%' }">
        <div class="review__title">
          <rating-star size="small" :stars="reviewitem.rating.value" />
          <p>{{ reviewitem.review.title }}</p>
        </div>
        <div class="review__desc">
          {{ reviewitem.review.description }}
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
import modal from "../modal";
import ratingstar from "./rating-star";

export default {
  name: "review-modal",
  components: {
    "rating-star": ratingstar,
    modal,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    reviewitem: {
      type: Object,
      default: {},
    },
    enableOutsideClick: {
      type: Boolean,
      default: true,
    },
    activeImageIndex: {
      type: Number,
      default: null,
    },
  },
  watch: {
    activeImageIndex() {
      if (this.activeImageIndex != null) {
        this.selectedIndex = this.activeImageIndex;
        this.selectedMedia = this.reviewitem.review.media_meta
          ? this.reviewitem.review.media_meta[this.selectedIndex]
          : {};
      }
    },
  },
  data() {
    return {
      selectedMedia: this.reviewitem.review.media_meta
        ? this.reviewitem.review.media_meta[0]
        : {},
      selectedIndex: this.activeImageIndex || 0,
    };
  },
  computed: {
    hasMedia() {
      return (
        this.reviewitem.review.media_meta &&
        this.reviewitem.review.media_meta.length
      );
    },
  },
  mounted () {
    document.addEventListener("backbutton", this.closeDialog, false);
  },
  beforeDestroy () {
    document.removeEventListener("backbutton", this.closeDialog);
  },
  methods: {
    closeDialog() {
      this.$emit("closereviewdialog");
    },
    getEmbedURL(url) {
      if (url.indexOf("youtu.be")) {
        return url.replace("youtu.be", "youtube.com/embed");
      } else if (url.indexOf("youtube.com/watch")) {
        return url.replace("youtube.com/watch", "youtube.com/embed");
      }
    },
    isYoutube(url) {
      return url.indexOf("youtu.be") || url.indexOf("youtube.com/watch");
    },
    next() {
      this.selectedIndex++;
      this.selectedMedia = this.reviewitem.review.media_meta[
        this.selectedIndex
      ];
    },
    prev() {
      this.selectedIndex--;
      this.selectedMedia = this.reviewitem.review.media_meta[
        this.selectedIndex
      ];
    },
  },
};
</script>

<style lang="less" scoped>
/deep/.modal-container {
  max-height: 500px;
  overflow: hidden !important;
  @media @mobile {
    max-height: inherit !important;
    overflow: inherit !important;
  }
}
.review-modal-body {
  display: flex;
  @media @mobile {
    flex-direction: column;
  }
  .review {
    &__media {
      width: 60%;
      position: relative;
      padding: 30px;
      background-color: #fff;
      @media @mobile {
        width: 100%;
        box-sizing: border-box;
      }
      &--image {
        width: 100%;
        height: 450px;
      }
      &--video {
        width: 100%;
        height: 450px;
      }
    }
    &__data {
      padding: 20px 25px;
      @media @mobile {
        width: 100% !important;
        box-sizing: border-box;
      }
    }
    &__title {
      display: flex;
      align-items: center;
      font-size: 20px;
      width: 95%;
      p {
        margin-left: 10px;
      }
    }
    &__desc {
      margin-top: 20px;
      line-height: 25px;
      height: 400px;
      overflow: hidden;
      overflow-y: scroll;
      @media @mobile {
        overflow-y: hidden;;
        height: inherit;
      }
    }
  }
}
.cross {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
  z-index: 1;
  img {
    width: 15px;
  }
}
.chevron::before {
  cursor: pointer;
  border-style: solid;
  border-width: 0.2em 0.2em 0 0;
  content: "";
  display: inline-block;
  height: 1em;
  border-color: #000;
  left: 0.15em;
  position: absolute;
  top: 50%;
  transform: rotate(-45deg), translateY(-50%);
  vertical-align: top;
  width: 1em;
}

.chevron.right:before {
  left: 95%;
  transform: rotate(45deg);
}
.chevron.left:before {
  left: 9px;
  transform: rotate(-135deg);
}
/deep/.modal-container {
  padding: 0 !important;
  border: none !important;
}
/deep/.modal-body {
  margin-top: 0 !important;
}
</style>

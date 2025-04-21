<template>
  <div class="review__media">
    <div
      v-for="(item, index) in media.slice(0, max_limit)"
      :key="index + '-media'"
      @click="click(index)"
    >
      <img
        :src="item.url.main"
        v-if="item.type === 'image'"
        alt="review_image"
        class="review__media--image"
      />
      <div v-else-if="item.type === 'video'" style="pointer-events:none">
        <iframe
          width="50px"
          height="80px"
          :src="getEmbedURL(item.url.main)"
          v-if="isYoutube(item.url.main)"
        ></iframe>
        <video v-else controls>
          <source :src="item.url.main" type="video/mp4" />
        </video>
      </div>
    </div>

    <!-- view more -->
    <div
      v-if="media.length > max_limit"
      class="overlay"
      @click="click(max_limit)"
    >
      <p class="more">MORE</p>
      <img
        :src="media[max_limit + 1].url.main"
        v-if="media[max_limit + 1].type === 'image'"
        alt="review_image"
        class="review__media--image"
      />
      <div
        v-else-if="media[max_limit + 1].type === 'video'"
        style="pointer-events:none"
      >
        <iframe
          width="50px"
          height="80px"
          :src="getEmbedURL(media[max_limit + 1].url.main)"
          v-if="isYoutube(media[max_limit + 1].url.main)"
        ></iframe>
        <video v-else controls>
          <source :src="media[max_limit + 1].url.main" type="video/mp4" />
        </video>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "review-media-list",
  props: {
    media: {
      type: Array,
      default: [],
    },
    max_limit: {
      type: Number,
      default: 5,
    },
  },
  methods: {
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
    click(index) {
      this.$emit("click", index);
    },
  },
};
</script>

<style lang="less" scoped>
.review {
  &__media {
    display: flex;
    flex-wrap: wrap;
    margin-top: 12px;

    div:not(:last-child) {
      margin-right: 10px;
    }
    div {
      margin-bottom: 10px;
      width: 50px;
      cursor: pointer;
    }
    &--image {
      // width: 100%;
      min-width: 50px;
      min-height: 80px;
      max-width: 50px;
      max-height: 80px;
    }
  }
}
.overlay {
  width: 50px;
  position: relative;
  height: 80px;
  cursor: pointer;
  &:before {
    background: #000;
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0.5;
  }
  .more {
    position: absolute;
    color: white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

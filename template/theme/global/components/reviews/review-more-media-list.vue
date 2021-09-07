<template>
  <div>
    <!-- view more -->
    <div class="review__media__active" v-if="activeData">
      <!-- <p class="more">MORE</p> -->
      <img
        :src="activeData.url.main"
        v-if="activeData.type === 'image'"
        alt="review_image"
        class="review__media__active--image"
      />
      <div v-else-if="activeData.type === 'video'">
        <iframe
          width="350px"
          height="100%"
          :src="getEmbedURL(activeData.url.main)"
          v-if="isYoutube(activeData.url.main)"
        ></iframe>
        <video v-else controls>
          <source :src="activeData.url.main" type="video/mp4" />
        </video>
      </div>
    </div>
    <div class="review__more__media">
      <div
        v-for="(item, index) in media.slice(0, max_limit)"
        :key="index + '-media'"
        :class="{ 'active-data': activeIndex == index }"
        @click="click(index)"
      >
        <img
          :src="item.url.main"
          v-if="item.type === 'image'"
          alt="review_image"
          class="review__more__media--image"
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
    activeImageIndex: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      activeIndex: this.activeImageIndex != null ? this.activeImageIndex : 0,
      activeData:
        this.activeImageIndex != null
          ? this.media[this.activeImageIndex]
          : null,
    };
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
      //   this.$emit('click', index);
      this.activeIndex = index;
      this.activeData = this.media[index];
    },
  },
};
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  display: none;
}
.review__media__active {
  display: flex;
  justify-content: center;
  -ms-overflow-style: none;
  height: 350px;
  &--image {
    width: 350px;
  }
}
.review__more {
  &__media {
    display: flex;
    // flex-wrap: wrap;
    overflow-x: scroll;
    margin-top: 12px;
    div:not(:last-child) {
      margin-right: 10px;
    }
    div {
      margin-bottom: 10px;
      width: 50px;
      min-width: 50px;
      cursor: pointer;
      opacity: 0.7;
    }
    &--image {
      // width: 100%;
      min-width: 50px;
      min-height: 80px;
      max-width: 50px;
      max-height: 80px;
    }
    &--image-active {
      width: 250px;
    }
  }
}
.active-data {
  opacity: 1 !important;
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

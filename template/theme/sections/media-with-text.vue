<template>
  <section class="media-with-text full-width-section ">
    <no-ssr>
      <videoPlayer
        v-if="settings.props.video.value"
        class="video-js"
        ref="videoPlayer"
        :options="playerOptions"
      >
      </videoPlayer>
    </no-ssr>
    <div :class='["image-section", "al-" + settings.props.media_alignment.value]' v-if="!settings.props.video.value && settings.props.image.value">
      <img :src="settings.props.image.value" />
    </div>
    <div :class='["media-with-text__content", "al-" + settings.props.text_alignment.value ]'>
      <div class="media-with-text__content--main">
        {{ settings.props.text.value }}
      </div>
      <div class="media-with-text__content--sub">
        {{ settings.props.heading.value }}
      </div>
    </div>
  </section>
</template>
<!-- #region  -->

<settings>
{
  "name": "media_with_text",
  "label": "Media with text",
  "props": [
    {
      "type": "image_picker",
      "id": "image",
      "default": "",
      "label": "Image"
    },
    {
      "id": "video",
      "type": "url",
      "label": "Video",
      "default": ""
    },
    {
      "id": "cover",
      "type": "url",
      "label": "Video Cover Image",
      "default": ""
    },
    {
      "type": "select",
      "id": "media_alignment",
      "options": [
          {
              "value": "left",
              "text": "Left"
          },
          {
              "value": "center",
              "text": "Center"
          },
          {
              "value": "right",
              "text": "Right"
          }
      ],
      "default": "left",
      "label": "Media Alignment"
    },
    {
      "type": "text",
      "id": "heading",
      "default": "Media with Text",
      "label": "Heading"
    },
    {
      "type": "text",
      "id": "text",
      "default": "Pair large text with an image to give focus to your chosen product, collection, or blog post. Add details on availability, style, or even provide a review.",
      "label": "Text"
    },
    {
      "type": "select",
      "id": "text_alignment",
      "options": [
          {
              "value": "left",
              "text": "Left"
          },
          {
              "value": "center",
              "text": "Center"
          },
          {
              "value": "right",
              "text": "Right"
          }
      ],
      "default": "left",
      "label": "Text Alignment"
    }
  ]
}
</settings>
<!-- #endregion -->
<style lang="less" scoped>

.media-with-text {
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-size: 16px;
  font-weight: 300;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;
  @media @large-1280 {
    padding-left: 0px;
    padding-right: 0px;
    flex-direction: column;
  }
  // /deep/ video,
  // .video-js {
  //   width: 700px;
  //   outline: none;
  //   @media @mobile {
  //     width: 100vw;
  //     background: #f8f8f8;
  //   }
  // }
  .image-section {
    flex: 0 0 50%;
    box-sizing: border-box;
    img {
        max-width: 100%;
    }
    &.al-left {
      text-align: left;
      @media @tablet {
        text-align: center;
      }
    }
    &.al-right {
      text-align: right;
      @media @tablet {
        text-align: center;
      }
    }
    &.al-center {
      text-align: center;
    }
    @media @large-1280 {
      flex: 0 0 100%;
    }
  }
  /deep/ .video-js {
    width: 720px;
    height: 100%;
    // height: 394px;
    min-height: 400px;
    // flex: 0 0 50%;
    background-color: transparent;
    box-sizing: border-box;
    @media @mobile {
      width: 100vw;
      min-height: 200px;
    }
  }
  &__content {
    // flex: 0 0 50%;
    padding: 50px;
    display: flex;
    flex-direction: column;
    text-align: center;
    line-height: 35px;
    box-sizing: border-box;
    @media @mobile {
      padding: 25px;
    }
    &.al-left {
      text-align: left;
      @media @large-1280 {
        text-align: center;
      }
    }
    &.al-center {
      text-align: center;
    }
    &.al-right {
      text-align: right;
      @media @large-1280 {
        text-align: center;
      }
    }
    
    &--main {
      padding: 10px;
      font-size: 20px;
      font-weight: 300;
      line-height: 31px;
      @media @mobile {
        font-size: 12px;
        line-height: 18px;
      }
    }
    &--sub {
      margin-top: 5px;
      padding: 10px;
      font-size: 20px;
      font-weight: 300;
      line-height: 31px;
      @media @mobile {
        font-size: 12px;
        line-height: 18px;
      }
    }
  }
}
@media screen and (max-width: 1160px) {
  .video {
    flex-direction: column;
  }
  .my-video-dimensions {
    width: 100%;
  }
  .video__content {
    margin-top: 20px;
    width: 100%;
  }
}

/deep/.video-js .vjs-big-play-button {
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}
/deep/.vjs-poster {
  background-size: cover;
}
</style>

<script>
import NoSSR from "vue-no-ssr";
import { isBrowser, isNode } from "browser-or-node";
import "video.js/dist/video-js.min.css";

export default {
  data() {
    return {
      playerOptions: {
        // videojs options
        // techOrder: [ 'youtube'],
        sources: [
          {
            type: "video/mp4",
            src: this.settings.props.video.value,
          },
        ],
        poster: this.settings.props.cover.value,
      },
    };
  },
  props: ["settings"],
  computed: {
    player() {
      return this.$refs.videoPlayer.player;
    },
  },
  components: {
    "no-ssr": NoSSR,
    videoPlayer: () => {
      return isBrowser
        ? Promise.resolve(require("vue-video-player/src/player"))
        : Promise.resolve({})
    },
  },
  directives: {},
  mounted() {},
  beforeDestroy() {
    
  },
};
</script>

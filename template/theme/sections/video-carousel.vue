<template>
  <div class="video-carousel" v-if="settings.blocks.length > 0">
    <button
      type="button"
      class="prev-arrow"
      ref="prevArrow"
      @click="prevSlide"
    ></button>
    <button
      type="button"
      class="next-arrow"
      ref="nextArrow"
      @click="nextSlide"
    ></button>
    <VueSlickCarousel ref="slick" v-bind="slickOptions">
      <div
        class="slick-slide"
        v-for="(block, index) in settings.blocks"
        :key="index"
      >
        <div class="fullbleed-slot video-container">
          <div class="video-wrapper">
            <div class="video-slide fullbleed-module">
              <video
                class="fullbleed-video yt-video-wrapper"
                muted="true"
                loop
                :autoplay="!block.props.showcontrols.value"
                preload="auto"
                :controls="block.props.showcontrols.value"
                v-if="
                  block.props.videoUrl.value &&
                    isMp4(block.props.videoUrl.value)
                "
                :class="settings.props.slide_height.value"
              >
                <source :src="block.props.videoUrl.value" type="video/mp4" />
              </video>

              <div
                v-if="isYoutube(block.props.videoUrl.value)"
                :class="settings.props.slide_height.value"
                class="yt-video-wrapper"
              >
                <div
                  class="yt-video"
                  :id="'yt-video-' + getYTVideoID(block.props.videoUrl.value)"
                  :data-videoid="getYTVideoID(block.props.videoUrl.value)"
                  :data-videometa="JSON.stringify(block.props)"
                ></div>
                <div
                  class="overlay"
                  @hover.stop=""
                  v-if="!block.props.showcontrols.value"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VueSlickCarousel>
  </div>
</template>
<settings>
{
  "name": "videoCarousel",
  "label": "Video Carousel",
  "blocks": [
    {
      "type": "video_item",
      "name": "Video Slide",
      "props": [
        {
          "id": "videoUrl",
          "type": "url",
          "label": "Video URL",
          "default": ""
        },
      
        {
          "type": "checkbox",
          "id": "showcontrols",
          "default": false,
          "label": "Show Controls on Video",
          "info":"Check to show controls on video"

        }
      ]
    }
  ],
  "props": [
    {
      "type": "select",
      "id": "slide_height",
      "options": [
        {
          "value": "adapt",
          "text": "Adapt to first video"
        },
        {
          "value": "small",
          "text": "Small"
        },
        {
          "value": "medium",
          "text": "Medium"
        },
        {
          "value": "large",
          "text": "Large"
        }
      ],
      "default": "adapt",
      "label": "Slide height",
      "info":"Size of the slide"

    },
    {
      "type": "checkbox",
      "id": "autoplay",
      "default": false,
      "label": "AutoPlay Slides",
            "info":"Check to autoplay slides"
    },
    {
      "type": "range",
      "id": "slide_interval",
      "min": 1,
      "max": 10,
      "step": 1,
      "unit": "sec",
      "label": "Change slides every",
      "default": 2,
      "info": "Autoplay slide duration"
    }
  ]
}
</settings>
<script>
import { isBrowser, isNode } from 'browser-or-node';
import VueSlickCarousel from "vue-slick-carousel";
export default {
  props: ['settings'],
  components: {
    VueSlickCarousel,
  },
  mounted() {
    var j = document.createElement('script'),
      f = document.getElementsByTagName('script')[0];
    j.src = '//www.youtube.com/iframe_api';
    j.async = true;
    f.parentNode.insertBefore(j, f);
    var self = this;
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = function() {
        setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
      };
    } else {
      setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
    }
  },
  data: function() {
    return {
      slickOptions: {
        autoplaySpeed: this.settings.props.autoplay.value
          ? this.settings.props.slide_interval.value * 1000
          : undefined, //convert to ms
        autoplay: this.settings.props.autoplay.value,
        arrows: true,
        dots: true,
        swipeToSlide: true,
        prevArrow: this.$refs.prevArrow,
        nextArrow: this.$refs.nextArrow,
      },
    };
  },
  methods: {
    prevSlide() {
      this.$refs.slick.prev();
    },
    nextSlide() {
      this.$refs.slick.next();
    },
    isMp4(url) {
      if (!url) {
        return false;
      }
      let ext = url.split('.').pop() || '';
      if (ext && ext.toLowerCase() === 'mp4') {
        return true;
      } else {
        return false;
      }
    },
    isYoutube(url) {
      let urlObj = new URL(url);

      if (
        urlObj.host.includes('youtu.be') ||
        urlObj.host.includes('youtube.com')
      ) {
        return true;
      }
      return false;
    },

    getYTVideoID(url) {
      let urlObj = new URL(url);
      let searchParams = urlObj.searchParams;
      let v = searchParams.get('v');
      if (urlObj.host.includes('youtu.be')) {
        v = urlObj.pathname.split('/').pop();
      }
      return v;
    },
    onYouTubeIframeAPIReady() {
      var ytVideos = document.querySelectorAll('.yt-video');
      if (!window.players) {
        window.players = {};
      }
      var players = window.players;
      ytVideos.forEach((node) => {
        let videoID = node.dataset.videoid;
        if (players[videoID]) {
          return;
        } else {
          if (players[videoID]) {
            return;
          } else {
            players[videoID] = {};
          }
        }
        let videoMeta = JSON.parse(node.dataset.videometa);
        let controls = videoMeta.showcontrols.value;
        let qautoplay = 0,
          qcontrols = 1,
          qmute = 0;

        if (!controls) {
          qautoplay = 1;
          qcontrols = 0;
          qmute = 1;
        }

        players[videoID].onReady = function(e) {
          if (qmute) {
            e.target.mute();
          }
          // e.target.setVolume(50); // For max value, set value as 100.
        };

        players[videoID].onStateChange = function(event) {
          if (event.data == YT.PlayerState.ENDED) {
            players[videoID].inst.seekTo(0);
            players[videoID].inst.playVideo();
          }
        };
        players[videoID].inst = new YT.Player('yt-video-' + videoID, {
          videoId: videoID, // The video id.
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: qautoplay, // Autoplay when page loads.
            controls: qcontrols,
            modestbranding: 1,
            loop: 1,
            fs: 0,
            cc_load_policty: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: players[videoID].onReady,
            onStateChange: players[videoID].onStateChange,
          },
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../node_modules/vue-slick-carousel/dist/vue-slick-carousel.css";
@import "../../node_modules/vue-slick-carousel/dist/vue-slick-carousel-theme.css";
.iframe {
  width: 100%;
  height: 100%;
}
.next-arrow,
.prev-arrow {
  position: absolute;
  top: 50%;
  background: transparent;
  border: none;
  transform: translateY(-50%);
  z-index: 1;
  cursor: pointer;
}
.next-arrow {
  right: 25px;
  @media @mobile {
    right: 10px;
  }
  &::before {
    color: gray;
    content: '→';
    font-family: slick;
    font-size: 25px;
  }
}
.prev-arrow {
  left: 25px;
  @media @mobile {
    left: 10px;
  }
  &::before {
    color: gray;

    content: '←';
    font-family: slick;
    font-size: 25px;
  }
}
.video-carousel {
  margin-top: 50px;
  overflow: hidden;
  position: relative;
}
.video-container {
  position: relative;
  overflow: hidden;
  list-style: none;
  padding: 0;
  z-index: 1;
  height: 100%;
}

.video-container-no-flexbox .swiper-slide {
  float: left;
}

.video-container-vertical > .swiper-wrapper {
  -ms-flex-direction: column;
  flex-direction: column;
}
.yt-video-wrapper {
  height: 500px;
  position: relative;
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .yt-video {
    height: 100%;
  }
}
.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: -ms-flexbox;
  display: flex;
  transition-property: transform;
  box-sizing: content-box;
  iframe.small {
    height: 350px;
    width: 100%;
  }
  iframe.medium {
    height: 550px;
    width: 100%;
  }
  iframe.large {
    height: 750px;
    width: 100%;
  }
}

.video-container-android .swiper-slide,
.swiper-wrapper {
  transform: translate3d(0, 0, 0);
}

.video-slide {
  -ms-flex-negative: 0;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  position: relative;
  transition-property: transform;
}
&.small {
  height: 350px;
}
&.medium {
  height: 550px;
}
&.large {
  height: 750px;
}
@media (min-width: 0px) and (max-width: 991.98px) {
  .video-wrapper {
    iframe.small {
      height: 350px;
      width: 100%;
    }
    iframe.medium {
      height: 350px;
      width: 100%;
    }
    iframe.large {
      height: 350px;
      width: 100%;
    }
  }
  .video-slide {
    &.small {
      height: 350px;
    }
    &.medium {
      height: 350px;
    }
    &.large {
      height: 350px;
    }
    &.small video {
      height: 350px;
      width: auto;
    }
    &.medium video {
      height: 350px;
      width: auto;
    }
    &.large video {
      height: 350px;
      width: auto;
    }
  }
}

.fullbleed-video {
  width: 100%;
}

/* .fullbleed-video.mobile {
    display: block
}

@media(min-width: 992px) {
    .fullbleed-video.mobile {
        display:none
    }
} */

/* .fullbleed-video.desktop {
    display: none
}

@media(min-width: 992px) {
    .fullbleed-video.desktop {
        display:block
    }
} */

.fullbleed-video-controls {
  cursor: pointer;
  box-sizing: border-box;
  border-color: transparent transparent transparent #fff;
  transition: 100ms all ease;
  will-change: border-width;
  padding: 0;
  height: 50px;
  height: 3.125rem;
  margin: 15px 15px 55px;
  margin: 0.9375rem 0.9375rem 3.4375rem;
  border-style: solid;
  border-width: 25px 0 25px 40px;
  border-width: 1.5625rem 0 1.5625rem 2.5rem;
}

.fullbleed-video-controls.playing {
  border-style: double;
  border-width: 0 0 0 40px;
  border-width: 0 0 0 2.5rem;
}

.fullbleed-video-controls.black {
  border-color: transparent transparent transparent #000;
}

.fullbleed-video-controls.red {
  border-color: transparent transparent transparent #ff1010;
}

.module-head,
.module-head-small,
.module-head-big,
.module-head-huge {
  font-family: roboto condensed, sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1.875rem;
  line-height: 1.1;
  margin: 0;
  letter-spacing: 0.8px;
  letter-spacing: 0.05rem;
}

@media (min-width: 992px) {
  .module-head,
  .module-head-small,
  .module-head-big,
  .module-head-huge {
    font-size: 2.5rem;
  }
}

.module-head-small {
  font-size: 1.375rem;
  letter-spacing: 0.65px;
  letter-spacing: 0.04063rem;
}

@media (min-width: 992px) {
  .module-head-small {
    font-size: 1.5rem;
    letter-spacing: 0.8px;
    letter-spacing: 0.05rem;
  }
}

.module-head-big {
  font-size: 46px;
  font-size: 2.875rem;
}

@media (min-width: 992px) {
  .module-head-big {
    font-size: 70px;
    font-size: 4.375rem;
    letter-spacing: 1.5px;
    letter-spacing: 0.09375rem;
  }
  .module-sub-head {
    span {
      font-size: 15px;
    }
  }
}

@media (min-width: 0px) and (max-width: 991.98px) {
  .module-head-big {
    font-size: 1.5rem;
    letter-spacing: 0.8px;
    letter-spacing: 0.05rem;
  }
  .module-sub-head {
    span {
      font-size: normal;
      text-align: center;
    }
  }
}

.module-head-huge {
  font-size: 80px;
  font-size: 5rem;
  letter-spacing: 0.85px;
  letter-spacing: 0.05312rem;
}

@media (min-width: 992px) {
  .module-head-huge {
    font-size: 126px;
    font-size: 7.875rem;
    letter-spacing: 2.6px;
    letter-spacing: 0.1625rem;
  }
}

.module-link {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  font-family: roboto condensed, sans-serif;
  letter-spacing: 1.05px;
  letter-spacing: 0.06563rem;
}

.module-link:hover {
  text-decoration: underline;
}

.link-underline {
  font-size: 0.75rem;
  text-decoration: underline;
  color: inherit;
}

@media (min-width: 992px) {
  .link-underline {
    font-size: 0.875rem;
  }
}

.module-text,
.module-text-no-margin {
  font-size: 0.75rem;
  line-height: 2;
  margin: 10px 0;
  margin: 0.625rem 0;
}

@media (min-width: 992px) {
  .module-text,
  .module-text-no-margin {
    font-size: 0.875rem;
    line-height: 1.9;
    margin: 20px 0;
    margin: 1.25rem 0;
  }
}

.module-text-no-margin {
  margin: 0;
}
</style>

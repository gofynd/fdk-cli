<template>
  <div
    class="fullbleed-slot video-container"
    v-if="settings.props.videoUrl.value"
  >
    <div class="video-wrapper">
      <div
        class="video-slide fullbleed-module"
        :class="settings.props.size.value"
      >
        <video
          class="fullbleed-video"
          :muted="!settings.props.showcontrols.value"
          :loop="!settings.props.showcontrols.value"
          :autoplay="!settings.props.showcontrols.value"
          :poster="settings.props.coverUrl.value"
          preload="auto"
          :controls="settings.props.showcontrols.value"
          v-if="
            settings.props.videoUrl.value &&
              isMp4(settings.props.videoUrl.value)
          "
        >
          <source :src="settings.props.videoUrl.value" type="video/mp4" />
        </video>
        <!-- <iframe v-if="isYoutube(settings.props.videoUrl.value)" 
        :src="getYTEmbed(settings.props.videoUrl.value,settings.props.showcontrols.value)"
        :class="settings.props.size.value"
        ></iframe> -->
        <div
          v-if="isYoutube(settings.props.videoUrl.value)"
          class="yt-video"
          :id="'yt-video-' + getYTVideoID(settings.props.videoUrl.value)"
          :data-videoid="getYTVideoID(settings.props.videoUrl.value)"
          :data-videometa="JSON.stringify(settings.props)"
        ></div>

        <div
          class="fullbleed-asset overlay"
          style="color: #fff"
          v-if="!settings.props.showcontrols.value"
        >
          <div class="col-12 fullbleed-center-center">
            <h2 class="module-head-big" v-if="settings.props.heading.value">
              {{ settings.props.heading.value }}
            </h2>
            <p class="module-sub-head" v-if="settings.props.subHeading.value">
              <span>{{ settings.props.subHeading.value }} </span>
            </p>
            <fdk-link
              v-if="settings.props.ctaLink.value"
              class="button secondary-white-btn"
              :link="settings.props.ctaLink.value"
              >{{ settings.props.ctaText.value }}</fdk-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<settings>
{
  "name": "videoBanner",
  "label": "Hero Video",
  "blocks": [
    
  ],
  "props": [
    {
      "id": "videoUrl",
      "type": "url",
      "label": "Video URL",
      "default": ""
    },
    {
      "id": "coverUrl",
      "type": "url",
      "label": "Video Cover Image URL",
      "default": ""
    },
    {
      "type": "checkbox",
      "id": "showcontrols",
      "default": false,
      "label": "Show Controls on Video",
      "info":"Check to show controls on video"
    },
    {
      "type": "select",
      "id": "size",
      "options": [
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
      "default": "small",
      "label": "Video Height",
          "info":"Height of Video"
    },
    {
      "type": "text",
      "id": "heading",
      "default": "",
      "label": "Heading"
    },
    {
      "type": "text",
      "id": "subHeading",
      "default": "",
      "label": "Sub-heading"
    },
    {
      "type": "url",
      "id": "ctaLink",
      "default": "",
      "label": "Redirect Link"
    },
    {
      "type": "text",
      "id": "ctaText",
      "default": "ShopNow",
      "label": "Button Text"
    }
  ]
}
</settings>
<style scoped lang="less">
button,
.button,
.buttonstyle {
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  background-color: #000;
  color: #fff;
  border: 0;
  width: 100%;
  font-weight: 700;
  font-family: roboto condensed, sans-serif;
  padding: 8px;
  padding: 0.5rem;
}

.button.secondary-white-btn {
  display: inline-block;
  font-family: roboto condensed, sans-serif;
  font-size: 0.875rem;
  width: 100%;
  text-align: center;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  padding: 10px 40px;
  padding: 0.625rem 2.5rem;
  letter-spacing: 1px;
  letter-spacing: 0.0625rem;
}

.button.secondary-white-btn {
  width: auto;
  padding: 12px 40px;
  padding: 0.75rem 2.5rem;
}

button.secondary-white-btn,
.button.secondary-white-btn {
  background: none repeat scroll 0 0 #fff;
  border: 1px solid #fff;
  color: #000;
}

button.secondary-white-btn:hover,
.button.secondary-white-btn:hover {
  background-color: transparent;
  color: #fff;
}
.video-container {
  position: relative;
  overflow: hidden;
  list-style: none;
  padding: 0;
  z-index: 1;
  margin-top: 50px;
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

.video-slide {
  -ms-flex-negative: 0;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  position: relative;
  transition-property: transform;
  max-height: 750px;
  &.small {
    height: 350px;
  }
  &.medium {
    height: 550px;
  }
  &.large {
    height: 750px;
  }
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

.fullbleed-top-left,
.fullbleed-top-center,
.fullbleed-top-right,
.fullbleed-center-left,
.fullbleed-center-center,
.fullbleed-center-right,
.fullbleed-bottom-left,
.fullbleed-bottom-center,
.fullbleed-bottom-right {
  position: absolute;
  box-sizing: border-box;
  padding: 15px 15px 45px;
  padding: 0.9375rem 0.9375rem 2.8125rem;
}

.fullbleed-top-left {
  top: 0;
  left: 0;
  text-align: left;
}

.fullbleed-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.fullbleed-top-right {
  top: 0;
  right: 0;
  text-align: right;
}

.fullbleed-center-left {
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  text-align: left;
}

.fullbleed-center-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.fullbleed-center-right {
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  text-align: right;
}

.fullbleed-bottom-left {
  bottom: 0;
  left: 0%;
  text-align: left;
}

.fullbleed-bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.fullbleed-bottom-right {
  bottom: 0;
  right: 0;
  text-align: right;
}

.fullbleed-asset {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 1330px;
  max-width: 83.125rem;
}
.fullbleed-asset p {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

.fullbleed-asset[data-href] {
  cursor: pointer;
}

.fullbleed-asset .button {
  box-sizing: border-box;
  margin: 0 10px 10px 0;
  margin: 0 0.625rem 0.625rem 0;
}

.fullbleed-video {
  height: 100%;
}

.module-head-big {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1.875rem;
  line-height: 1.1;
  margin: 0;
  letter-spacing: 0.8px;
  letter-spacing: 0.05rem;
}

@media (min-width: 992px) {
  .module-head-big {
    font-size: 2.5rem;
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
</style>
<script>
export default {
  props: ['settings'],
  watch: {
    settings: function(newVal, oldVal) {},
  },
  mounted() {
    this.loadYTScript();
  },
  data: function() {
    return {};
  },
  methods: {
    loadYTScript() {
      var self = this;
      if (typeof YT == 'undefined' || typeof YT.Player == 'undefined') {
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        tag.onload = () => {
          if (!window.onYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = function() {
              setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
            };
          } else {
            setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
          }
        };
      }
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
    /*getYTEmbed(url,controls){
            let urlObj = new URL(url);
            let qautoplay = 0,
            qcontrols=1, qmute=0, qloop=0,
            qorigin= "https://youtube.com/embed";

            if(!controls) {
                qautoplay=1;
                qcontrols=0;
                qmute=1;
                qloop=1;
            }
            let searchParams = urlObj.searchParams;
            let v = searchParams.get('v')
            if(urlObj.host.includes('youtu.be')) {
                qorigin = qorigin + urlObj.pathname + '?'
            } else {
                qorigin= qorigin +'?'+`v=${v}&`
            }
            return [qorigin,
            ,'rel=0&version=3',
            '&',`controls=${qcontrols}`,
            '&',`autoplay=${qautoplay}`,
            '&', `mute=${qmute}`,'&',`loop=${qloop}`
            ].join('')
        },*/
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
          players[videoID] = {};
        }
        let videoMeta = JSON.parse(node.dataset.videometa);
        let controls = videoMeta.showcontrols.value;
        let qautoplay = 0,
          qcontrols = 1,
          qmute = 0,
          qloop = 1;

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
          if (event.data == YT.PlayerState.ENDED && qloop) {
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
/**
 * Component Attributes:
 * video : {
        mobile: {
            urls: [
              {
                url:
                "https://res.cloudinary.com/dwzm9bysq/video/upload/v1590555153/x0/applications/app_5ec3d224848a007bfeacb550/media/assets/screen_saver/fiop4goo9vhtyhts3xdk.mp4",
                type: "video/mp4"
              }
            ],
            poster: "https://hdn-1.addsale.com/x0/company/7/applications/5ec3d224848a007bfeacb550/screensaver/pictures/free-banner/original/9WvgQmSv2-Screensaver.jpeg",
          },
          desktop: {
            urls: [
              {
                url: "https://res.cloudinary.com/dwzm9bysq/video/upload/v1590513588/x0/applications/app_5ec3d224848a007bfeacb550/media/assets/screen_saver/wgjsskk4cs90cgzdacf7.mp4",
                type: "video/mp4"
              }
            ],
            poster: "https://hdn-1.addsale.com/x0/company/7/applications/5ec3d224848a007bfeacb550/screensaver/pictures/free-banner/original/hASOMMCjV-Screensaver.jpeg"
          }
    },
    content: {
        mobile: {
            title: "DIESEL SPRING SALE",
            paragraph: "Shop the SS20 collection for your summer time at up to 30% off.",
            ctaLink: "/spring-sale/"
        },
        desktop: {
            title: "DIESEL SPRING SALE",
            paragraph: "Shop the SS20 collection for your summer time at up to 30% off.",
            ctaLink: "/spring-sale/"
        }
    }
 *
 */
// export default {
//   data() {
//     return {};
//   },
//   props: {
//     video: {
//       type: Object
//     },
//     content: {
//         type: Object
//     }
//   }
// };
</script>

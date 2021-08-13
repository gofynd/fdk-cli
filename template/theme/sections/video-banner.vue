<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <div class="video-container" :class="settings.props.size.value">
      <video
        style="width: 100%;"
        :muted="!settings.props.showcontrols.value"
        :loop="!settings.props.showcontrols.value"
        :autoplay="!settings.props.showcontrols.value"
        :poster="settings.props.coverUrl.value"
        preload="auto"
        :controls="settings.props.showcontrols.value"
        v-if="
          settings.props.videoUrl.value && isMp4(settings.props.videoUrl.value)
        "
      >
        <source :src="settings.props.videoUrl.value" type="video/mp4" />
      </video>

      <div
        class="yt-video"
        ref="yt-video"
        v-else-if="isYoutube(settings.props.videoUrl.value)"
        :id="'yt-video-' + getYTVideoID(settings.props.videoUrl.value)"
        :data-videoid="getYTVideoID(settings.props.videoUrl.value)"
        :data-videometa="JSON.stringify(settings.props)"
      ></div>
      <fdk-placeholder v-else type="banner-2" />
    </div>
    <div class="overlay">
      <div class="overlay__content">
        <div class="overlay__text">
          <h2
            v-if="settings.props.heading.value"
            :style="{ color: settings.props.heading_color.value }"
          >
            {{ settings.props.heading.value }}
          </h2>
          <p
            v-if="settings.props.subHeading.value"
            :style="{ color: settings.props.subheading_color.value }"
          >
            <span>{{ settings.props.subHeading.value }} </span>
          </p>
        </div>
        <button
          class="btn"
          v-if="settings.props.ctaLink.value || settings.props.ctaText.value"
        >
          <fdk-link :link="settings.props.ctaLink.value">
            {{ settings.props.ctaText.value }}
          </fdk-link>
        </button>
      </div>
    </div>
  </div>
</template>
<settings>
{
  "name": "videoBanner",
  "label": "Hero Video",
  "props": [
    {
      "id": "videoUrl",
      "type": "url",
      "label": "Video URL",
      "default": ""
    },
    {
      "type":"checkbox",
      "id":"full_width",
      "default": false,
      "label": "Full width",
      "info":"Check to allow items to take entire width of the viewport"
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
      "type":"color",
      "id":"heading_color",
      "default":"#000",
      "label":"Headin Text Color"
    },
    {
      "type": "text",
      "id": "subHeading",
      "default": "",
      "label": "Sub-heading"
    },
   {
      "type":"color",
      "id":"subheading_color",
      "default":"#000",
      "label":"Subheading Text Color"
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
.section-main-container {
  margin: 0 10px;
}
.btn {
  border: 0;
  background: none;
  a {
    display: inline-block;
    font-size: 14px;
    width: 100%;
    text-align: center;
    cursor: pointer;
    font-weight: 700;
    text-transform: uppercase;
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    padding: 10px 40px;
    letter-spacing: 1px;
    color: inherit;
    width: 200px;
    border-width: 2px;
    border-color: inherit;
    background-color: transparent;
    border-style: solid;
    @media (min-width: 320px) and (max-width: 768px) {
      width: 150px;
    }
  }
}
.btn:hover {
  filter: invert(1);
}
.video-container {
  position: relative;
  z-index: 1;
  video {
    width: 100%;
  }
}

.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  z-index: 2;
  &__content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    justify-content: center;
    align-items: center;
  }
  &__text {
    text-align: center;
    h2 {
      font-size: 40px;
      font-weight: 700;
      @media @mobile {
        font-size: 25px;
      }
      margin-bottom: 10px;
    }
    p {
      font-size: 20px;
      @media @mobile {
        font-size: 16px;
      }
      margin-bottom: 10px;
    }
  }
}
</style>

<script>
// import turbtn from './../global/components/tur-button';
export default {
  components: {
    // 'tur-button': turbtn,
  },
  props: ["settings"],
  watch: {
    settings: function(n, o) {
      if (n.props.videoUrl.value !== o.props.videoUrl.value) {
        setTimeout(this.onYouTubeIframeAPIReady.bind(this), 500);
      }
    },
  },
  mounted() {
    this.loadYTScript();
  },
  data: function() {
    return {
      // url: ""
    };
  },
  methods: {
    loadYTScript() {
      var self = this;
      if (typeof YT == "undefined" || typeof YT.Player == "undefined") {
        var tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName("script")[0];
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
      } else {
        this.onYouTubeIframeAPIReady();
      }
    },
    isMp4(url) {
      if (!url) {
        return false;
      }
      let ext = url.split(".").pop() || "";
      if (ext && ext.toLowerCase() === "mp4") {
        return true;
      } else {
        return false;
      }
    },
    isYoutube(url) {
      if (url) {
        let urlObj = new URL(url);

        if (
          urlObj.host.includes("youtu.be") ||
          urlObj.host.includes("youtube.com")
        ) {
          return true;
        }
      }

      return false;
    },
    getYTVideoID(url) {
      let urlObj = new URL(url);
      let searchParams = urlObj.searchParams;
      let v = searchParams.get("v");
      if (urlObj.host.includes("youtu.be")) {
        v = urlObj.pathname.split("/").pop();
      }
      return v;
    },
    onYouTubeIframeAPIReady() {
      const ytVideos = document.querySelectorAll(".yt-video");
      if (!window.players) {
        window.players = {};
      }
      var players = window.players;
      ytVideos.forEach((node) => {
        let videoID = node.dataset.videoid;
        players[videoID] = {};
        let videoMeta = JSON.parse(node.dataset.videometa);
        let controls = videoMeta.showcontrols.value;
        let qautoplay = 0,
          qcontrols = 1,
          qmute = 0,
          qloop = 0;

        if (!controls) {
          qautoplay = 1;
          qcontrols = 0;
          qmute = 1;
          qloop = 1;
        }

        players[videoID].onReady = function(e) {
          if (qmute) {
            e.target.mute();
          }
        };
        players[videoID].onStateChange = function(event) {
          if (event.data == YT.PlayerState.ENDED && qloop) {
            players[videoID].inst.seekTo(0);
            players[videoID].inst.playVideo();
          }
        };
        players[videoID].inst = new YT.Player("yt-video-" + videoID, {
          videoId: videoID, // The video id.
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: qautoplay,
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

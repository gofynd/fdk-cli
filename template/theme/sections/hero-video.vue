<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
    v-if="render"
  >
    <div class="video-container" :class="settings.props.size.value">
      <video
        ref="mp4video"
        width="100%"
        :poster="settings.props.cover_url.value"
        :autoplay="settings.props.autoplay.value"
        preload="auto"
        :controls="true"
        v-if="
          settings.props.video_url.value &&
            isMp4(settings.props.video_url.value)
        "
      >
        <source
          :src="settings.props.video_url.value"
          type="video/mp4"
          allowfullscreen
        />
      </video>
      <div
        class="yt-video"
        ref="ytVideo"
        v-else-if="
          settings.props.video_url.value &&
            isYoutube(settings.props.video_url.value)
        "
        :id="'yt-video-' + getYTVideoID(settings.props.video_url.value)"
        :data-videoid="getYTVideoID(settings.props.video_url.value)"
        :data-videometa="JSON.stringify(settings.props)"
        allowfullscreen
      ></div>
      <!-- <fdk-placeholder v-else type="banner-2" /> -->
      <div class="close-video-box" @click="closeVideo">
        <svg
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 512 512"
          style="enable-background:new 0 0 512 512;"
          xml:space="preserve"
        >
          <path
            d="M278.6,256l68.2-68.2c6.2-6.2,6.2-16.4,0-22.6c-6.2-6.2-16.4-6.2-22.6,0L256,233.4l-68.2-68.2c-6.2-6.2-16.4-6.2-22.6,0
          c-3.1,3.1-4.7,7.2-4.7,11.3c0,4.1,1.6,8.2,4.7,11.3l68.2,68.2l-68.2,68.2c-3.1,3.1-4.7,7.2-4.7,11.3c0,4.1,1.6,8.2,4.7,11.3
          c6.2,6.2,16.4,6.2,22.6,0l68.2-68.2l68.2,68.2c6.2,6.2,16.4,6.2,22.6,0c6.2-6.2,6.2-16.4,0-22.6L278.6,256z"
          />
        </svg>
      </div>
      <div
        class="overlay animated fadeIn"
        v-if="showPoster"
        :style="
          `background: #ccc url(${settings.props.cover_url.value}) center center / cover no-repeat;`
        "
      >
        <div
          class="overlay__content"
          :class="settings.props.overlay_position.value"
        >
          <div
            class="overlay__text"
            v-if="
              settings.props.heading.value || settings.props.sub_heading.value
            "
          >
            <h2
              v-if="settings.props.heading.value"
              :style="{ color: settings.props.heading_color.value }"
            >
              {{ settings.props.heading.value }}
            </h2>
            <p
              v-if="settings.props.sub_heading.value"
              :style="{ color: settings.props.sub_heading_color.value }"
            >
              <span>{{ settings.props.sub_heading.value }} </span>
            </p>
          </div>
          <div @click="playVideo" class="play-button">
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 512 512"
              style="enable-background:new 0 0 512 512;"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M256,48C141.1,48,48,141.1,48,256c0,114.9,93.1,208,208,208c114.9,0,208-93.1,208-208C464,141.1,370.9,48,256,48z
                  M339.8,259.9l-137.2,83c-2.9,1.8-6.7-0.4-6.7-3.9V173c0-3.5,3.7-5.7,6.7-3.9l137.2,83C342.7,253.8,342.7,258.2,339.8,259.9z"
                />
              </g>
            </svg>
          </div>
          <sm-button
            :backgroundcolortype="'primary'"
            :colortype="'primary'"
            :bordertype="'primary'"
            :padding="'primary'"
            :global_config="global_config"
            v-if="settings.props.button_text.value"
          >
            <fdk-link :link="settings.props.button_link.value">
              {{ settings.props.button_text.value }}
            </fdk-link>
          </sm-button>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- #region  -->
<settings>
{
  "name": "hero_video",
  "label": "Hero Video",
  "props": [
    {
      "id": "video_url",
      "type": "url",
      "label": "Video URL",
      "default": ""
    },
    {
      "id": "cover_url",
      "type": "image_picker",
      "label": "Video Cover Image",
      "default": ""
    },
    {
      "type": "checkbox",
      "id": "autoplay",
      "default": false,
      "label": "Autoplay",
      "info":"Check to enable autoplay of video"
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
      "default": "medium",
      "label": "Video Height",
      "info":"Height of Video"
    },
    {
        "id": "overlay_position",
        "type": "select",
        "options": [
            {
                "value": "top-left",
                "text": "Top Left"
            },
            {
                "value": "top-center",
                "text": "Top Center"
            },
            {
                "value": "top-right",
                "text": "Top Right"
            },
            {
                "value": "center-left",
                "text": "Center Left"
            },
            {
                "value": "center-center",
                "text": "Center (Default)"
            },
            {
                "value": "center-right",
                "text": "Center Right"
            },
            {
                "value": "bottom-left",
                "text": "Bottom Left"
            },
            {
                "value": "bottom-center",
                "text": "Bottom Center"
            },
            {
                "value": "bottom-right",
                "text": "Bottom right"
            }
        ],
        "default": "center-center",
        "label": "Overlay position",
        "info": "Alignment of Overlay content(heading, sub-heading, button)"
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
      "label":"Heading Text Color"
    },
    {
      "type": "text",
      "id": "sub_heading",
      "default": "",
      "label": "Sub-heading"
    },
    {
      "type":"color",
      "id":"sub_heading_color",
      "default":"#000",
      "label":"Sub-heading Text Color"
    },
    {
      "type": "url",
      "id": "button_link",
      "default": "",
      "label": "Redirect Link"
    },
    {
      "type": "text",
      "id": "button_text",
      "default": "",
      "label": "Button Text"
    },
    {
      "type":"checkbox",
      "id":"full_width",
      "default": false,
      "label": "Full width",
      "info":"Check to allow items to take entire width of the viewport"
    }
  ]
}
</settings>
<!-- #endregion -->
<style scoped lang="less">
.video-container {
  position: relative;
  z-index: 1;
  display: flex;
  overflow: hidden;
  &.small {
    height: 350px;
    width: 100%;
    @media @tablet {
      height: 230px;
    }
  }
  &.medium {
    height: 550px;
    width: 100%;
    @media @tablet {
      height: 230px;
    }
  }
  &.large {
    height: 750px;
    width: 100%;
    @media @tablet {
      height: 230px;
    }
  }
  .close-video-box {
    background: white;
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      width: 30px;
      height: 30px;
      cursor: pointer;
    }
  }
}
.center-overlay {
  left: unset;
  right: unset;
  align-items: center;
  text-align: center;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // transform: translate(-50%, -50%);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  &__content {
    display: flex;
    flex-direction: column;
    height: 120px;
    padding: 20px;
    justify-content: center;
    align-items: center;
    position: absolute;
    max-width: 350px;
    &.top-left {
      top: 15%;
      left: @header-padding-desktop;
      text-align: left;
      align-items: flex-start;
      @media @tablet {
        .center-overlay();
      }
    }
    &.top-center {
      top: 15%;
      text-align: center;
      @media @tablet {
        .center-overlay();
      }
    }
    &.top-right {
      top: 15%;
      right: @header-padding-desktop;
      text-align: right;
      align-items: flex-end;
      @media @tablet {
        .center-overlay();
      }
    }
    &.center-left {
      left: @header-padding-desktop;
      text-align: left;
      align-items: flex-start;
      @media @tablet {
        .center-overlay();
      }
    }
    &.center-center {
      top: unset;
      bottom: unset;
      text-align: center;
      .center-overlay();
    }
    &.center-right {
      top: unset;
      right: @header-padding-desktop;
      text-align: right;
      align-items: flex-end;
      @media @tablet {
        .center-overlay();
      }
    }
    &.bottom-left {
      bottom: 10%;
      left: @header-padding-desktop;
      text-align: left;
      align-items: flex-start;
      @media @tablet {
        .center-overlay();
      }
    }
    &.bottom-right {
      bottom: 10%;
      right: @header-padding-desktop;
      text-align: right;
      align-items: flex-end;
      @media @tablet {
        .center-overlay();
      }
    }
    &.bottom-center {
      bottom: 10%;
      text-align: center;
      @media @tablet {
        .center-overlay();
      }
    }
  }
  &__text {
    // text-align: center;
    margin-bottom: 16px;
    h2 {
      font-size: 30px;
      line-height: 31px;
      font-weight: 400;
      @media @mobile {
        font-size: 16px;
      }
      margin-bottom: 16px;
    }
    p {
      font-size: 16px;
      line-height: 24px;

      @media @mobile {
        font-size: 12px;
      }
    }
  }
  .play-button {
    svg {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
    margin-bottom: 48px;
    @media @tablet {
      margin-bottom: 35px;
    }
    @media @mobile {
      margin-bottom: 30px;
    }
  }
}
</style>

<script>
import btn from "./../components/common/button.vue";
export default {
  components: {
    "sm-button": btn,
  },
  props: ["settings", "global_config"],
  watch: {
    settings: function(newVal, oldVal) {
      this.render = false;
      this.showPoster = !newVal.props.autoplay.value;
      this.removeYTScript();
      this.$nextTick(() => {
        this.render = true;
        this.loadYTScript();
      });
    },
  },
  mounted() {
    this.loadYTScript();
    this.showPoster = !this.settings.props.autoplay.value;
  },
  data: function() {
    return {
      // url: ""
      render: true,
      showPoster: true,
    };
  },
  methods: {
    loadYTScript() {
      var self = this;
      let nodes = document.querySelectorAll("[data-ytscript]");
      if (nodes.length === 0) {
        var tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.dataset.ytscript = "true";
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
        if (window.onYouTubeIframeAPIReady) {
          setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
        }
      }
    },
    removeYTScript() {
      var players = window.players;
      if (players) {
        Object.keys(players).forEach((item) => {
          players[item].inst && players[item].inst.destroy();
        });
        window.players = null;
      }
      let nodes = document.querySelectorAll("[data-ytscript]");

      if (nodes.length > 0) {
        nodes.forEach((element) => {
          element.parentNode.removeChild(element);
        });
      }
      if (typeof YT !== "undefined") {
        window.YT = undefined;
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
      let urlObj = new URL(url);
      if (
        urlObj.host.includes("youtu.be") ||
        urlObj.host.includes("youtube.com")
      ) {
        return true;
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
      let ytVideos = document.querySelectorAll(".yt-video");
      if (!window.players) {
        window.players = {};
      }
      let players = window.players;
      for (let i = 0; i < ytVideos.length; i++) {
        let node = ytVideos[i];
        let videoID = node.dataset.videoid;
        if (players[videoID]) {
          continue;
        }

        players[videoID] = {};

        let videoMeta = JSON.parse(node.dataset.videometa);
        let controls = true;
        let qautoplay = videoMeta.autoplay.value,
          qcontrols = 1,
          qmute = 0;

        // if (!controls) {
        //   qautoplay = 1;
        //   qcontrols = 0;
        //   qmute = 1;
        // }

        players[videoID].onReady = function(e) {
          if (qmute) {
            e.target.mute();
          }
          if (qautoplay) {
            e.target.playVideo();
          }
        };
        players[videoID].onStateChange = function(event) {
          var p = window.players;
          if (event.data == YT.PlayerState.ENDED) {
            p[videoID].inst.seekTo(0);
            p[videoID].inst.playVideo();
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
            origin: document.location.origin,
          },
          events: {
            onReady: players[videoID].onReady,
            onStateChange: players[videoID].onStateChange,
          },
        });
      }
    },
    playMp4() {
      this.showPoster = false;
      this.$refs.mp4video.play();
    },
    playYT() {
      this.showPoster = false;
      let videoID = this.$refs.ytVideo.dataset.videoid;
      var p = window.players;
      p[videoID].inst.playVideo();
    },
    playVideo() {
      if (this.isMp4(this.settings.props.video_url.value)) {
        this.playMp4();
      } else {
        this.playYT();
      }
    },
    stopMp4() {
      this.$refs.mp4video.pause();
      this.$refs.mp4video.currentTime = 0;
      this.$refs.mp4video.setAttribute("data-icon", "P");
    },
    stopYT() {
      let videoID = this.$refs.ytVideo.dataset.videoid;
      var p = window.players;
      p[videoID].inst.pauseVideo();
      p[videoID].inst.seekTo(0);
    },
    closeVideo() {
      this.showPoster = true;
      if (this.isMp4(this.settings.props.video_url.value)) {
        this.stopMp4();
      } else {
        this.stopYT();
      }
    },
  },
};
</script>

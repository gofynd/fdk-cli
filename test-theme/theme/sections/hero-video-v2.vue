<template>
  <div v-if="render" :style="dynamicStyles">
    <h2
      class="video-heading font-header section-heading"
      v-if="getSectionPropValue(settings, 'title')"
    >
      {{ getSectionPropValue(settings, "title") }}
    </h2>
    <div class="video-container">
      <!-- <skeleton
        v-show="isLoading"
        :aspectRatio="16 / 9"
        :mobileAspectRatio="16 / 9"
      /> -->
      <template v-if="isMounted">
        <video
          ref="mp4video"
          width="100%"
          :poster="getSectionPropValue(settings, 'coverUrl')"
          :autoplay="!!checkVideoAutoplay"
          :muted="!!checkVideoMute"
          :loop="!!checkVideoLoop"
          :controls="!!checkVideoControls"
          WebKitPlaysInline="true"
          playsinline
          @pause="showOverlay = true"
          @ended="showOverlay = true"
          @play="showOverlay = false"
          @loadeddata="isLoading = false"
          preload="auto"
          :src="src"
          allowfullscreen
          v-if="(isMp4(getVideoSource()) || isGdrive()) && loaded"
          @progress="isLoading = false"
        ></video>
        <div
          class="yt-container"
          v-if="isYoutube() && loaded"
          v-show="!isLoading"
        >
          <div
            class="yt-video"
            ref="ytVideo"
            :id="'yt-video-' + getYTVideoID(settings.props.videoUrl.value)"
            :data-videoid="getYTVideoID(settings.props.videoUrl.value)"
            :data-videometa="JSON.stringify(settings.props)"
            allowfullscreen
          ></div>
        </div>
      </template>
      <div
        class="overlay animated fadeIn"
        :class="{
          'overlay-noimage': !getSectionPropValue(settings, 'coverUrl'),
        }"
        v-if="showOverlay"
        v-show="!isLoading"
      >
        <div
          class="overlay__image"
          v-if="getSectionPropValue(settings, 'coverUrl')"
          :style="`background: #ccc url(${getSectionPropValue(
            settings,
            'coverUrl'
          )}) center center / cover no-repeat;`"
        ></div>
        <div class="overlay__content">
          <div @click="playVideo()" class="play-button">
            <svg-wrapper :svg_src="'play'"></svg-wrapper>
          </div>
        </div>
      </div>
      <div class="pause-button" @click="closeVideo" v-show="!showOverlay">
        <svg-wrapper :svg_src="'pause'"></svg-wrapper>
      </div>
    </div>
  </div>
</template>
  <!-- #region  -->
  <settings>
  {
    "name": "hero_video-v2",
    "label": "Hero Video V2",
    "props": [
      {
        "type":"video",
        "id":"videoFile",
        "default": false,
        "label": "Primary Video"
      },
      {
        "id": "videoUrl",
        "type": "text",
        "label": "Video URL",
        "default": "",
        "info":"Supports MP4 Video & Youtube Video URL"
      },
      {
        "type": "checkbox",
        "id": "autoplay",
        "default": true,
        "label": "Autoplay",
        "info":"Check to enable autoplay (Video will be muted if autoplay is active)"
      },
      {
        "type": "checkbox",
        "id": "hidecontrols",
        "default": true,
        "label": "Hide Video Controls",
        "info":"check to disable video controls"
      },
      {
        "type":"checkbox",
        "id":"showloop",
        "default":"true",
        "label":"Play Video in Loop",
        "info":"check to disable Loop"
      },
      {
        "type":"text",
        "id":"title",
        "default":"",
        "label":"Heading"
      },
      {
        "id": "coverUrl",
        "type": "image_picker",
        "label": "Thumbnail Image",
        "default": ""
      }
    ]
  }
  </settings>
  <!-- #endregion -->
  
  <script>
import SvgWrapper from "../components/common/svg-wrapper.vue";
import { getSectionPropValue, getGlobalConfigValue } from "../helper/utils";
import skeleton from "../global/components/skeletons/image-skeleton.vue";
import { isBrowser } from "browser-or-node";
export default {
  components: {
    "svg-wrapper": SvgWrapper,
    skeleton,
  },
  props: ["settings", "global_config"],
  watch: {
    settings: function (newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.render = false;
        this.showOverlay = !newVal?.props?.autoplay?.value;
        if (this.isYoutube(newVal?.props?.videoUrl?.value)) {
          this.removeYTScript();
        }
        this.$nextTick(() => {
          this.render = true;
          if (this.isYoutube(newVal?.props?.videoUrl?.value)) {
            this.loadYTScript();
          }
        });
      }
    },
  },
  beforeDestroy() {
    this.observer.disconnect();
  },
  mounted() {
    this.isMounted = true;
    if (isBrowser) {
      this.observer = new IntersectionObserver(this.handleIntersection, {
        threshold: 0.5,
      });
      this.observer.observe(this.$el);
    }
  },
  data: function () {
    return {
      render: true,
      isMounted: false,
      showOverlay: true,
      isLoading: true,
      observer: null,
      src: "",
      loaded: false,
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
            window.onYouTubeIframeAPIReady = function () {
              setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
            };
          } else {
            setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
          }
        };
      } else {
        if (!window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady = function () {
            setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
          };
        } else {
          setTimeout(self.onYouTubeIframeAPIReady.bind(self), 500);
        }
      }
    },
    handleIntersection(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (this.isMp4(this.getVideoSource()) || this.isGdrive()) {
            this.loadVideo();
            this.observer.unobserve(this.$el);
            return;
          }
          if (this.isYoutube()) {
            this.loadYTScript();
            this.observer.unobserve(this.$el);
          }
        }
      });
    },
    loadVideo() {
      this.src = this.getVideoSource();
      this.loaded = true;
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
    isMp4(url = getSectionPropValue(this.settings, "videoUrl")) {
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
    isGdrive(url = getSectionPropValue(this.settings, "videoUrl")) {
      if (!url) {
        return false;
      }
      if (isBrowser) {
        let urlObj = new URL(url);
        if (urlObj.host.includes("drive.google.com")) {
          return true;
        }
      }
      return false;
    },
    isYoutube(url = getSectionPropValue(this.settings, "videoUrl")) {
      if (!url) {
        return false;
      }
      if (isBrowser) {
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
      if (isBrowser) {
        let urlObj = new URL(url);
        let searchParams = urlObj.searchParams;
        let v = searchParams.get("v");
        if (urlObj.host.includes("youtu.be")) {
          v = urlObj.pathname.split("/").pop();
        }
        return v;
      }
    },
    onYouTubeIframeAPIReady() {
      let ytVideos = this.$refs.ytVideo;
      window.players = { ...window.players };
      let players = window.players;

      if (ytVideos) {
        let node = ytVideos;
        let videoID = node.dataset.videoid;
        if (!players[videoID]) {
          players[videoID] = {};
        }

        let videoMeta = JSON.parse(node.dataset.videometa);
        let qautoplay = videoMeta.autoplay.value ? 1 : 0;
        let qcontrols = videoMeta.hidecontrols.value ? 0 : 1,
          qmute = videoMeta.autoplay.value;
        let qloop = videoMeta.showloop.value ? 0 : 1;
        players[videoID].onReady = function (e) {
          if (qmute) {
            e.target.mute();
          }
          // if (qloop) {
          //   e.target.loop();
          // }
          if (qautoplay) {
            e.target.playVideo();
          }
          this.isLoading = false;
        }.bind(this);
        players[videoID].onStateChange = function (event) {
          var p = window.players;
          if (
            // eslint-disable-next-line no-undef
            event.data == YT.PlayerState.PLAYING ||
            // eslint-disable-next-line no-undef
            event.data == YT.PlayerState.BUFFERING
          ) {
            this.showOverlay = false;
          }

          // eslint-disable-next-line no-undef
          if (event.data == YT.PlayerState.PAUSED) {
            this.showOverlay = true;
          }

          // eslint-disable-next-line no-undef
          if (event.data == YT.PlayerState.ENDED) {
            if (qloop == true) {
              this.showOverlay = true;
            } else {
              p[videoID].inst.playVideo();
              p[videoID].inst.seekTo(0);
            }
          }
        }.bind(this);
        // eslint-disable-next-line no-undef
        players[videoID].inst = new YT.Player("yt-video-" + videoID, {
          videoId: videoID, // The video id.
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: qautoplay,
            controls: qcontrols,
            modestbranding: 1,
            mute: qmute,
            loop: qloop,
            fs: 0,
            WebKitPlaysInline: "true",
            playsinline: 1,
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
      this.showOverlay = false;
      this.$refs.mp4video.play();
    },
    playYT() {
      this.showOverlay = false;
      let videoID = this.$refs.ytVideo.dataset.videoid;
      var p = window.players;
      p[videoID].inst.playVideo();
    },
    playVideo() {
      if (this.isMp4(this.getVideoSource()) || this.isGdrive()) {
        this.playMp4();
      } else {
        this.playYT();
      }
    },
    getVideoSource() {
      if (getSectionPropValue(this.settings, "videoFile")) {
        return getSectionPropValue(this.settings, "videoFile");
      }
      if (this.isGdrive()) {
        return this.getGdriveVideoUrl();
      }
      return getSectionPropValue(this.settings, "videoUrl");
    },
    getGdriveVideoUrl() {
      if (isBrowser) {
        const videoUrl = getSectionPropValue(this.settings, "videoUrl");
        let urlObj = new URL(videoUrl);
        let v = urlObj.pathname.split("/");
        let fileId = v[v.indexOf("d") + 1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }

      return "";
    },
    getSectionPropValue,
    stopMp4() {
      this.$refs.mp4video.pause();
    },
    stopYT() {
      let videoID = this.$refs.ytVideo.dataset.videoid;
      var p = window.players;
      p[videoID].inst.pauseVideo();
      p[videoID].inst.seekTo(0);
    },
    closeVideo() {
      if (this.isMp4(this.getVideoSource()) || this.isGdrive()) {
        this.stopMp4();
      } else {
        this.stopYT();
      }
    },
  },
  computed: {
    checkVideoAutoplay() {
      // returns true if Autoplay is selected
      return getSectionPropValue(this.settings, "autoplay");
    },
    checkVideoMute() {
      // returns true if Autoplay is selected
      return this.checkVideoAutoplay;
    },
    checkVideoLoop() {
      return getSectionPropValue(this.settings, "showloop");
    },
    checkVideoControls() {
      //returns false if video controls are disabled
      return !getSectionPropValue(this.settings, "hidecontrols");
    },
    dynamicStyles() {
      return {
        "margin-top": `${getGlobalConfigValue(
          this.global_config,
          "section_margin_top"
        )}px`,
        "margin-bottom": `${getGlobalConfigValue(
          this.global_config,
          "section_margin_bottom"
        )}px`,
      };
    },
  },
};
</script>
  
  <style scoped lang="less">
.video-heading {
  text-align: center;
  margin-top: 16px;
  margin-bottom: 32px;
}
.video-container {
  position: relative;
  // .aspect-ratio(16/9);
  aspect-ratio: 16/9;
  &.fullscreen {
    height: 100vh;
    .yt-container {
      height: 100vh;
      & > ::v-deep * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
  &.video-background::before {
    content: "";
    position: absolute;
    inset: 0;
    user-select: none;
  }
  video {
    height: 100%;
    object-fit: cover;
  }
  .yt-container {
    height: 100%;
  }
  &:hover {
    .pause-button {
      display: block;
    }
  }
}
.center-overlay {
  text-align: center;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
}
.overlay-noimage {
  margin: 50px 0;
}
.overlay {
  &__image,
  &__color {
    position: absolute;
    inset: 0;
  }
  &__content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .play-button {
    ::v-deep svg {
      width: 80px;
      height: 80px;
      opacity: 0.5;
      cursor: pointer;
    }
    margin-bottom: 10px;
  }
  .btn {
    padding: 15px;
    border-radius: 5px;
    border: none;
    font-weight: 800;
    text-transform: uppercase;
  }
}
.pause-button {
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  display: none;
  ::v-deep svg {
    width: 80px;
    height: 80px;
    opacity: 0.5;
    cursor: pointer;
  }
  ::v-deep path {
    fill: white;
  }
  ::v-deep circle {
    fill: black;
  }
}
</style>
  
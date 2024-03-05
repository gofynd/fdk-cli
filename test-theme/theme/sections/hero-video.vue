<template>
  <div
    class="section-wrapper" :style="dynamicStyles"
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
    v-if="render"
  >
    <div class="video-container" :class="getValueById('size')">
      <video
        ref="mp4video"
        width="100%"
        :poster="getValueById('cover_url')"
        :autoplay="checkVideoAutoplay()"
        :muted="checkVideoMute()"
        :loop="getValueById('bg_video')"
        :controls="checkVideoControls() ? true : false"
        playsinline
        @pause="showOverlay = true"
        @ended="showOverlay = true"
        @play="!getValueById('bg_video') ? (showOverlay = false) : ''"
        preload="auto"
        v-if="isMp4()"
      >
        <source
          :src="settings.props.video_url.value"
          type="video/mp4"
          allowfullscreen
        />
      </video>
      <div class="yt-container" v-else-if="isYoutube()">
        <div
          class="yt-video"
          ref="ytVideo"
          :id="'yt-video-' + getYTVideoID(settings.props.video_url.value)"
          :data-videoid="getYTVideoID(settings.props.video_url.value)"
          :data-videometa="JSON.stringify(settings.props)"
          allowfullscreen
        ></div>
      </div>
      <div
        id="video_overlay"
        ref="video_overlay"
        class="overlay animated fadeIn"
        v-show="showOverlay"
      >
        <div
          v-if="
            getValueById('enable_overlay_image') && !getValueById('bg_video')
          "
          class="overlay__image"
          :style="`background: #ccc url(${getValueById(
            'cover_url'
          )}) center center / cover no-repeat;`"
        ></div>
        <div
          v-if="checkOverlaySize('container')"
          class="overlay__color"
          :style="`background-color:${getValueById('overlay_color')};opacity:${
            settings.props.overlay_opacity.value
          }`"
        ></div>
        <div class="overlay__content" :class="getValueById('overlay_position')">
          <div
            v-if="checkOverlaySize('content')"
            class="overlay__color"
            :style="`background-color:${getValueById(
              'overlay_color'
            )};opacity:${settings.props.overlay_opacity.value}`"
          ></div>
          <div class="overlay__content--text">
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
            <div
              v-if="!getValueById('bg_video')"
              @click="playVideo"
              class="play-button"
            >
              <svg-wrapper :svg_src="'play'"></svg-wrapper>
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
      "type": "text",
      "label": "Video URL",
      "default": "",
      "info":"Supports MP4 Video & Youtube Video URL"
    },
    {
      "type": "range",
      "id": "margin_top",
      "min": 0,
      "max": 1000,
      "step": 1,
      "unit": "px",
      "label": "Section Top Margin",
      "default": 0
    },
    {
      "type": "range",
      "id": "margin_bottom",
      "min": 0,
      "max": 1000,
      "step": 1,
      "unit": "px",
      "label": "Section Bottom Margin",
      "default": 0
    },
    {
      "type": "checkbox",
      "id": "autoplay",
      "default": false,
      "label": "Autoplay",
      "info":"Check to enable autoplay (Video will be muted if autoplay is active)"
    },
    {
      "type": "checkbox",
      "id": "controls",
      "default": true,
      "label": "Video Controls",
      "info":"Uncheck to disable video controls"
    },
    {
      "type":"checkbox",
      "id":"full_width",
      "default": false,
      "label": "Full width",
      "info":"Check to allow items to take entire width of the viewport"
    },
    {
      "type": "checkbox",
      "id": "bg_video",
      "default": false,
      "label": "Video In Background",
      "info":"Use video in background with overlay (Overlay Image & Video Controls will be disabled by default on website)"
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
        },
        {
          "value":"adapt",
          "text":"Adapt"
        },
        {
          "value":"fullscreen",
          "text":"Fullscreen"
        }
      ],
      "default": "medium",
      "label": "Video Height",
      "info":"Height of Video"
    },
    {
      "type":"checkbox",
      "id":"enable_overlay_image",
      "default": false,
      "label": "Enable Overlay Image"
    },
    {
      "id": "cover_url",
      "type": "image_picker",
      "label": "Video Overlay Image",
      "default": ""
    },
    {
      "type":"checkbox",
      "id":"enable_overlay_color",
      "default": false,
      "label": "Enable Overlay Colour"
    },
    {
      "type":"color",
      "id":"overlay_color",
      "default":"#000",
      "label":"Overlay Color"
    },
    {
      "type": "range",
      "id": "overlay_opacity",
      "min": 0,
      "max": 1,
      "step": 0.1,
      "unit": "",
      "label": "Overlay Opacity",
      "default": 0.5
    },
    {
      "type": "select",
      "id": "overlay_size",
      "options": [
        {
          "value": "container",
          "text": "Container (Default)"
        },
        {
          "value": "content",
          "text": "Content"
        }
      ],
      "default": "container",
      "label": "Overlay Size"
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
    }
  ]
}
</settings>
<!-- #endregion -->

<script>
import btn from "./../components/common/button.vue";
import SvgWrapper from "./../components/common/svg-wrapper.vue";

export default {
  components: {
    "sm-button": btn,
    "svg-wrapper": SvgWrapper,
  },
  props: ["settings", "global_config"],
  watch: {
    settings: function (newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.render = false;
        this.showOverlay = !newVal?.props?.autoplay?.value;
        if (this.isYoutube(newVal.props.video_url.value)) {
          this.removeYTScript();
        }
        this.$nextTick(() => {
          this.render = true;
          if (this.isYoutube(newVal.props.video_url.value)) {
            this.loadYTScript();
          }
        });
      }
    },
  },
  computed: {
    dynamicStyles() {
      return {
        "--margin-top":`${this.settings?.props?.margin_top?.value}px`,
        "--margin-bottom": `${this.settings?.props?.margin_bottom?.value}px`,
      };
    },
  },
  beforeMount() {
    this.showOverlay =
      this.getValueById("bg_video") || !this.getValueById("autoplay");
  },
  mounted() {
    if (this.isYoutube()) {
      this.loadYTScript();
    }
  },
  data: function () {
    return {
      render: true,
      showOverlay: true,
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
    isMp4(url = this.getValueById("video_url")) {
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
    isYoutube(url = this.getValueById("video_url")) {
      if (!url) {
        return false;
      }
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
      // if (!window.players) {
      window.players = {};
      // }
      let players = window.players;
      for (let i = 0; i < ytVideos.length; i++) {
        let node = ytVideos[i];
        let videoID = node.dataset.videoid;
        if (players[videoID]) {
          continue;
        }

        players[videoID] = {};

        let videoMeta = JSON.parse(node.dataset.videometa);
        let qautoplay = videoMeta.autoplay.value || videoMeta.bg_video.value,
          qcontrols =
            videoMeta.controls.value && !videoMeta.bg_video.value ? 1 : 0,
          qmute = videoMeta.autoplay.value || videoMeta.bg_video.value;

        players[videoID].onReady = function (e) {
          if (qmute) {
            e.target.mute();
          }
          if (qautoplay) {
            e.target.playVideo();
          }
        };
        players[videoID].onStateChange = function (event) {
          var p = window.players;
          if (event.data == YT.PlayerState.PLAYING) {
            document.getElementById("video_overlay").style.display = "none";
          }

          if (event.data == YT.PlayerState.PAUSED) {
            document.getElementById("video_overlay").style.display = "flex";
          }

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
            mute: qmute,
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
      this.showOverlay = false;
      this.$refs.mp4video.play();
    },
    playYT() {
      this.showOverlay = false;
      this.$refs.video_overlay.style.display = "none";
      let videoID = this.$refs.ytVideo.dataset.videoid;
      var p = window.players;
      p[videoID].inst.playVideo();
    },
    playVideo() {
      if (this.isMp4()) {
        this.playMp4();
      } else {
        this.playYT();
      }
    },
    checkOverlaySize(size) {
      return (
        this.getValueById("enable_overlay_color") &&
        this.getValueById("overlay_size") === size
      );
    },
    checkVideoAutoplay() {
      // returns true if either Autoplay or Video in Background is selected
      return this.getValueById("autoplay") || this.getValueById("bg_video");
    },
    checkVideoMute() {
      // returns true if either Autoplay or Video in Background is selected
      return this.checkVideoAutoplay();
    },
    checkVideoControls() {
      //returns false if video controls are disabled or Video in Background is selected
      if (this.getValueById("controls") && !this.getValueById("bg_video"))
        return true;

      return false;
    },
    getValueById(id) {
      return this.settings?.props?.[id]?.value || "";
    },
  },
};
</script>

<style scoped lang="less">
.section-wrapper {
  margin-top: var(--margin-top);
  margin-bottom: var(--margin-bottom);
}
.video-container {
  position: relative;

  &.small {
    height: 350px;
    @media @tablet {
      height: 250px;
    }
  }
  &.medium {
    height: 550px;
    @media @tablet {
      height: 400px;
    }
  }
  &.large {
    height: 750px;
    @media @tablet {
      height: 550px;
    }
  }
  &.adapt {
    video {
      width: 100%;
      height: auto;
    }
    .yt-container {
      padding-top: 56.25%;
      & > ::v-deep * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
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
  video {
    height: 100%;
    object-fit: cover;
  }
  .yt-container {
    height: 100%;
  }
}
.center-overlay {
  text-align: center;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
}
.overlay {
  &__image,
  &__color {
    position: absolute;
    inset: 0;
  }
  &__content {
    min-height: 120px;
    padding: 20px;
    position: absolute;
    max-width: 350px;
    &--text {
      z-index: 2;
      isolation: isolate;
    }
    &.top-left {
      top: 15%;
      left: @header-padding-desktop;
      @media @tablet {
        .center-overlay();
      }
    }
    &.top-center {
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      @media @tablet {
        .center-overlay();
      }
    }
    &.top-right {
      top: 15%;
      right: @header-padding-desktop;
      text-align: right;
      @media @tablet {
        .center-overlay();
      }
    }
    &.center-left {
      left: @header-padding-desktop;
      top: 50%;
      transform: translateY(-50%);
      @media @tablet {
        .center-overlay();
      }
    }
    &.center-center {
      text-align: center;
      .center-overlay();
    }
    &.center-right {
      right: @header-padding-desktop;
      top: 50%;
      transform: translateY(-50%);
      text-align: right;
      @media @tablet {
        .center-overlay();
      }
    }
    &.bottom-left {
      bottom: 10%;
      left: @header-padding-desktop;
      @media @tablet {
        .center-overlay();
      }
    }
    &.bottom-right {
      bottom: 10%;
      right: @header-padding-desktop;
      text-align: right;
      @media @tablet {
        .center-overlay();
      }
    }
    &.bottom-center {
      bottom: 10%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      @media @tablet {
        .center-overlay();
      }
    }
  }
  &__text {
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
    ::v-deep svg {
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

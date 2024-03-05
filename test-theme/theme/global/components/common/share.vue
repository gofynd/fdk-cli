<!-- this file is not used anywhere in the project -->
<template>
  <div class="share-popup" @click.stop="">
    <template v-if="!shareLoading">
      <p class="popup-title" v-if="title">
        {{ title }}
      </p>
      <div class="close" @click="close"></div>
      <div class="qr-code">
        <div v-html="qr_code"></div>
      </div>
      <p style="margin-bottom:10px">OR</p>
      <div class="icons">
        <div class="facebook" @click="copyToClipboard">
          <img
            src="../../assets/images/copy-to-clip.svg"
            title="copy"
            alt=""
          />
        </div>
        <div class="facebook" @click="shareOnFacebook">
          <img
            src="../../assets/images/fb.svg"
            title="facebook"
            alt=""
          />
        </div>
        <div class="twitter" @click="shareOnTwitter">
           <img
            src="../../assets/images/twitter.svg"
            title="twitter"
            alt=""
          />
        </div>
      </div>
    </template>
    <div v-else>
      <div class="loader-center" v-if="shareLoading">
        <img src="./../../../assets/images/loader.gif" alt="" />
      </div>
    </div>
    <toast :style="`z-index:10;top:30%`" :id="'toast-message'" :content="toast_message"></toast>
  </div>
</template>

<script>
import { copyToClipboard } from "../../../helper/utils";
import toast from "../toast.vue";
export default {
  name: "share",
  props: ["share_link", "title", "qr_code", "shareLoading"],
  components: {
    toast,
  },
  data() {
    return {
      toast_message: "",
    };
  },
  methods: {
    close() {
      this.$emit("close-share");
    },
    shareOnFacebook(e) {
      e.stopPropagation();
      e.preventDefault();
      var facebookWindow = window.open(
        "https://www.facebook.com/sharer/sharer.php?u=" + this.share_link,
        "facebook-popup",
        "height=350,width=600"
      );
      if (facebookWindow.focus) {
        facebookWindow.focus();
      }
      return false;
    },
    shareOnTwitter(e) {
      e.stopPropagation();
      e.preventDefault();
      var twitterWindow = window.open(
        "https://twitter.com/share?url=" + this.share_link,
        "twitter-popup",
        "height=350,width=600"
      );
      if (twitterWindow.focus) {
        twitterWindow.focus();
      }
      return false;
    },
    copyToClipboard(event) {
      event.stopPropagation();
      copyToClipboard(this.share_link);
      this.showToast("Link Copied to Clipboard");
    },
    showToast: function showToast(message) {
      if (message) {
        this.toast_message = message;
      }
      var x = document.getElementById("toast-message");
      x.className = "toast show";
      setTimeout(function() {
        x.className = x.className.replace("toast show", "toast hide");
      }, 3000);
    },
  },
};
</script>

<style lang="less" scoped>
.share-popup {
  position: absolute;
  right: 30px;
  background-color: white;
  box-shadow: 0px 0px 3px 0px #00000042;
  top: -10px;
  width: 250px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: auto;
  font-weight: normal;
  text-transform: initial;
  z-index: 3;
  .popup-title {
    font-size: 12px;
    padding: 25px 10px 0;
    line-height: 15px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    @media @mobile {
      font-size: 14px;
      padding: 25px;
      line-height: 20px;
    }
  }
  @media @mobile {
    position: fixed;
    top: 0;
    left: 0;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    z-index: 10;
  }
  .close {
    display: none;
    position: absolute;
    background-image: url("./../../../assets/images/close-icon.png");
    background-position: -957px 0;
    background-repeat: no-repeat;
    cursor: pointer;
    width: 22px;
    height: 22px;
    @media @mobile {
      top: 10px;
      right: 10px;
      display: block;
    }
  }

  .icons {
    display: flex;
    margin-bottom: 10px;

    div {
      padding: 5px 0;
      cursor: pointer;
      width: 25px;
      @media @mobile {
        width: 35px;
      }
      &:not(:last-child) {
        margin-right: 15px;
      }
    }
  }
}
</style>

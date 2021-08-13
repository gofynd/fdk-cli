<template>
  <div class="fullbleed-slot video-container" v-if="video && content"> 
    <div class="video-wrapper">
        <div class="video-slide fullbleed-module">
        <video
            class="fullbleed-video mobile"
            playsinline
            loop
            muted
            preload="none"
            autoplay
            :poster="video.mobile.poster"
        >
            <source v-for="(link,index) in video.mobile.urls" :src="link.url" :type="link.type" :key="'vid-link-mobile-'+index"/>
        </video>
        <video
            class="fullbleed-video desktop"
            playsinline
            loop
            muted
            autoplay
            preload="none"
            :poster="video.desktop.poster"
        >
            <source v-for="(link,index) in video.desktop.urls" :src="link.url" :type="link.type" :key="'vid-link-desktop'+index"/>
        </video>
        <div class="fullbleed-asset mobile" style="color: #fff">
            <div class="col-8 fullbleed-center-center">
            <h2 class="module-head-small">{{ content.mobile.title }}</h2>
            <p
                style="text-align:center"
            >{{ content.mobile.paragraph }}</p>
            <br />
            <fdk-link
                class="button secondary-white-btn"
                :link="content.mobile.ctaLink"
            >SHOP NOW</fdk-link>
            </div>
        </div>
        <div class="fullbleed-asset desktop" style="color: #fff">
            <div class="col-12 fullbleed-center-center">
            <h2 class="module-head-big">{{ content.desktop.title }}</h2>
            <p>
                <span
                style="font-size:15px;"
                >{{ content.desktop.paragraph }}</span>
            </p>
            <fdk-link
                class="button secondary-white-btn"
                :link="content.desktop.ctaLink"
            >SHOP NOW</fdk-link>
            </div>
        </div>
        </div>
    </div>
  </div>
</template>
<style scoped>

button,.button,.buttonstyle {
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    background-color: #000;
    color: #fff;
    border: 0;
    width: 100%;
    font-weight: 700;
    font-family: roboto condensed,sans-serif;
    padding: 8px;
    padding: .5rem
}

.button.secondary-white-btn {
    display: inline-block;
    font-family: roboto condensed,sans-serif;
    font-size: .875rem;
    width: 100%;
    text-align: center;
    cursor: pointer;
    font-weight: 700;
    text-transform: uppercase;
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    padding: 10px 40px;
    padding: .625rem 2.5rem;
    letter-spacing: 1px;
    letter-spacing: .0625rem;
}

.button.secondary-white-btn {
    width: auto;
    padding: 12px 40px;
    padding: .75rem 2.5rem;
}

button.secondary-white-btn,.button.secondary-white-btn {
    background: none repeat scroll 0 0 #fff;
    border: 1px solid #fff;
    color: #000
}

button.secondary-white-btn:hover,.button.secondary-white-btn:hover {
    background-color: transparent;
    color: #fff
}
.video-container {
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    list-style: none;
    padding: 0;
    z-index: 1
}

.video-container-no-flexbox .swiper-slide {
    float: left
}

.video-container-vertical>.swiper-wrapper {
    -ms-flex-direction: column;
    flex-direction: column
}

.video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: -ms-flexbox;
    display: flex;
    transition-property: transform;
    box-sizing: content-box
}

.video-container-android .swiper-slide,.swiper-wrapper {
    transform: translate3d(0,0,0)
}


.video-slide {
    -ms-flex-negative: 0;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    position: relative;
    transition-property: transform;
    max-height: 350px;
}

.fullbleed-top-left,.fullbleed-top-center,.fullbleed-top-right,.fullbleed-center-left,.fullbleed-center-center,.fullbleed-center-right,.fullbleed-bottom-left,.fullbleed-bottom-center,.fullbleed-bottom-right {
    position: absolute;
    box-sizing: border-box;
    padding: 15px 15px 45px;
    padding: .9375rem .9375rem 2.8125rem
}

.fullbleed-top-left {
    top: 0;
    left: 0;
    text-align: left
}

.fullbleed-top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    text-align: center
}

.fullbleed-top-right {
    top: 0;
    right: 0;
    text-align: right
}

.fullbleed-center-left {
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    text-align: left
}

.fullbleed-center-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    text-align: center
}

.fullbleed-center-right {
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    text-align: right
}

.fullbleed-bottom-left {
    bottom: 0;
    left: 0%;
    text-align: left
}

.fullbleed-bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    text-align: center
}

.fullbleed-bottom-right {
    bottom: 0;
    right: 0;
    text-align: right
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

.fullbleed-asset.mobile {
    display: block
}

@media(min-width: 992px) {
    .fullbleed-asset.mobile {
        display:none
    }
}

.fullbleed-asset.desktop {
    display: none
}

@media(min-width: 992px) {
    .fullbleed-asset.desktop {
        display:block
    }
}

.fullbleed-asset[data-href] {
    cursor: pointer
}

.fullbleed-asset .button {
    box-sizing: border-box;
    margin: 0 10px 10px 0;
    margin: 0 .625rem .625rem 0
}

.fullbleed-video {
    width: 100%;
    height: 100%
}

.fullbleed-video.mobile {
    display: block
}

@media(min-width: 992px) {
    .fullbleed-video.mobile {
        display:none
    }
}

.fullbleed-video.desktop {
    display: none
}

@media(min-width: 992px) {
    .fullbleed-video.desktop {
        display:block
    }
}

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
    margin: .9375rem .9375rem 3.4375rem;
    border-style: solid;
    border-width: 25px 0 25px 40px;
    border-width: 1.5625rem 0 1.5625rem 2.5rem
}

.fullbleed-video-controls.playing {
    border-style: double;
    border-width: 0 0 0 40px;
    border-width: 0 0 0 2.5rem
}

.fullbleed-video-controls.black {
    border-color: transparent transparent transparent #000
}

.fullbleed-video-controls.red {
    border-color: transparent transparent transparent #ff1010
}


.module-head,.module-head-small,.module-head-big,.module-head-huge {
    font-family: roboto condensed,sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 1.875rem;
    line-height: 1.1;
    margin: 0;
    letter-spacing: .8px;
    letter-spacing: .05rem
}

@media(min-width: 992px) {
    .module-head,.module-head-small,.module-head-big,.module-head-huge {
        font-size:2.5rem
    }
}

.module-head-small {
    font-size: 1.375rem;
    letter-spacing: .65px;
    letter-spacing: .04063rem
}

@media(min-width: 992px) {
    .module-head-small {
        font-size:1.5rem;
        letter-spacing: .8px;
        letter-spacing: .05rem
    }
}

.module-head-big {
    font-size: 46px;
    font-size: 2.875rem
}

@media(min-width: 992px) {
    .module-head-big {
        font-size:70px;
        font-size: 4.375rem;
        letter-spacing: 1.5px;
        letter-spacing: .09375rem
    }
}

.module-head-huge {
    font-size: 80px;
    font-size: 5rem;
    letter-spacing: .85px;
    letter-spacing: .05312rem
}

@media(min-width: 992px) {
    .module-head-huge {
        font-size:126px;
        font-size: 7.875rem;
        letter-spacing: 2.6px;
        letter-spacing: .1625rem
    }
}

.module-link {
    font-size: .875rem;
    text-transform: uppercase;
    font-weight: 700;
    font-family: roboto condensed,sans-serif;
    letter-spacing: 1.05px;
    letter-spacing: .06563rem
}

.module-link:hover {
    text-decoration: underline
}

.link-underline {
    font-size: .75rem;
    text-decoration: underline;
    color: inherit
}

@media(min-width: 992px) {
    .link-underline {
        font-size:.875rem
    }
}

.module-text,.module-text-no-margin {
    font-size: .75rem;
    line-height: 2;
    margin: 10px 0;
    margin: .625rem 0
}

@media(min-width: 992px) {
    .module-text,.module-text-no-margin {
        font-size:.875rem;
        line-height: 1.9;
        margin: 20px 0;
        margin: 1.25rem 0
    }
}

.module-text-no-margin {
    margin: 0
}

</style>
<script>

export default {
  data() {
    return {};
  },
  props: {
    video: {
      type: Object
    },
    content: {
        type: Object
    }
  }
};
</script>
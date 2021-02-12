<template>
  <div class="fullbleed-slot section-container slot-margin">
    <div class="section-wrapper">
      <div class="section-slide fullbleed-module">
        <picture class="fullbleed-picture">
          <source
            media="(max-width: 991px)"
            :srcset="image.mobile"
          />
          <img
            :src="image.desktop"
            alt="Shop"
            onerror="this.style.display='none'"
          />
        </picture>
        <div class="fullbleed-asset mobile" style="color: #ffffff">
          <div class="col-12 fullbleed-bottom-center">
            <p style="text-align:center">
              <img
                alt
                :src="overlay.image.mobile"
                title
              />
            </p>
            <br />
            <br />
            <fdk-link
              class="button secondary-white-btn"
              :link="overlay.ctaLink"
              role="button"
            >{{ overlay.ctaText }}</fdk-link>
          </div>
        </div>
        <div class="fullbleed-asset desktop" style="color: #FFF">
          <div class="col-8 fullbleed-center-left">
            <p style="text-align:left">
              <img
                alt
                :src="overlay.image.desktop"
                title
              />
            </p>
            <h2 class="module-head-small">
              {{ overlay.text }}
            </h2>
            <br />
            <fdk-link
              class="button secondary-white-btn"
              :link="overlay.ctaLink"
              role="button"
            >{{ overlay.ctaText }}</fdk-link>
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

.section-container {
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    list-style: none;
    padding: 0;
    z-index: 1
}

.section-container-no-flexbox .section-slide {
    float: left
}

.section-container-vertical>.section-wrapper {
    -ms-flex-direction: column;
    flex-direction: column
}

.section-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: -ms-flexbox;
    display: flex;
    transition-property: transform;
    box-sizing: content-box
}

.section-container-android .section-slide,.section-wrapper {
    transform: translate3d(0,0,0)
}


.section-slide {
    -ms-flex-negative: 0;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    position: relative;
    transition-property: transform;
}
.section-slide img {
      width: 100%;
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
    max-width: 83.125rem
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
    letter-spacing: .04063rem;
    max-width: 75%;
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

</style>
<script>
/**
 * 
 * Component attributes
 * image: {
    desktop: "https://hdn-1.addsale.com/x0/company/7/applications/5ec3d224848a007bfeacb550/screensaver/pictures/free-banner/original/WD2S2-sQ_-Screensaver.jpeg",
    mobile: "https://hdn-1.addsale.com/x0/company/7/applications/5ec3d224848a007bfeacb550/screensaver/pictures/free-banner/original/LdwKM-Noi-Screensaver.jpeg"
  },
  overlay: {
    image: {
      desktop: 'https://shop.diesel.com/on/demandware.static/-/Library-Sites-DieselMFSharedLibrary/default/dw382ac766/2020/wk18-wk22/WK20-HP-DESKTOP-LOGOv.3.png',
      mobile: 'https://shop.diesel.com/on/demandware.static/-/Library-Sites-DieselMFSharedLibrary/default/dwf6cb18fb/2020/wk18-wk22/HP-MOBILE-LOGO2.png'
    },
    text: "Contrast-interior denim meticulously color-printed on your favorite fits",
    ctaLink: '/men',
    ctaText: 'Shop now'
  }
 */
export default {
  data() {
    return {};
  },
  props: {
    image: {
      type: Object
      },
    overlay: {
      type: Object
    }
  }
};
</script>
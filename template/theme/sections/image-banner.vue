<template>
  <div
    class="fullbleed-slot section-container layout"
    :class="settings.props.layout.value + ' ' + settings.props.height.value"
  >
    <div class="section-wrapper">
      <div class="section-slide fullbleed-module">
        <picture class="fullbleed-picture">
          <img
            :src="settings.props.image.value"
            alt="Shop"
            onerror="this.style.display='none'"
          />
        </picture>

        <div class="fullbleed-asset " style="color: #FFF">
          <div
            class="col-8 "
            :class="{
              'fullbleed-center-left':
                settings.props.overlayLayout.value === 'left',
              'fullbleed-center-center':
                settings.props.overlayLayout.value === 'center',
              'fullbleed-center-right':
                settings.props.overlayLayout.value === 'right',
            }"
          >
            <p class="overlay-img-wrapper">
              <img alt :src="settings.props.overlayImage.value" title />
            </p>
            <h2 class="module-head-small">
              {{ settings.props.text.value }}
            </h2>
            <br />
            <fdk-link
              class="button secondary-white-btn"
              :link="settings.props.ctaLink.value"
              role="button"
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
  "name": "imageBanner",
  "label": "Hero Image",
  "props": [
    {
      "id": "image",
      "type": "image_picker",
      "label": "Hero Image",
      "default": "https://place-hold.it/1920x450"
    },
    {
      "id": "layout",
      "type": "select",
      "options": [
        {
          "value": "full",
          "text" : "Full width"
        },
        {
          "value": "medium",
          "text": "Medium"
        },
        {
          "value": "small",
          "text" : "Small"
        }
      ],
      "default": "full",
      "label": "Banner Layout",
      "info":"Size of the banner"
    },
    {
      "id": "height",
      "type": "select",
      "options": [
        {
          "value": "h-auto",
          "text" : "Fit to banner image"
        },
        {
          "value": "h-small", 
          "text" : "Small"
        },
        {
          "value": "h-medium",
          "text": "Medium"
        },
        {
          "value": "h-large", 
          "text": "Large"
        }
      ],
      "default": "h-auto",
      "label": "Banner Height",
      "info":"Height of the banner"
    },
    {
      "id": "overlayLayout",
      "type": "select",
      "options": [
        {
          "value": "left",
          "text" : "Align Left"
        },
        {
          "value": "center",
          "text" : "Align Center"
        },
        {
          "value": "right",
          "text": "Align Right"
        }
      ],
      "default": "left",
      "label": "Overlay Layout",
      "info":"Alignment of overlay content"
    },
    {
      "type": "image_picker",
      "id": "overlayImage",
      "default": "",
      "label": "Overlay image",
      "info":"Overlay Image"
    },
    {
      "type": "text",
      "id": "text",
      "default": "",
      "label": "Overlay Text"
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
      "default": "Shop Now",
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

.section-container {
  position: relative;
  overflow: hidden;
  list-style: none;
  padding: 0;
  z-index: 1;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
}

.section-container-no-flexbox .section-slide {
  float: left;
}

.section-container-vertical > .section-wrapper {
  -ms-flex-direction: column;
  flex-direction: column;
}

.section-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: -ms-flexbox;
  display: flex;
  transition-property: transform;
  box-sizing: content-box;
}

.section-container-android .section-slide,
.section-wrapper {
  transform: translate3d(0, 0, 0);
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
  max-width: 100%;
}
.section-slide .fullbleed-picture img {
  width: 100%;
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

.fullbleed-asset.mobile {
  display: block;
}

@media (min-width: 992px) {
  .fullbleed-asset.mobile {
    display: none;
  }
}

.fullbleed-asset[data-href] {
  cursor: pointer;
}

.fullbleed-asset .button {
  box-sizing: border-box;
  margin: 0 10px 10px 0;
  margin: 0 0.625rem 0.625rem 0;
}

.module-head,
.module-head-small,
.module-head-big,
.module-head-huge {
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
  max-width: 75%;
}

@media (min-width: 992px) {
  .module-head-small {
    font-size: 1.5rem;
    letter-spacing: 0.8px;
    letter-spacing: 0.05rem;
  }
}
.fullbleed-center-left {
  .module-head-small {
    margin: unset;
  }
  .overlay-img-wrapper {
    text-align: left;
  }
}

.fullbleed-center-center {
  .module-head-small {
    margin: 0 auto;
  }
  .overlay-img-wrapper {
    text-align: center;
  }
}

.fullbleed-center-right {
  .module-head-small {
    margin: 0 0 0 auto;
  }
  .overlay-img-wrapper {
    text-align: right;
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

.layout {
  &.full {
    width: 100%;
  }
  &.medium {
    width: 1300px;
  }
  &.small {
    width: 1200px;
  }

  &.h-auto {
    height: auto;
  }
  &.h-small {
    height: 350px;
  }
  &.h-medium {
    height: 550px;
  }
  &.h-large {
    height: 750px;
  }
}

@media (min-width: 0px) and (max-width: 991.98px) {
  .layout {
    width: 100% !important;
    height: auto !important;
  }
  .module-head-small {
    display: none;
  }
  .overlay-img-wrapper {
    margin-right: 10px;
    img {
      max-width: 35%;
    }
  }
  .section-slide .fullbleed-picture img {
    width: 100vw;
  }
}
</style>
<script>
export default {
  props: ['settings'],
  watch: {
    settings: function(newVal, oldVal) {},
  },
  mounted() {},
  data: function() {
    return {
      // url: ""
    };
  },
};
</script>

<template>
      <span class="lazy-img-wrapper">
        <img ref="refImg"
            :src="src | imagetransform(transformOptions)"
            :srcset="srcset"
            :style="style"
            class="renderedImg" 
            :data-loading="loading ? 'true': 'false'"
            v-if="!lazy"
      />
        <img v-else ref="refImg"
            :data-src="src | imagetransform(transformOptions)"
            :data-srcset="srcset"
            :style="style"
            class="lazy-load renderedImg" 
            data-toggle-class="active"
            :data-loading="loading ? 'true': 'false'"
            :class="{ 'blur': blur, 'img-loaded': !loading,'hide': loading}"
        />
          <img  data-paceholder="true" class=" place-holder" :class="{ 'blur': blur }"
              :src="src | imagetransform(transformOptionsPlaceholer)"
              :style="style"
              v-if="lazy && !placeholder"
          />
          <img v-if="lazy && placeholder" data-paceholder="true" class=" place-holder"
              :src="placeholder"
              :style="style"
          />
      </span>
</template>
<style lang="less" scoped>
    .blur {
        -webkit-filter:blur(5px);
        filter: blur(5px);
        -webkit-transition: filter 1.2s;
        -moz-transition: filter 1.2s;
        -o-transition: filter 1.2s;
        transition: filter 1.2s;
        will-change: filter;
    }
    .img-loaded {
        -webkit-filter:blur(0);
        filter: blur(0);
    }
    .lazy-img-wrapper {
      display: flex;
      align-items: flex-start;
    }
    .renderedImg, .place-holder {
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      vertical-align: middle;
    }
    .hide {
      visibility: hidden;
    }
    .lozad.active.hide {
      visibility: visible;
    }
    
    
</style>
<script>

// const PLACEHOLDER_DEFAULT = "https://hdn-1.fynd.com/company/884/applications/000000000000000000000001/screensaver/pictures/free-banner/original/r9dURSVg4-Screensaver.png"
const PLACEHOLDER_DEFAULT = "https://hdn-1.fynd.com/company/884/applications/000000000000000000000001/theme/pictures/free/original/theme-image-1598448644345.png";

// import { generateHufferOpsUrl, getBaseImageSourceType } from '../../../../helper/image-utils';
export default {
    name: 'lazy-image',
    props: {
        lazy: {
          type: Boolean,
          default: true
        },
        reInit: Object,
        backgroundColor: {
          type: String,
          default: '#ffffff',
        },
        src: { // contains src of placeholder
            type: String,
            default: '',
        }, 
        width: {
            type: Number,
            default: null,
        },
        height: {
            type: Number,
            default: null,
        },
        blur:  {
            type: Boolean,
            default: true,
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    data() {
      return {
        loading: true,
      };
    },
    computed: {
        transformOptions() {
            let options = {}
            if(this.width) options.width = this.width;
            if(this.height) options.height = this.height;
            return options;
        },
        transformOptionsPlaceholer() {
            let options = {}
            if(this.width) options.width = this.width;
            if(this.height) options.height = this.height;
            if(this.blur) options.blur = 17;
            options.jpgq = 20; //setting jpg quality 20, for low quality image
            return options;
        },
        aspectRatio() {
          // Calculate the aspect ratio of the image
          // if the width and the height are given.
          if (!this.width || !this.height) return null;

          return (this.height / this.width) * 100;
        },
        style() {
          // The background color is used as a
          // placeholder while loading the image.
          // You can use the dominant color of the
          // image to improve perceived performance.
          // See: https://manu.ninja/dominant-colors-for-lazy-loading-images/
          const style = { backgroundColor: this.backgroundColor };

          // if (this.width) style.width = `${this.width}px`;

          // If the image is still loading and an
          // aspect ratio could be calculated, we
          // apply the calculated aspect ratio by
          // using padding top.
          const applyAspectRatio = this.loading && this.aspectRatio;
          if (applyAspectRatio) {
            // Prevent flash of unstyled image
            // after the image is loaded.
            style.height = 0;
            // Scale the image container according
            // to the aspect ratio.
            style.paddingTop = `${this.aspectRatio}%`;
          }

          return style;
        },
    },
    methods: {
        getDefaultPlacehoder(){
          let genstr = ''
          if(this.width) genstr = genstr + 'w:'+ this.width
          if(this.height) genstr = genstr ? genstr + ',h:'+ this.height : 'h:'+ this.height
          return PLACEHOLDER_DEFAULT.replace('/original/',`/resize-${genstr}/`)
        },
        errorHandler(evt) {
          evt.target.src = this.getDefaultPlacehoder()
        },
    },
    mounted() {
      // As soon as the <img> element triggers
      // the `load` event, the loading state is
      // set to `false`, which removes the apsect
      // ratio we've applied earlier.
      const setLoadingState = () => {
        this.loading = false;
      };
      
      this.$refs.refImg.addEventListener('load', setLoadingState);
      this.$refs.refImg.addEventListener('error', this.errorHandler);
      // We remove the event listener as soon as
      // the component is destroyed to prevent
      // potential memory leaks.
      this.$once('hook:destroyed', () => {
        this.$refs.refImg && this.$refs.refImg.removeEventListener('load', setLoadingState);
      });
    },
    watch : {
      src: function(newvalue) {
        this.$refs.refImg.dataset.loaded = false
        this.reInit && this.reInit()
      }
    }

}
</script>
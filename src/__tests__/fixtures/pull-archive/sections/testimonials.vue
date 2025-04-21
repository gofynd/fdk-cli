<template>
  <div
    class="testimonial-cont section-main-container"
  >
    <div class="glide-cont" :class="'glide'+ _uid" ref="glide" >
      <div data-glide-el="track" class="glide__track">
        <div class="glide__slides" :class="{ 'ssr-slides-box': !checkisBrowser() && !isMounted }">
          <div class="glide__slide quotes-slider" v-for="(block, i) in blocks" :key="i" >
              <div class="author-image">
                <emerge-image v-if="block.props && block.props.author_image.value" :src="block.props.author_image.value" 
                  :sources="[ {width: 98}]"
                />
              </div>
              <div class="testimonial">
                <span class="quote-icon left">
                  <img src="../assets/images/double-quote.svg" />
                </span>
                <p>
                  {{ block.props && block.props.testimonialText.value
                    ? block.props.testimonialText.value
                    : 'Add customer reviews and testimonials to showcase your store’s happy customers.'
                  }}
                </p>
                <span class="quote-icon right">
                  <img src="../assets/images/double-quote.svg" />
                </span>
              </div>
              
              <cite> 
                <section> 
                  <div>{{ block.props && block.props.author_name.value ? block.props.author_name.value : "Author's name"}}</div>
                  <div>{{ block.props && block.props.author_description.value ? block.props.author_description.value : "Author's Description" }}</div>
                </section>
              </cite>
            
          </div>
        </div>
      </div>
      <!--- Bullets -->
      <div class="glide__bullets" data-glide-el="controls[nav]" v-if="blocks.length > 1">
          <button class="glide__bullet" :data-glide-dir="'=' + entry" v-for="(entry, index) in glidePaginate(blocks.length, 1)" :key="index"></button>
      </div>
      <div
        class="arrows"
        v-if="
          blocks.length > 1
        "
      >
        <section>
          <div
            class="prev-btn btn-nav-testimonial"
            ref="prevArrow"
            @click="prevSlide"
          >
            <div class="icon icon-prev">
            </div>
          </div>
          <div
            class="next-btn btn-nav-testimonial"
            ref="nextArrow"
            @click="nextSlide"
          >
            <div class="icon icon-next">
            </div>
          </div>
        </section>
      </div>
    </div>
    
  </div>
</template>
<!-- #region  -->
<settings>
{
    "name": "testimonials",
    "label": "Testimonial",
    "props": [
        {
            "type": "checkbox",
            "id": "autoplay",
            "default": false,
            "label": "AutoPlay Slides"
        },
        {
            "type": "range",
            "id": "slide_interval",
            "min": 1,
            "max": 10,
            "step": 1,
            "unit": "sec",
            "label": "Change slides every",
            "default": 2
        }
    ],
    "blocks": [
        {
            "type": "testimonial",
            "name": "Testimonial",
            "props": [
                {
                    "type": "textarea",
                    "id": "testimonialText",
                    "label": "Text for Testimonial",
                    "default": "",
                    "info": "Text for testimonial",
                    "placeholder": "Text"
                },
                {
                    "type": "text",
                    "id": "author_name",
                    "label": "Author name"
                },
                {
                    "type": "text",
                    "id": "author_description",
                    "default": "",
                    "label": "Author Description"
                },
                {
                    "type": "image_picker",
                    "id": "author_image",
                    "default": "",
                    "label": "Author Image"
                }
            ]
        }
    ],
   "preset":{
    "blocks": [
      {
        "name": "Testimonial"
      },
      {
        "name": "Testimonial"
      },
      {
        "name": "Testimonial"
      }
    ]
  }

}
</settings>

<!-- #endregion -->
<style scoped lang="less">
.testimonial-cont {
  .glide__bullets {
    position: relative;
    z-index: 2;
    margin-top: 40px;
    bottom: 0;
    left: 50%;
    display: inline-flex;
    align-items: center;
    list-style: none;
    transform: translateX(-50%);
    @media @mobile {
      margin-top: 20px;
    }
  }
  .glide__bullet {
    background-color: unset;
    border: 1px solid @color-black;
    box-shadow: unset;
    &:hover {
      background-color: @color-black;
    }
    &.glide__bullet--active {
      background-color: @color-black;
    }
  }
  .glide__slides.ssr-slides-box {
    touch-action: unset;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    .glide__slide {
      margin-right: 30px;
      width: 100%;
    }
  }
  .glide__slides {
    align-items: stretch;
    .glide__slide { 
      height: auto;
    }
  }
  .arrows {
    position: absolute;
    display: flex;
    justify-content: flex-end;
    top: 50%;
    width: 100%;
    margin: -40px 0 0 0;
    @media @tablet {
      display: none;
    }
    section {
        position: relative;
        width: 100%;
        margin: 0 auto;
        display: flex;
        padding: 0 20px;
        box-sizing: border-box;
      }
  }
  .btn-nav-testimonial {
    z-index: @layer;
    background-color: transparent;
    padding: unset;
    cursor: pointer;
    width: 50px;
    display: flex;
    justify-content: center;
    transition: transform .2s;
    &:hover {
      transform: scale(1.2);
    }
  }
  .next-btn {
    margin-left: auto;
  }
  
  .icon {
    display: inline-block;
    width: 45px;
    height: 45px;
    background-size: cover;
  }
  .icon-next {
    background-image: url(../assets/images/nav-arrow.svg);
    transform: rotate(180deg);
  }
  .icon-prev {
    background-image: url(../assets/images/nav-arrow.svg);
  }
  .quotes-slider {
    font-style: normal;
    // padding: 0 15px;
    text-align: center;
    display: flex;
    flex-direction: column;
    
    cite {
      display: block;
      font-weight: 300;
      section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        >:first-child {
          font-size: 20px;
        }
        >:nth-child(2) {
          font-size: 16px;
          padding: 8px 0 0px 0;
          @media @mobile {
            font-size: 12px;
            padding: 14px 0 0 0;
          }
        }
      }
    }
  }
  // cite::before {
  //   content: "\2014 \0020";
  // }
  .quotes-slider p {
    // margin-bottom: 30px;
    line-height: 52px;
    font-size: 30px;
    font-weight: lighter;
    font-style: italic;
    padding: 0 80px;
    @media @tablet {
      line-height: 42px;
      font-size: 25px;
      padding: 0 20px;
    }
    @media @mobile {
      line-height: 36px;
      font-size: 16px;
    }
  }
  .author-image {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    /deep/ .fy__img {
      border-radius: 50%;
      height: 98px;
    }
  }
  .quote-icon {
    display: flex;
    align-items: center;
    &.left {
      margin: 20px 0 0px 0;
      justify-content: flex-start;
    }
    &.right {
      margin: 0px 0 20px 0;
      justify-content: flex-end;
      img {
        transform: rotate(180deg);
      }
    }
    
  }
  .testimonial {
    height: 100%;
    padding: 0 30px;
    width: 80%;
    margin: 0 auto;
    box-sizing: border-box;
    @media @tablet {
      padding: 0 20px;
      width: 100%;
    }
  }
}
</style>
<script>
import { isBrowser, isNode } from "browser-or-node";
import { detectMobileWidth, glidePaginate } from "../helper/utils";
import Glide from "@glidejs/glide";
import emergeImage from "./../global/components/common/emerge-image.vue";
import "../../node_modules/@glidejs/glide/dist/css/glide.core.min.css";
import "../../node_modules/@glidejs/glide/dist/css/glide.theme.min.css";

export default {
  props: ["settings"],
  components: {
    "emerge-image": emergeImage,
  },
  watch: {
    settings: function(newVal, oldVal) {
      this.cleanupComponent()
      this.initializeComponent()
    },
  },
  computed: {
    blocks() {
      return this.settings.blocks.length === 0
        ? this.settings.preset.blocks
        : this.settings.blocks;
    }
  },
  data: function() {
    return {
      isMounted: false,
      glideOptions: {
          type: 'carousel',
          startAt: 0,
          gap: 0,
          perView: 1
      },
      carouselHandle: null
    };
  },
  mounted() {
    this.initializeComponent()
  },
  methods: {
    checkisBrowser(){
      return isBrowser
    },
    glidePaginate,
    prevSlide() {
      this.carouselHandle.go(`<`)
    },
    nextSlide() {
      this.carouselHandle.go(`>`)
    },
    initCarousel() {
      //if IsNode OR Layout is horizontal(optional flag) OR carouselHandle(carousel) is not already initialized
      if (isNode || this.carouselHandle) {
        return;
      }
      if(!this.$refs.glide) {
        setTimeout(()=>{ this.initCarousel() }, 1000)
        return;
      }
      // waiting for data to render, hence nextTick
      this.$nextTick(()=>{
        try {
          
          this.carouselHandle = new Glide(this.$refs.glide , this.glideOptions)
          this.carouselHandle.mount()
        } catch(ex) {
           //There is an exception logged, due to rendering delay, so this try,catch is required
        }
      })
    },
    initializeComponent() {
      this.isMounted = true
      if(this.settings.props.autoplay.value && this.blocks.length > 1) {
        this.glideOptions.autoplay = this.settings.props.slide_interval.value * 1000
      } else {
        this.glideOptions.autoplay = false
      }
      this.initCarousel();
    },
    cleanupComponent() {
      if(isBrowser && this.carouselHandle) {
        this.carouselHandle.destroy();
        this.carouselHandle = null;
      }
    }
  },
  beforeDestroy() {
    this.cleanupComponent()
  }
};
</script>

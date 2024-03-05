<template>
  <div>
    <div class="group-cards" v-if="layout === 'grid'">
      <placeholder-item
        v-for="index in count"
        :type="type"
        :key="index"
        :text="`${text} ${index}`"
      ></placeholder-item>
    </div>
    <div v-else-if="layout === 'horizontal'">
      <div class="brand-items">
        <div class="glide-cont" :class="'glide'+ _uid" ref="glide" >
          <div data-glide-el="track" class="glide__track">
            <div class="glide__slides" :class="{ 'ssr-slides-box': !checkisBrowser() && !isMounted }">
              <div class="glide__slide" 
                v-for="index in count"
                :key="index"
              >
                <fdk-link :link="`#`"  >
                  <div class="carousel-cell">
                    <fdk-placeholder :type="type" class="imgClass" />
                    <div class="carousel-details">
                      <div class="collection_desc">
                        <div class="card-desc cl-content">
                          <span class="ukt-title">{{ `${text} ${index}` }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </fdk-link>
              </div>
            </div>
          </div>
          <!--- Bullets -->
          <div class="glide__bullets" data-glide-el="controls[nav]">
              <button class="glide__bullet" :data-glide-dir="'=' + entry" v-for="(entry, index) in glidePaginate(count, items_per_row)" :key="index"></button>
          </div>
          <div class="arrows">
            <section>
              <div
                  class="prev-btn btn-nav-cat"
                  ref="prevArrow"
                  @click="prevSlide"
                  >
                  <div class="icon icon-prev"></div>
              </div>
              <div
                  class="next-btn btn-nav-cat"
                  ref="nextArrow"
                  @click="nextSlide"
                  >
                  <div class="icon icon-next"></div>
              </div>
            </section>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import placeholderItemVue from './placeholder-item.vue';
import { detectMobileWidth, glidePaginate } from '../../../helper/utils';
import { isBrowser, isNode } from "browser-or-node";
import Glide from '@glidejs/glide'
import '../../../../node_modules/@glidejs/glide/dist/css/glide.core.min.css';
import '../../../../node_modules/@glidejs/glide/dist/css/glide.theme.min.css';

export default {
  name: 'placeholder-items',
  components: {
    'placeholder-item': placeholderItemVue,
  },
  props: {
    count: {
      type: Number,
    },
    items_per_row: {
      type: Number,
      default: 5
    },
    type: {
      type: String,
    },
    text: {
      type: String,
    },
    layout: {
      type: String,
      default: 'grid',
    },
  },
  watch: {
    items_per_row: function (newVal, oldVal) {
      this.cleanupComponent();
      this.initializeComponent();
    },
    layout: function (newVal, oldVal) { 
      this.cleanupComponent();
      this.initializeComponent();
    }
  },
  data() {
    return {
      isMounted: false,
      glideOptions: {
          type: 'carousel',
          startAt: 0,
          gap: 30,
          perView: 4,
          breakpoints: {
              1024: {
                  perView: 3
              },
              600: {
                  perView: 2
              },
              480: {
                  perView: 2
              }
          }
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
      // item_count variable holds the value of number of items to show 
      let item_count = this.items_per_row;

      if (detectMobileWidth()) {
        if(this.carouselHandle.index - 1 >= 0) {
          this.carouselHandle.go(`=${this.carouselHandle.index - 1}`)
        }
      } else {
        if(this.carouselHandle.index - item_count >= 0) {
          this.carouselHandle.go(`=${this.carouselHandle.index - item_count}`)
        }
      }
    },
    nextSlide() {
      let item_count = this.items_per_row;
      if (detectMobileWidth()) {
       ///this.categories.length has to be replaced by the length of items in carousel
        if(this.carouselHandle.index + 1 >= this.count) {
          this.carouselHandle.go(`=${this.carouselHandle.index + 1}`) 
        } else {
          this.carouselHandle.go(`<<`)
        }
      } else {
        if(this.carouselHandle.index + item_count < this.count) {
          this.carouselHandle.go(`=${this.carouselHandle.index + item_count}`)
        } else {
          this.carouselHandle.go(`>>`)
        }
      }
    },
    initCarousel() {
      //if IsNode OR Layout is horizontal(optional flag) OR carouselHandle(carousel) is not already initialized
      if (isNode || this.layout !== 'horizontal' || this.carouselHandle) {
        return;
      }
      if(!this.$refs.glide) {
        setTimeout(()=>{ this.initCarousel() }, 1000)
        return;
      }
      // waiting for data to render, hence nextTick
      this.$nextTick(()=>{
        try {
          
          this.carouselHandle = new Glide(this.$refs.glide, this.glideOptions)
          let glideClass = this.$refs.glide.getAttribute('class')
          this.carouselHandle.on(['move.after'], () => {
              let allDots = document.querySelectorAll(`.${glideClass} [data-glide-dir]`)
              if(allDots && allDots.length > 0 ) {
                allDots.forEach(ele => {
                  ele.classList.remove('glide__bullet--active')
                })
              }
              let currentDot = this.carouselHandle ? document.querySelectorAll(`.${glideClass} [data-glide-dir='=${this.carouselHandle.index}']`) : null;
              if(currentDot && currentDot.length > 0) { 
                currentDot[0].classList.add('glide__bullet--active') 
              }
          })
          this.carouselHandle.mount()
        } catch(ex) {
           //There is an exception logged, due to rendering delay, so this try,catch is required
        }
      })
    },
    initializeComponent() {
      this.isMounted = true // can be set here or after frontend API call success
      if(window.screen.width > 600 && window.screen.width <= 1024) {
        this.items_per_row = 3
      } else if (window.screen.width > 480 && window.screen.width <= 600) {
        this.items_per_row = 2
      } else if (window.screen.width <= 480) {
        this.items_per_row = 1
      }
      this.glideOptions.perView = this.items_per_row;
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
  },
};
</script>

<style lang="less" scoped>

.group-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15%, 1fr));
  grid-auto-rows: auto;
  grid-gap: 2em;
}
@media screen and (max-width: 768px) {
  .group-cards {
    grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
    grid-gap: 0.5em;
    padding: 0 10px;
  }
}

.brand-items {
  position: relative;
  @media @mobile {
    padding: 0;
  }
  .imgClass {
    border-radius: 8px;
  }
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
      .glide__slide {
        margin-right: 30px;
        width: auto;
      }
    }
  .btn-nav-cat {
    z-index: @layer;
    background-color: transparent;
    padding: unset;
    cursor: pointer;
    width: 50px;
    @media @mobile {
      width: 30px;
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
  .icon {
    display: inline-block;
    width: 45px;
    height: 45px;
    background-size: cover;
  }
  .icon-next {
    background-image: url(../../../assets/images/nav-arrow.svg);
    transform: rotate(180deg);
  }
  .icon-prev {
    background-image: url(../../../assets/images/nav-arrow.svg);
  }

  .carousel-cell {
    cursor: pointer;
    height: auto;
    margin-right: 30px;
    @media @mobile {
      margin-right: 10px;
    }
    position: relative;
    img.carousel-image {
      border-radius: 8px;
      /*border: 1px solid #aba3a333;*/
      // height: 328px;
      width: 100%;
      box-shadow: 9px 6px 10px rgba(0, 0, 0, 0.2);
      // @media @mobile {
      //   height: 250px;
      // }
    }

    .carousel-details {
      bottom: 0;
      position: absolute;
      display: flex;
      width: 100%;
      left: 50%;
      height: 80px;
      background: transparent linear-gradient(180deg, transparent, #000) 0 0
        no-repeat padding-box;
      color: #fff;
      border-radius: 8px;
      box-sizing: border-box;
      left: 0;
      right: 0;
      align-items: center;
      @media @mobile {
        height: 55px;
      }

      .collection_desc {
        font-size: 16px;
        font-weight: 700;
        margin-left: 10px;
        color: #ffffff;
        height: 30px;
        @media @mobile {
          margin-left: 0;
        }
        .ukt-title {
          text-transform: uppercase;
          width: 100px;
          display: block;
          white-space: nowrap;
          text-align: left;
          color: #ffffff;
          @media @mobile {
            width: 88px;
            font-size: 10px;
          }
        }
        .cl-img {
          width: 50px;
          left: 50%;
          transform: translate(-50%, 0%);
          height: 50px;
          position: relative;
        }
        .cl-content {
          white-space: normal !important;
          margin: 0px 10px;
          width: auto;

          .card-count {
            padding: 0px;
            margin-top: 10px;
          }
        }
      }
    }
  }
}

.slick-slide img {
  display: unset !important;
}

.btn-nav-brands {
  position: absolute;
  top: 50%;
  z-index: @layer;
  background-color: transparent;
  padding: unset;
  width: 50px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: transform .2s;
  &:hover {
    transform: scale(1.2);
  }
}
.next-btn {
  margin-left: auto;
}
.prev-btn {
  
}
</style>

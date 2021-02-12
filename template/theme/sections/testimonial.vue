<template>
  <div class="section-container" v-if="settings.blocks.length">
    <VueSlickCarousel ref="slick" :options="slickOptions">
      <div v-for="(block, i) in settings.blocks" :key="i">
        <blockquote class="quotes-slider">
          <span class="quote-icon">
            <svg
              aria-hidden="true"
              focusable="false"
              role="presentation"
              class="icon icon-quote"
              viewBox="0 0 41 35"
            >
              <path
                d="M10.208 17.711h6.124v16.332H0V21.684C0 8.184 5.444.956 16.332 0v6.125c-4.083 1.14-6.124 4.414-6.124 9.82v1.766zm24.498 0h6.124v16.332H24.498V21.684C24.498 8.184 29.942.956 40.83 0v6.125c-4.083 1.14-6.124 4.414-6.124 9.82v1.766z"
                fill="#000"
                fill-rule="evenodd"
              ></path>
            </svg>
          </span>

          <div class="testimonial">
            <p>
              {{ block.props.testimonialText.value }}
            </p>
          </div>
          <cite> {{ block.props.author.value }}</cite>
        </blockquote>
      </div>
    </VueSlickCarousel>
  </div>
</template>
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
            "type":      "textarea",
            "id":        "testimonialText",
            "label":     "Text for Testimonial",
            "default":   "",
            "info":      "Text for testimonial",
            "placeholder": "Text"
            },
            {
            "type": "text",
            "id": "author",
            "label": "Customers name"
            }
        ]
    }
  ]
}
</settings>
<style scoped lang="less">
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
.quotes-slider {
  font-size: 1.11667em;
  font-weight: 400;
  font-style: normal;
  padding: 0 15px;
  text-align: center;
  font-family: roboto condensed, sans-serif;
  svg {
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    fill: currentColor;
  }
  blockquote cite {
    display: block;
    font-weight: 400;
    font-size: 0.78947em;
    font-style: normal;
  }
}
blockquote cite::before {
  content: '\2014 \0020';
}
.quotes-slider p {
  margin-bottom: 30px;
}
.quote-icon {
  display: block;
  margin: 0 auto 20px;
}
.testimonial {
  margin-bottom: 19.44444px;
}
@import '../../node_modules/slick-carousel/slick/slick.css';
@import '../../node_modules/slick-carousel/slick/slick-theme.css';
</style>
<script>
import { isBrowser, isNode } from 'browser-or-node';

export default {
  props: ['settings'],
  components: {
    VueSlickCarousel: () => {
      return isNode
        ? Promise.resolve(null)
        : Promise.resolve(require('vue-slick').default);
    },
  },
  watch: {
    settings: function(newVal, oldVal) {},
  },
  mounted() {},
  data: function() {
    return {
      // url: ""
      slickOptions: {
        slidesToShow: 3,
        autoplaySpeed: this.settings.props.autoplay.value
          ? this.settings.props.slide_interval.value * 1000
          : null, //convert to ms
        autoplay: this.settings.props.autoplay.value,
        arrows: true,
        dots: true,
        swipeToSlide: true,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: true,
            },
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            },
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
        ],
      },
    };
  },
};
</script>

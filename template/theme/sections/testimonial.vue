<template>
  <div class="testimonial-cont">
    <VueSlickCarousel ref="slick" v-bind="slickOptions">
      <div v-for="(block, i) in blocks" :key="i">
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
              {{
                block.props
                  ? block.props.testimonialText.value
                  : "Add customer reviews and testimonials to showcase your store’s happy customers."
              }}
            </p>
          </div>
          <cite>
            {{
              block.props ? block.props.author.value : "Author's namee"
            }}</cite
          >
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
        },
        {
          "type":"checkbox",
          "id":"full_width",
          "default": false,
          "label": "Full width",
          "info":"Check to allow items to take entire width of the viewport"

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
            "default":   "Add customer reviews and testimonials to showcase your store’s happy customers.",
            "info":      "Text for testimonial",
            "placeholder": "Text"
            },
            {
            "type": "text",
            "id": "author",
            "label": "Customers name",
            "default": "Author's name"
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
      }
    ]
  }
  
}
</settings>
<style scoped lang="less">
.section-main-container {
  padding: 10px;
  background-color: #ffffff;
}
.full-width-section {
  padding: 10px;
  background-color: #ffffff;
}
/deep/ .slick-dots {
  @media @mobile {
    bottom: -5px !important;
  }
}

.testimonial-cont {
  padding-bottom: 20px;
  .slick-next {
    right: 0;
  }
}
.quotes-slider {
  font-size: 1.11667em;
  font-weight: 400;
  font-style: normal;
  padding: 0 15px;
  text-align: center;
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
  content: "\2014 \0020";
}
.quotes-slider p {
  margin-bottom: 30px;
  line-height: 20px;
}
.quote-icon {
  display: block;
  margin: 0 auto 20px;
}

@import "../../node_modules/vue-slick-carousel/dist/vue-slick-carousel.css";
@import "../../node_modules/vue-slick-carousel/dist/vue-slick-carousel-theme.css";
</style>
<script>
import VueSlickCarousel from "vue-slick-carousel";

export default {
  props: ["settings"],
  components: {
    VueSlickCarousel,
  },
  data: function () {
    return {
      // url: ""
      slickOptions: {
        slidesToShow: 3,
        autoplaySpeed: this.settings.props.autoplay.value
          ? this.settings.props.slide_interval.value * 1000
          : undefined, //convert to ms
        autoplay: this.settings.props.autoplay.value,
        arrows: true,
        dots: true,
        swipeToSlide: true,
      },
    };
  },
  mounted() {
    this.slickOptions = {
      ...this.slickOptions,
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
    };
  },
  computed: {
    blocks() {
      return this.settings.blocks.length === 0
        ? this.settings.preset.blocks
        : this.settings.blocks;
    },
  },
};
</script>

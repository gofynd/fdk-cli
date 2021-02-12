<template>
  <div class="section-container" v-if="settings.blocks.length">
    <VueSlickCarousel ref="slick" :options="slickOptions">
      <fdk-link
        :link="block.props.slide_link.value"
        v-for="(block, index) in settings.blocks"
        :key="index"
        :class="`slide ${settings.props.slide_height.value}`"
      >
        <img
          class="slick-img"
          :src="block.props.image.value"
          @load="imageLoaded"
        />
      </fdk-link>
    </VueSlickCarousel>
  </div>
</template>
<settings>
{
  "name": "slideshow",
  "label": "Image Carousel",
  "props": [
     {
      "type": "select",
      "id": "slide_height",
      "options": [
        {
          "value": "adapt",
          "text": "Adapt to first image"
        },
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
        }
      ],
      "default": "adapt",
      "label": "Slide height",
      "info":"Size of the slide"

    },
        {
            "type": "checkbox",
            "id": "autoplay",
            "default": false,
            "label": "AutoPlay Slides",
            "info":"Check to autoplay slides"
        },
        {
            "type": "range",
            "id": "slide_interval",
            "min": 1,
            "max": 10,
            "step": 1,
            "unit": "sec",
            "label": "Change slides after every",
            "default": 2,
            "info": "Autoplay slide duration"
        }
    ],
    "blocks": [
        {
        "type": "gallery_image",
        "name": "Image",
        "props": [
            {
                "type": "image_picker",
                "id": "image",
                "label": "Gallery Image"
            },
            {
              "type": "url",
              "id": "slide_link",
              "label": "Slide Link"
            }
        ]
    }
  ]
}
</settings>
<style scoped lang="less">
@import '../../node_modules/slick-carousel/slick/slick.css';
@import '../../node_modules/slick-carousel/slick/slick-theme.css';

.section-container {
  position: relative;
  overflow: hidden;
  list-style: none;
  padding: 0;
  z-index: 1;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
  .slick-img {
    width: 100%;
  }
}

/* Icons */
@font-face {
  font-family: 'slick';
  src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAATsAA0AAAAAB2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAE0AAAABoAAAAcdIcYB0dERUYAAAS0AAAAHAAAAB4AJwANT1MvMgAAAZwAAABRAAAAYFAQ/45jbWFwAAACAAAAAFcAAAFiIhFFt2dhc3AAAASsAAAACAAAAAj//wADZ2x5ZgAAAmgAAAE1AAACLD+btmBoZWFkAAABMAAAAC8AAAA2AAEx+2hoZWEAAAFgAAAAHAAAACQD5QIFaG10eAAAAfAAAAAQAAAAFgZKAEpsb2NhAAACWAAAABAAAAAQATYBoG1heHAAAAF8AAAAHQAAACAASwBHbmFtZQAAA6AAAADcAAABbgUngcJwb3N0AAAEfAAAAC4AAABFOXjBpHjaY2BkYGAA4vMGfuHx/DZfGbiZGEDgfGFFPZxWZVBlvM14G8jlYABLAwAT1QnNAHjaY2BkYGC8zcDAoMfEAAJANiMDKmABADBkAe942mNgZGBgYGdwYWBiAAEQycgAEnMA8xkACcgAkwAAAHjaY2BmYmCcwMDKwMDow5jGwMDgDqW/MkgytDAwMDGwcjKAQQNQCZBSYICCgDTXFAYHhkTFSYwP/j9g0GO8/f82A0QNA+NtsBIFBkYANHMN4wAAAHjaY2KAACYIVoVAAALCAJt42mNgYGBmgGAZBkYGEIgB8hjBfBYGByDNw8DBwARkMzAkKigpTlCc9P8/WB0S7/+i+4/uld4rgZoAB4xsDHAhRiYgwcSApoCBcsBMBTNYGGgGAEdEDyUAAAAAAAAAAAAAZgCKANABFnjadZBdToNAEMd3CrtAl5TQLtS0LCoN0A8SGkBI+mAfPET75B1896HppfQcvnII4w3cLYpW6k4ymdn9z8xvBwEKUQg11OgBIXAYWUEQR1uIZoFGpLGxKy3PqrIq8+waXIfJ+5mQSSvkvXwRqqocu1D39QMl2JgvN9zzhsyk1GRDz+OBfzMioCqx0rtdLYo0SiZTZttsOkmidBkveKibFF4Oep9SI46bqk3Twhp4iihUemrMWFPy2NRbthfqKkHi/PxlJLITZdAiSj6ouZ+tn9eZz78DuD9LZYB6bZ8rlCAUVuVdkULjxV4sIEysIc/KSyPmnJDdjhCOdQ0fCTliTX/tjH3ysWao+71qaNjHQjcQwrcuyl+WLZQthCMotJP/h+Xjazz+hfTeRWmG4zOiSyif/q1OtAAAAHjabY49asNAEIU/2ZJDfkiRIvXapUFCEqpcptABUrg3ZhEiQoKVfY9UqVLlGDlADpAT5e16IUWysMz3hjfzBrjjjQT/EjKpCy+4YhN5yZoxcirPe+SMWz4jr6S+5UzSa3VuwpTnBfc8RF7yxDZyKs9r5IxHPiKv1P9iZqDnyAvMQ39UecbScVb/gJO03Xk4CFom3XYK1clhMdQUlKo7/d9NF13RkIdfy+MV7TSe2sl11tRFaXYmJKpWTd7kdVnJ8veevZKc+n3I93t9Jnvr5n4aTVWU/0z9AI2qMkV42mNgYkAGjAzogB0sysTgwtDOyMTIzJlYVJRfnpOaVsIFZhVlpmeUAABuKQkSAAAAAAAB//8AAnjaY2BkYGDgAWIxIGZiYARCNiBmAfMYAAPgADV42mNgYGBkAIKrS9Q5QPT5wop6GA0APf8GGAAA)
    format('woff');
}
.slide {
  position: relative;
  max-height: 80vh;
  &.small {
    height: 475px;
  }
  &.medium {
    height: 650px;
  }
  &.large {
    height: 775px;
  }
  @media only screen and (max-width: 360px) {
    &.small {
      height: 175px;
    }
    &.medium {
      height: 270px;
    }
    &.large {
      height: 375px;
    }
  }
}
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
        autoplaySpeed: this.settings.props.autoplay.value
          ? this.settings.props.slide_interval.value * 1000
          : null, //convert to ms
        autoplay: this.settings.props.autoplay.value,
        arrows: true,
        dots: true,
        swipeToSlide: true,
      },
    };
  },
  methods: {
    imageLoaded() {
      // this.$refs.slick.reInit()
      this.$refs.slick.reSlick();
    },
  },
};
</script>

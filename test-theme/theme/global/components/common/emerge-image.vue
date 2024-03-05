<template>
  <picture>
    <source
      v-for="(source, index) in sources"
      :key="index"
      :media="getMedia(source)"
      :srcset="getUrl(source.width)"
      type="image/webp"
    />
    <img
      class="fy__img"
      :srcset="fallbackSrcset"
      :src="getSrc"
      :alt="alt"
      @error="onError"
    />
  </picture>
</template>

<style lang="less" scoped>
.fy__img {
  height: 100%;
  width: 100%;
  max-width: 100%;
}
</style>

<script>
const PLACEHOLDER_URL = require("../../../assets/images/placeholder.png");
const IMAGE_SIZES = [
  "original",
  "30x0",
  "44x0",
  "66x0",
  "50x0",
  "75x0",
  "60x60",
  "90x90",
  "100x0",
  "130x200",
  "135x0",
  "270x0",
  "360x0",
  "500x0",
  "400x0",
  "540x0",
  "720x0",
  "312x480",
  "resize-(w|h)?:[0-9]+(,)?(w|h)*(:)?[0-9]*",
];
function searchStringInArray(str, strArray) {
  for (var j = 0; j < strArray.length; j++) {
    if (str.match(new RegExp("\/" + strArray[j] + "\/"))) return strArray[j];
  }
  return "";
}

export default {
  name: "emerge-image",
  props: {
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    src: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: PLACEHOLDER_URL,
    },
    alt: {
      type: String,
      default: "",
    },
    sources: {
      type: Array,
      default() {
        return [
          { breakpoint: { min: 780 }, width: 1180 },
          { breakpoint: { min: 600 }, width: 580 },
          { breakpoint: { min: 480 }, width: 580 },
          { breakpoint: { min: 361 }, width: 460 },
          { breakpoint: { max: 360 }, width: 340 },
        ];
      },
    },
  },
  data() {
    return {
      isError: false,
    };
  },
  computed: {
    getSrc() {
      if (this.isError) {
        return this.placeholder;
      } else {
        return this.src;
      }
    },
    getImageType() {
      return this.src.split(/[#?]/)[0].split('.').pop().trim();
    },
    fallbackSrcset() {
      let url = this.src;
      if( this.getImageType.toLowerCase() === 'gif'){
        return '';
      }

      if (this.isError) {
        url = this.placeholder;
      }
      const key = searchStringInArray(url, IMAGE_SIZES);
      return this.sources
        .map((s) => {
          let src = url;
          if (key) {
            src = this.resizeW(url, key, s.width);
          }
          return `${src} ${s.width}w`;
        })
        .join(", ");
    },
  },
  methods: {
    onError() {
      this.isError = true;
      this.$forceUpdate();
    },
    resizeW(url, key, width) {
      let str = "\/" + key + "\/"
      return url.replace(new RegExp(str), "/resize-w:" + width + "/");
    },
    getUrl(width) {
      let url = this.src;
      if( this.getImageType.toLowerCase() === 'gif'){
        return '';
      }
      
      if (this.isError) {
        url = this.placeholder;
      }
      const key = searchStringInArray(url, IMAGE_SIZES);
      if (key) {
        return this.resizeW(url, key, width);
      } else {
        return url;
      }
    },
    getMedia(source) {
      if (source.breakpoint) {
        const min =
          (source.breakpoint.min &&
            `(min-width: ${source.breakpoint.min}px)`) ||
          "";
        const max =
          (source.breakpoint.max &&
            `(max-width: ${source.breakpoint.max}px)`) ||
          "";
        if (min && max) {
          return `${min} and ${max}`;
        } else {
          return min || max;
        }
      } else {
        return "";
      }
    },
  },
};
</script>

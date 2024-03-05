<template>
  <div>
    <button class="back-top" v-if="isToTopActive" @click="scrollToTop()">
      <svg-wrapper
        class="arrow-top-icon"
        :svg_src="'arrow-left-white'"
      ></svg-wrapper>
    </button>
  </div>
</template>

<script>
import { isBrowser, isNode } from "browser-or-node";
import SvgWrapper from "./../../components/common/svg-wrapper.vue";

export default {
  data() {
    return {
      scrollY: isBrowser ? window.scrollY : 0,
    };
  },
  components: {
    "svg-wrapper": SvgWrapper,
  },
  props: {
    scrollOfset: {
      type: Number,
      default: 200,
    },
  },
  created() {
    if (isBrowser) window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    if (isBrowser) window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.scrollY = isBrowser ? window.scrollY : 0;
    },
    scrollToTop() {
      if (isBrowser) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    },
  },
  computed: {
    isToTopActive() {
      return this.scrollY > this.scrollOfset;
    },
  },
};
</script>

<style lang="less" scoped>
.back-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: rgb(255, 255, 255);
  box-shadow: 0px 8px 8px -4px rgba(0, 0, 0, 0.6),
    0px 4px 6px -4px rgba(0, 0, 0, 0.12);
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 24px;
  border: none;
  position: fixed;
  top: 90%;
  right: 60px;
  justify-content: center;
  bottom: 40px;
  width: 40px;
  height: 40px;
  
  & > .arrow-top-icon {
    transform: rotate(90deg);
    fill: currentColor;
    width: 10px;
    height: 14px;
    ::v-deep svg{
        width:100%;
        height: 100%;
      }
  }

  @media @mobile-sm-strict {
    width: 35px;
    height: 35px;
    right: 40px;

    & > .arrow-top-icon {
      width: 10px;
      height: 10px;
    }
  }

  @media @mobile-strict {
    width: 30px;
    height: 30px;
    right: 40px;

    & > .arrow-top-icon {
      width: 10px;
      height: 10px;
    }
  }
  @media @tablet-strict {
    width: 35px;
    height: 35px;
    right: 40px;

    & > .arrow-top-icon {
      width: 10px;
      height: 14px;
    }
  }

  @media @desktop-strict {
    width: 40px;
    height: 40px;
    right: 40px;

    & > .arrow-top-icon {
      width: 10px;
      height: 14px;
    }
  }
}
</style>

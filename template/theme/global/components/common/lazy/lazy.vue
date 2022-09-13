<template>
    <span ref="lazyblock" class="lazy-block"  v-if="!destroy">
      <slot name="trigger" :init-Lazy="initLazy" ></slot>
      <slot></slot>
    </span>
</template>
<style scoped lang="less">
  .lazy-block {
    position: relative;
    /deep/ img[data-loading="false"] + img[data-paceholder="true"] {
        display: none;
    }
  }
</style>
<script>
import lozad from 'lozad';

export default {
  name: 'lazy-block',
  props: {
    lazyload : {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      loading: true,
      destroy: false,
      el: [],
      observer: null
    };
  },
  computed: {
    
  },
  methods: {
    initLazy() {
      // We initialize Lozad.js on the root
      // element of our component.
      this.el = this.$refs.lazyblock.querySelectorAll('.lazy-load')
      
     
      this.observer = lozad(this.el, {
          threshold: 0.5 // ratio of element convergence
      });
      this.observer.observe();
      if(!this.lazyload) {
        this.el && this.el.length && this.el.forEach(element => {
                                    this.observer.triggerLoad(element)
                                });
      }
    }
  },
  mounted() {
    this.initLazy()
  }
};
</script>

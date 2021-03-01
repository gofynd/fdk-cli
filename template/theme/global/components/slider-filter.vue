<template>
  <div>
    <div class="cl-Mako light-xxxs" v-if="showSliderText">
      <div v-if="filteritem.values[0] && !filteritem.values[0].currency_code">
        {{ sliderVal[0] }}% to {{ sliderVal[1] }}%
      </div>
      <div v-if="filteritem.values[0] && filteritem.values[0].currency_code">
        {{ sliderVal[0] | currencyformat }} to
        {{ sliderVal[1] | currencyformat }}
      </div>
    </div>
    <no-ssr>
      <vue-slider
        ref="slider"
        v-model="sliderVal"
        :min="Math.floor(sliderInfo.min)"
        :max="Math.floor(sliderInfo.max)"
        v-bind="options"
        @drag-start="updateSlider()"
        @click.native="updateSliderInfo($event)"
      />
    </no-ssr>
  </div>
</template>

<style lang="less" scoped>
/deep/.vue-slider-dot-handle {
  background-color: #000 !important;
  border: 2px solid #000;
}
/deep/.vue-slider:hover .vue-slider-dot-handle {
  border-color: #000 !important;
}
</style>

<script>
import { debounce } from './../../helper/utils';
import vueSlider from 'vue-slider-component/src/vue2-slider.vue';
import NoSSR from 'vue-no-ssr';

export default {
  name: 'slider-filter',
  components: {
    'vue-slider': vueSlider,
    'no-ssr': NoSSR,
  },
  props: {
    filteritem: {},
    showTextBox: {
      default: false,
      type: Boolean,
    },
    showSliderText: {
      default: true,
      type: Boolean,
    },
    reset: {
      type: Boolean,
    },
    options: {},
  },
  data() {
    const sliderInfo = this.filteritem.values[0];
    const sliderData = this.getSliderValue();
    return {
      sliderInfo: sliderInfo,
      sliderVal: sliderData,
      minInput:
        Array.isArray(sliderData) && sliderData.length > 0 ? sliderData[0] : 0,
      maxInput:
        Array.isArray(sliderData) && sliderData.length > 0 ? sliderData[1] : 0,
      options: {
        dotSize: 15,
        processStyle: {
          backgroundColor: '#000',
          borderColor: '#000',
          height: '5px',
        },
        railStyle: {
          backgroundColor: '#ECECEC',
          borderColor: '#ECECEC',
          height: '4px',
        },
        tooltip: 'none',
        dotStyle: { backgroundColor: '#000', borderColor: '#000' },
      },
    };
  },
  methods: {
    updateSlider: function() {
      this.$refs.slider.refresh();
    },

    getSliderValue() {
      if (this.filteritem.key.kind === 'range') {
        const sliderInfo = this.filteritem.values[0];
        if (sliderInfo.selected_max) {
          const data = [
            Math.floor(sliderInfo.selected_min),
            Math.floor(sliderInfo.selected_max),
          ];
          this.filteritem.query = this.generateQuery(this.filteritem, data);
          return data;
        }
        return [Math.floor(sliderInfo.min), Math.floor(sliderInfo.max)];
      }
      return null;
    },
    updateSliderInfo() {
      let data = this.$refs.slider.getValue();
      if (this.showTextBox) {
        this.minInput = data[0];
        this.maxInput = data[1];
      }
      let strQuery = this.generateQuery(this.filteritem, data);
      this.$emit('slider-query', strQuery);
    },
    generateQuery(filter, data) {
      let count = 0;
      return filter.values[0].query_format.replace(/{}/g, function(match) {
        count++;
        return data[count - 1];
      });
    },
    onChangeInput(event) {
      let min = parseInt(this.minInput);
      let max = parseInt(this.maxInput);
      if (
        min >= 0 &&
        max >= 0 &&
        this.sliderInfo.min <= min &&
        max <= this.sliderInfo.max
      ) {
        if (Number(this.minInput) < Number(this.maxInput)) {
          this.sliderVal = [this.minInput, this.maxInput];
          let strQuery = this.generateQuery(this.filteritem, this.sliderVal);
          this.$emit('slider-query', strQuery);
        }
      }
    },
    debounceInput: debounce(function(e) {
      this.onChangeInput();
    }, 500),
  },
  mounted() {
    // this.updateSlider();
  },
  watch: {
    filteritem: function(filteritem) {
      this.filteritem = filteritem;
      this.sliderVal = this.getSliderValue();
      this.sliderInfo = filteritem.values[0];
    },
    reset(newValue) {
      this.sliderVal = this.getSliderValue();
      this.sliderInfo = this.filteritem.values[0];
    },
  },
};
</script>

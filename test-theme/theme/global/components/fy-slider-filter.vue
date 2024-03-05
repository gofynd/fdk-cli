<template>
  <div>
    <div class="cl-Mako light-xxxs" v-if="showSliderText">
      <div v-if="filteritem.values[0] && !filteritem.values[0].currency_code">
        {{ displayVal }}
      </div>
      <div v-if="filteritem.values[0] && filteritem.values[0].currency_code">
        {{ sliderVal[0] | currencyformat }} to
        {{ sliderVal[1] | currencyformat }}
      </div>
    </div>
    <no-ssr>
      <vue-slider
        ref="slider"
        class="price-slider"
        v-model="sliderVal"
        :min="Math.floor(sliderInfo.min)"
        :max="Math.floor(sliderInfo.max)"
        v-bind="options"
        @click.native="updateSliderInfo($event)"
        @touchend.native="updateSliderInfo($event)"
      />
    </no-ssr>
    <div v-if="showTextBox" class="range-box">
      <div class="cl-DustyGray2 regular-xs range-item">
        <span>Min</span>
        <input
          :class="{ empty: !minInput }"
          @keyup.enter="onChangeInput"
          v-model="minInput"
          v-on:input="debounceInput"
          type="number"
          :min="Math.floor(sliderInfo.min)"
          :max="Math.floor(sliderInfo.max)"
        />
      </div>
      <div class="cl-DustyGray2 regular-xs range-item">
        <span>Max</span>
        <input
          :class="{ empty: !maxInput }"
          @keyup.enter="onChangeInput"
          v-model="maxInput"
          v-on:input="debounceInput"
          type="number"
          :min="Number(minInput) + 1"
          :max="Math.floor(sliderInfo.max)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.range-box {
  display: flex;
  .range-item {
    margin: 0px 10px 0px 0px;
  }
  input {
    display: block;
    max-width: 150px;
    padding: 8px 0px 5px 10px;
    border: 1px solid gray;
    color: black;
    border-radius: 5px;
  }
  input:out-of-range,
  .empty {
    border: 1px solid black;
  }
}
/deep/ .price-slider {
  .vue-slider-dot-handle {
    border: 2px solid #9B9B9B
  }
  .vue-slider-process {
    background-color: #9B9B9B;
  }
  .vue-slider-tooltip {
    font-size: 12px;
    padding: 2px;
    color: #fff;
    font-weight: 500;
    border: 1px solid #9b9b9b;
    background-color: #9b9b9b;
  }
}
</style>

<script>
import { debounce } from './../../helper/utils';
import vueSlider from 'vue-slider-component/src/vue2-slider.vue';
import NoSSR from 'vue-no-ssr';

export default {
  name: 'fy-slider-filter',
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
  },
  data() {
    const sliderInfo = this.filteritem.values[0];
    const sliderData = this.getSliderValue();
    return {
      sliderInfo: sliderInfo,
      sliderVal: sliderData,
      displayVal: null,
      minInput:
        Array.isArray(sliderData) && sliderData.length > 0 ? sliderData[0] : 0,
      maxInput:
        Array.isArray(sliderData) && sliderData.length > 0 ? sliderData[1] : 0,
      options: {
        lazy: true,
        tooltip: 'hover',
        useKeyboard : false
      },
    };
  },
  methods: {
    getSliderValue() {
      if (this.filteritem.key.kind === 'range') {
        const sliderInfo = this.filteritem.values[0];
        if (sliderInfo.selected_max) {
          const data = [
            Math.floor(sliderInfo.selected_min),
            Math.floor(sliderInfo.selected_max),
          ];
          this.displayVal = this.generateDisplayValue(this.filteritem, data);
          this.filteritem.query = this.generateQuery(this.filteritem, data);
          return data;
        }
        const data = [
            Math.floor(sliderInfo.min),
            Math.floor(sliderInfo.max),
          ];
        this.displayVal = this.generateDisplayValue(this.filteritem, data);
        return data;
      }
      this.displayVal = null;
      return null;
    },
    updateSliderInfo(event) {
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
    generateDisplayValue(filter, data) {
      let count = 0;
      return filter.values[0].display_format.replace(/{}/g, function(match) {
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
          this.displayVal = this.generateDisplayValue(this.filteritem, this.sliderVal);
          let strQuery = this.generateQuery(this.filteritem, this.sliderVal);
          this.$emit('slider-query', strQuery);
        }
      }
    },
    debounceInput: debounce(function(e) {
      this.onChangeInput();
    }, 500),
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

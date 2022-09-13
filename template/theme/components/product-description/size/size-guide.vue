<template>
  <transition name="modal" mode="out-in">
    <modal
      :isOpen="isOpen"
      v-on:closedialog="closeDailog"
      :title="'SIZE GUIDE'"
      :modalClass="'product_metaModal'"
    >
      <div class="size-tip" v-if="product_meta.size_chart.size_tip">{{ product_meta.size_chart.size_tip }}</div>
      <div class="size-info">
        <table class="size-table">
          <thead>
            <tr>
              <th
                class="size-header dark-sm"
                v-for="(item, index) in product_meta.size_chart.sizes"
                :key="'column' + index"
              >{{ item.display }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in transformvalues()" :key="'row_' + index" class="size-row">
              <td v-for="(cell, i) in row" :key="'cell_' + i" class="size-cell">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </modal>
  </transition>
</template>

<style lang="less" scoped>
.size-tip {
  max-width: 400px;
  line-height: 20px;
  text-align: center;
}
.size-info {
  overflow-y: auto;
  overflow-x: hidden;
  margin: 24px 0px;
  max-height: 260px;

  @media @mobile {
    overflow: hidden;
    max-height: max-content;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
    background-color: @White;
  }
  &::-webkit-scrollbar {
    width: 5px;
    background-color: @White;
  }
  &::-webkit-scrollbar-thumb {
    background-color: @Black;
  }
}
.size-table {
  width: 100%;
  padding: 20px;
  .size-header {
    margin: 5px;
    text-transform: capitalize;
    padding: 25px 0px;
    color: @Mako;
  }
  .size-row {
    border-top: 1px solid @Iron;
    padding: 25px;
    .size-cell {
      padding: 5px 15px;
      line-height: 3em;
      text-align: center;
      color: @Mako;
    }
  }
}
</style>

<script>
import modal from "./../../../../global/components/modal.vue";

export default {
  name: "size-guide",
  extends: modal,
  components: {
    "modal": modal
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    product_meta: {
      type: Object
    }
  },
  methods: {
    closeDailog() {
      this.$emit("closedialog");
    },
    transformvalues() {
      let output = [];
      let chart = this.product_meta.size_chart.sizes;
      if (chart && chart.length > 0) {
        for (let i = 0; i < chart[0].values.length; i++) {
          let arr = [];
          for (let j = 0; j < chart.length; j++) {
            arr.push(chart[j].values[i]);
          }
          output.push(arr);
        }
      }
      return output;
    }
  }
};
</script>

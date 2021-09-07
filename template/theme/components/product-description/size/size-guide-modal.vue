<template>
  <transition name="modal" mode="out-in">
    <modal
      :isOpen="isOpen"
      v-on:closedialog="closeDailog"
      :title="'SIZE GUIDE'"
      :modalClass="'sizeGuideModal'"
    >
      <div class="size-tip" v-if="sizeguide.size_tip">
        {{ sizeguide.size_tip }}
      </div>
      <div class="size-info">
        <table class="size-table">
          <thead>
            <tr>
              <th
                class="size-header dark-sm"
                v-for="(item, index) in sizeguide.sizes"
                :key="'column' + index"
              >
                {{ item.display }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in transformvalues()"
              :key="'row_' + index"
              class="size-row"
            >
              <td v-for="(cell, i) in row" :key="'cell_' + i" class="size-cell">
                {{ cell }}
              </td>
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
  font-size:14px;
  text-align: left;
  font-weight:300;
}
.size-info {
  overflow-y: auto;
  overflow-x: hidden;
  margin: 12px 0px;
  max-height: 260px;

  @media @mobile {
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
    padding: 10px 0px;
    color: @Mako;
    font-weight:700;
  }
  .size-row {
    border-top: 1px solid #efefef;
    padding: 10px;
    .size-cell {
      padding: 5px 15px;
      line-height: 2em;
      text-align: center;
      color: @Mako;
      font-weight:300;
    }
  }
}
</style>

<script>
import modal from "./../../../../global/components/modal.vue";

export default {
  name: "size-guide-modal",
  extends: modal,
  components: {
    modal: modal,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    sizeguide: {
      type: Object,
    },
  },
  methods: {
    closeDailog() {
      this.$emit("closedialog");
    },
    transformvalues() {
      let output = [];
      let chart = this.sizeguide.sizes;
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
    },
  },
};
</script>

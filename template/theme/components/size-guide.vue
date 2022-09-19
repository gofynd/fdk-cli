<template>
  <transition
    name="modal"
    mode="out-in"
    v-if="product_meta && product_meta.size_chart"
  >
    <modal
      :isOpen="isOpen"
      v-on:closedialog="closeDailog"
      :modalClass="'sizeGuideModal'"
    >
      <div
        class="size-container"
        v-if="product_meta && product_meta.size_chart"
      >
        <div
          class="left-container"
          v-bind:class="{ 'cst-lw': !product_meta.size_chart.image }"
        >
          <div
            class="size-title"
            v-if="product_meta && product_meta.size_chart"
          >
            {{
              product_meta.size_chart.title
                ? product_meta.size_chart.title
                : "SIZE GUIDE"
            }}
          </div>
          <div class="size-tip" v-if="product_meta && product_meta.size_chart">
            {{ product_meta.size_chart.size_tip }}
          </div>
          <div class="btn-group">
            <button
              type="button"
              v-for="(key, val) in values"
              :key="key"
              @click="changeSelectedMetric(key)"
              :class="[
                'btn',
                `btn-${key}`,
                {
                  'btn-danger': previewSelectedMetric === key,
                  'btn-default': previewSelectedMetric !== key,
                },
              ]"
            >
              {{ val }}
            </button>
          </div>
          <div class="size-info" v-if="product_meta && product_meta.size_chart">
            <table class="size-table">
              <thead>
                <tr>
                  <th
                    class="size-header dark-sm"
                    v-for="(item, index) in product_meta.size_chart.headers"
                    :key="'column' + index"
                  >
                    {{ item.value }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in product_meta.size_chart.sizes"
                  :key="'row_' + index"
                  class="size-row"
                >
                  <td
                    v-for="(cell, i, objIndex) in product_meta.size_chart
                      .headers"
                    :key="'cell_' + objIndex"
                    class="size-cell"
                  >
                    {{ cell.convertable ? convertMetrics(row[i]) : row[i] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            class="size-desc"
            v-if="
              product_meta.size_chart && product_meta.size_chart.description
            "
          >
            <fdk-html-content :content="product_meta.size_chart.description">
            </fdk-html-content>
          </div>
        </div>
        <div
          class="right-container"
          v-if="
            product_meta &&
            product_meta.size_chart &&
            product_meta.size_chart.image
          "
        >
          <div class="sizeguide_image">
            <!-- <fy-image
              :src="product_meta.size_chart.image"
              :alt="product_meta.size_chart.title"
            /> -->
            <img
              :src="product_meta.size_chart.image"
              alt="product_meta.size_chart.title"
            />
          </div>
        </div>
      </div>
    </modal>
  </transition>
</template>

<style lang="less" scoped>
.modal {
  @media @mobile {
    padding-top: 40px;
  }
}
/deep/ .modal-container {
  padding: 0 24px !important;
  max-width: 70% !important;
  max-height: 80% !important;
  @media @mobile {
    max-width: 100% !important;
    padding: 0 24px 24px 24px !important;
    max-height: none !important;
  }
  .modal-body {
    margin-top: 24 !important;
    @media @mobile{
      margin-top: 30px !important;
    }
  }
  .modal-header {
    padding: 0 !important;
    justify-content: flex-end !important;
    align-items: inherit !important;
    @media @mobile {
      top: 0;
      position: fixed;
      left: 0;
      right: 0;
      height: 36px;
      background-color: #fff;
    }
    .cross {
      position: fixed;
      padding: 10px 0;

      @media @tablet {
        margin-right: 0px !important;
      }
      @media @mobile {
        margin-right: 12px !important;
      }
      @media only screen and (max-width: 320px) {
        margin-right: 6px !important;
      }
    }
  }
}
.dark-sm {
  font-size: 12px;
  line-height: 15px;
}
.cst-lw {
  width: 100% !important;
}
.size-container {
  display: flex;
  justify-content: center;
  @media @tablet {
    flex-direction: column;
    padding-bottom: 24px;
  }
  @media @mobile {
    flex-direction: column;
    padding-bottom: 24px;
  }

  .left-container {
    width: 65%;
    @media @tablet {
      width: 100%;
    }
    @media @mobile {
      width: 100%;
    }
    .size-desc {
      margin: 24px 0;
      /deep/ .inline-html {
        p {
          font-size: 12px;
          line-height: 20px;
          color: #41434c;
        }
      }
    }
  }

  .right-container {
    padding: 24px;
    border-left: 1px solid #e4e5e6;
    margin: 0 0 24px 24px;
    max-width: 35%;
    @media @tablet {
      border-left: none;
      margin: 0 0 24px 0;
      max-width: 100%;
      padding: 0;
    }
    @media @mobile {
      border-left: none;
      margin: 0;
      margin-top: 0;
      max-width: 100%;
      padding: 0;
    }

    .sizeguide_image {
      width: 100%;
      display: flex;
      align-items: center;
      height: 100%;
      img {
        width: 100%;
      }
      /deep/.fy__image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.size-title {
  line-height: 25px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  margin: 0 auto;
  width: 80%;
}
.size-tip {
  max-width: 400px;
  line-height: 18px;
  font-size: 12px;
  text-align: center;
  margin: 12px auto 0 auto;
}
.size-info {
  overflow-y: auto;
  overflow-x: auto;
  margin: 24px 0;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    background-color: #ffffff;
  }
  /* Track */
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
    background-color: #ffffff;
  }
  /* Handle */
  &::-webkit-scrollbar-thumb {
    border-radius: 2.5px;
    background-color: #6b6b6b;
  }

  @media @tablet {
    max-height: max-content;
    overflow-x: auto;
  }
  @media @mobile {
    max-height: max-content;
    overflow-x: auto;
  }
}
.size-table {
  width: 100%;
  padding: 20px;
  border: 1px solid #e4e5e6;
  .size-header {
    border: 1px solid #e4e5e6;
    margin: 5px;
    text-transform: capitalize;
    padding: 12px 0px;
    color: #41434c;
  }
  .size-row {
    border-top: 1px solid #e4e5e6;
    padding: 25px;
    .size-cell {
      padding: 5px 0px;
      line-height: 15px;
      text-align: center;
      font-size: 12px;
      color: #41434c;
      border: 1px solid #e4e5e6;
      min-width: 100px;
    }
  }
}
//button css
.btn-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.btn {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
}
.btn-cm {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.btn-in {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.btn-default {
  color: #41434c;
  background-color: #fff;
  border-color: #e4e5e6;
}
.btn-danger {
  color: #fff;
  background-color: #5c6bdd;
  border-color: #5c6bdd;
}
</style>

<script>
import modal from "./modal.vue";
// import fyImage from "./fy-image.vue";

export default {
  name: "size-guide",
  extends: modal,
  components: {
    modal: modal,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    product_meta: {
      type: Object,
    },
  },
  mounted() {
    this.product_meta.size_chart && (this.previewSelectedMetric = this.product_meta.size_chart.unit);
    this.product_meta.size_chart && (this.selectedMetric = this.product_meta.size_chart.unit);
  },
  watch: {
    product_meta(newValue) {
      newValue.size_chart && (this.previewSelectedMetric = newValue.size_chart.unit);
      newValue.size_chart && (this.selectedMetric = newValue.size_chart.unit);
    },
  },
  methods: {
    closeDailog() {
      document.querySelector("body").style.overflow = "auto";
      this.$emit("closedialog");
    },
    changeSelectedMetric(val) {
      this.previewSelectedMetric = val;
      if (this.selectedMetric === this.previewSelectedMetric) {
        this.touched = false;
      } else {
        this.touched = true;
      }
    },
    convertMetrics(val) {
      if (this.previewSelectedMetric == "cm" && this.touched) {
        let finalVal = "";
        val = val.split("-");
        for (let i = 0; i < val.length; i++) {
          if (i != 0 && i < val.length) {
            finalVal += "-";
          }
          if (!isNaN(Number(val[i]))) {
            finalVal += (Number(val[i]) * 2.54).toFixed(2); //cm to inches
          } else {
            finalVal += val[i];
          }
        }
        return finalVal;
      }
      if (this.previewSelectedMetric == "in" && this.touched) {
        let finalVal = "";
        val = val.split("-");
        for (let i = 0; i < val.length; i++) {
          if (i != 0 && i < val.length) {
            finalVal += "-";
          }
          if (!isNaN(Number(val[i]))) {
            finalVal += (Number(val[i]) * 2.54).toFixed(2); //cm to inches
          } else {
            finalVal += val[i];
          }
        }
        return finalVal;
      }
      return val;
    },
  },
  data() {
    return {
      values: {
        cm: "cm",
        inches: "in",
      },
      previewSelectedMetric: "cm",
      selectedMetric: "cm",
      touched: false,
    };
  },
};
</script>

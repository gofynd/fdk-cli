<template>
  <fdk-cart class="gst-box" ref="gstCart">
    <template slot-scope="carts">
      <div class="list">
        <div class="icons">
          <svg-wrapper :svg_src="'kycdetails'"></svg-wrapper>
        </div>
        <div class="gst-input">
          <div class="label bold-sm">GST Details</div>
          <div v-if="!isApplied">
            <input
              type="text"
              maxlength="15"
              v-model="gstNumber"
              placeholder="Enter GST"
              @input="onInput"
            />
          </div>
          <div v-if="isApplied" class="gst-value regular-xxs">
            {{ gstNumber }}
          </div>
          <div class="status light-xxs">
            <span v-if="!isApplied && !showError" class="status-info"
              >Enter GST number to claim {{ amount | currencyformat }} input
              credit
            </span>
            <span v-if="isApplied" class="applied light-xxxs"
              >Claim
              {{
                context.bag_data.breakup_values.raw.gst_charges | currencyformat
              }}
              GST input credit
            </span>
            <span v-if="!isApplied && showError" class="error">
              Enter valid GST number
            </span>
          </div>
        </div>
        <div class="icons" @click="removeGST(carts)" v-if="isApplied">
          <svg-wrapper :svg_src="'red_cross'"></svg-wrapper>
        </div>
      </div>
    </template>
  </fdk-cart>
</template>
<style lang="less" scoped>
.gst-box {
  .list {
    display: flex;
    cursor: pointer;
    padding: 5px 10px;
    border-bottom: 1px solid @LightGray;
    @media @mobile {
      border-top: 1px solid @LightGray;
    }
    .icons {
      .flex-center();
      padding: 10px;
    }
    .gst-input {
      padding: 10px;
      color: @Mako;
      width: 100%;

      .gst-value {
        margin: 10px 0px;
      }
      input {
        border: none;
        text-transform: uppercase;
        border-bottom: 1px solid @Gray;
        margin-top: 5px;
        width: 100%;
        padding: 5px 0px;
        &::placeholder {
          color: @DustyGray;
          text-transform: none;
        }
      }
    }
    .status {
      margin-top: 10px;
      .status-info {
        color: @DarkGray;
      }
    }
    .applied {
      color: @Profit;
    }
    .error {
      color: @Required;
    }
  }
}
</style>
<script>
import SvgWrapper from './../../../components/common/svg-wrapper.vue';
const GST_NUMBER_LENGTH = 15;
export default {
  name: "gst-chip",
  props: {
    context: {},
    cart: {},
  },
  components: {
    "svg-wrapper": SvgWrapper
  },
  data() {
    return {
      gstNumber: this.context.bag_data.gstin,
      isApplied: this.context.bag_data.gstin ? true : false,
      showError: false,
    };
  },
  methods: {
    onInput(event) {
      if (this.gstNumber.length === GST_NUMBER_LENGTH) {
        this.applyGST();
      } else if (this.gstNumber.length >= GST_NUMBER_LENGTH) {
        this.showError = true;
        this.$emit("show-error");
      } else {
        this.showError = false;
        this.$emit("hide-error");
      }
    },
    applyGST() {
      let body = {
        gstin: this.gstNumber,
      };
      this.$refs["gstCart"]
        ?.updateCartMeta(body, this.context.bag_data.id)
        .then((res) => {
          if (res.is_valid) {
            this.isApplied = true;
            this.showError = false;
            this.$emit("hide-error");
            return;
          }
          this.showError = true;
          this.$emit("show-error");
          return;
        })
        .catch((err) => {
          this.showError = true;
          this.$emit("show-error");
        });
    },
    removeGST(cart) {
      let body = {
        gstin: "",
      };
      cart
        .updateCartMeta(body, this.context.bag_data.id)
        .then((res) => {
          this.gstNumber = "";
          this.isApplied = false;
          this.showError = false;
          this.$emit("hide-error");
        })
        .catch((err) => {
        });
    },
  },
};
</script>

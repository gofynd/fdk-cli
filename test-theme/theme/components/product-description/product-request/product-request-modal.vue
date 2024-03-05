<template>
  <transition name="modal" mode="out-in">
    <modal
      :isOpen="isOpen"
      v-on:closedialog="closeDialog"
      :title="'PRODUCT REQUEST'"
      :modalClass="'productRequestModal'"
    >
      <product-request
        v-if="!showSuccessScreen"
        :product="productInfo"
        :isPdpPage="isPdpPage"
        
        @formSubmitted="showSuccessPage"
      ></product-request>
      <div v-if="showSuccessScreen" class="success-container">
        <div class="success">
          <svg-wrapper :svg_src="'tick'"></svg-wrapper>
          <span class="spacing bold-sm">thank you</span>
          <span class="spacing regualr-sm">product request received</span>
        </div>
      </div>
    </modal>
  </transition>
</template>

<style lang="less" scoped>
/deep/.modal-container {
  width: 450px;
  height: 620px;
  position: relative;
  padding: 0 25px !important;
}
/deep/.modal-header {
  position: sticky;
  z-index: 3;
  top: 0;
  background: @White;
}

.success-container {
  background: @Black;
  .success {
    text-transform: capitalize;
    display: flex;
    align-items: center;
    flex-direction: column;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .spacing {
      padding-top: 10px;
    }
  }
}
</style>

<script>
import modal from "./../../../global/components/modal.vue";
import productrequest from "./product-request.vue";
import SvgWrapper from './../../common/svg-wrapper.vue';
export default {
  name: "product-request-modal",
  extends: modal,
  components: {
    modal: modal,
    "product-request": productrequest,
    "svg-wrapper": SvgWrapper
  },
  data() {
    return {
      showSuccessScreen: false,
    };
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    productInfo: {
      type: Object,
    },
    isPdpPage: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    closeDialog() {
      this.$emit("closedialog");
      this.showSuccessScreen = false;
    },
    showSuccessPage() {
      this.showSuccessScreen = true;
      setTimeout(() => {
        this.$emit("closedialog");
        this.showSuccessScreen = false;
      }, 3000);
    },
  },
};
</script>

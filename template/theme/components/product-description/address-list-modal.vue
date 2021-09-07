<template>
  <modal :isOpen="isOpen" v-on:closedialog="closeDailog" title="DELIVERY">
    <fdk-addresses>
      <template slot-scope="addressAct">
        <fdk-pincode ref="pdp-pincode">
          <template slot-scope="pincodeAct">
            <div class="main">
              <div class="helper light-xs">
                Delivery time may vary with Delivery pincode
              </div>
              <div class="title bold-sm ">CHECK PINCODE</div>
              <div class="pincode-container">
                <input
                  autocomplete="off"
                  v-model="pincode_value"
                  placeholder="Enter Pincode"
                  class="common-input pincode-input"
                  type="text"
                />
                <button
                  class="button bold-sm"
                  @click="checkPincode(pincodeAct)"
                >
                  CHECK
                </button>
                <fdk-loader v-if="inProgress"></fdk-loader>
              </div>
              <div
                v-bind:class="[{ visible: showError }, 'error']"
                class="regular-xxxxs"
              >
                {{ error }}
              </div>
              <div v-if="addressAct.addresses && addressAct.addresses">
                <div class="address-container">
                  <label
                    v-for="(item, index) in addressAct.addresses.address"
                    :key="index"
                  >
                    <input
                      type="radio"
                      name="address"
                      :value="item"
                      v-model="selectedAddress"
                      @click="selectAddress(item, pincodeAct)"
                    />
                    <div class="address-item">
                      <div class="address-left">
                        <fdk-inline-svg
                          v-if="selectedAddress.uid !== item.uid"
                          :src="'regular'"
                        ></fdk-inline-svg>
                        <fdk-inline-svg
                          v-if="selectedAddress.uid === item.uid"
                          :src="'radio-selected'"
                        ></fdk-inline-svg>
                      </div>
                      <div class="address-right">
                        <div class="user-meta">
                          {{ item.name }} | {{ item.phone }}
                        </div>
                        <div class="address-meta regular-xxs">
                          <span class="address-type">{{
                            item.address_type
                          }}</span>
                          <span class="address">
                            - {{ item.address }}, {{ item.landmark }},
                            {{ item.area }}, {{ item.city }}</span
                          >
                          <span> - {{ item.pincode }}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </template>
        </fdk-pincode>
      </template>
    </fdk-addresses>
  </modal>
</template>

<script>
import { debounce } from "./../../helper/utils";
import modal from "./../../global/components/modal.vue";
import { isBrowser, isNode } from "browser-or-node";
import {
  LocalStorageService,
  STORAGE_KEYS,
} from "./../../templates/services/localstorage.service.js";

export default {
  name: "address-modal",
  components: {
    modal: modal,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
     pincodeError:{
        type:Boolean,
      },
     errMsg:'', 
    storeInfo: Object,
    tatInfo: Object,
    isExplicitelySelectedStore: {
      type: Boolean,
    },
  },
  computed: {},
  mounted() {},
  data() {
    return {
      pincode_value:
        LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE) || "",
      error: "-",
      showError: false,
      selectedAddress: {},
      inProgress: false,
      deliveryInfo: {},
      pincodeFunction: null,
    };
  },
  methods: {
    selectAddress(item, pincodeAct) {
      this.showError = false;
      this.pincode_value = `${item.area_code}`;
      this.checkPincode(pincodeAct);
    },
    showTatError(err) {
      this.$emit("showTatError", err);
    },

    checkPincode(pincodeAct) {
      this.pincodeFunction = pincodeAct;
      if (this.pincode_value.length === 6) {
        pincodeAct
          .validatePincode(this.pincode_value)
          .then((valid) => {
            
            if (valid) {
              this.pincodeReceived(pincodeAct);
              this.$emit("hideTatError");
            }
          })
          .catch((err) => {
            this.showTatError(err);
            
            this.errMsg=err.message;
            this.pincodeError=true;
            this.error = err.message;
            this.showErr(this.error);
          });
      } else {
        this.error = "Invalid pincode";
        this.pincodeError = true;
        this.showErr(this.error);
      }
    },
    pincodeReceived(pincodeAct) {
      let obj = {
        pincode_value: this.pincode_value,
        pincode_act: pincodeAct,
      };
      this.$emit("newPincodeReceived", obj);
      this.$emit("closedialog");
      this.inProgress = false;
    },
    showErr(errorMsg) {
      this.error = errorMsg;
      this.showError = true;
      this.inProgress = false;
    },
    closeDailog() {
      this.$emit("closedialog");
      this.showError = false;
    },
  },
};
</script>

<style lang="less" scoped>
.main {
  .helper {
    color: @Mako;
    padding: 0px 0px 20px 0px;
  }
  .title {
    margin-top: 10px;
    margin-bottom: 15px;
    color: @Mako;
  }
  .pincode-container {
    display: flex;
    .pincode-input {
      margin-right: 20px;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      background-color: #f2f2f2;
      height: 24px;
    }
    .button {
      line-height: 25px;
      background-color: var(--primaryColor);
      color: white;
      border: none;
      border-radius: 3px;
      padding: 5px 20px;
      cursor: pointer;
    }
  }
  .error {
    padding: 5px 0px;
    visibility: hidden;
    color: @Required;
  }
  .visible {
    visibility: visible;
  }
  .address-container {
    max-height: 250px;
    overflow-y: auto;
    border-top: 1px solid @LightGray;
    @media @mobile {
      max-height: calc(100vh - 210px);
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
      background-color: @Gray;
    }
    .address-item {
      padding: 10px 5px;
      cursor: pointer;
      border-bottom: 1px solid @Iron;
      border-right: none;
      border-left: none;
      font-weight: 300;
      display: table;
      color: @Mako;
      width: calc(100% - 10px);
      &:hover {
        background-color: @LightGray;
      }
      .address-left {
        display: table-cell;
        margin-left: auto;
        vertical-align: middle;
        width: 40px;
        position: relative;
      }
      .address-right {
        display: table-cell;
        align-items: center;
        line-height: 25px;
        vertical-align: middle;
        .user-meta {
          font-weight: 600;
          color: @Mako;
          font-size: 16px;
          text-transform: capitalize;
        }
        .address-meta {
          font-size: 14px;
          font-weight: 300;
          line-height: 20px;
          .address-type {
            text-transform: capitalize;
            font-weight: 700;
          }
        }
      }
    }
  }
  input[type="radio"] {
    display: none;
    &:checked {
      color: green;
    }
  }
  input::-webkit-input-placeholder {
    font-size: 12px;
    font-weight: 500;
  }
}
</style>

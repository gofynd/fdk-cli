<template>
  <fdk-pincode ref="pdpPincode">
    <template slot-scope="pincodeAction">
      <div class="delivery-info">
        <div class="delivery" v-if="isMounted && getPincode()">
          <span class="darker-xs">Delivery to {{ getPincode() }}</span>
          <span>
            <a
              class="ukt-links"
              style="color: var(--text_heading_link_color)"
              @click="addressModal = true"
              >&nbsp;Edit Pincode</a
            >
          </span>
           <p class="error light-xxs" v-if="pincodeError">
                    {{ errMsg }}
                  </p>
        </div>
        <template
          v-if="
            storeInfo && deliveryInfo && deliveryInfo.minDeliveryDate && !error && !pincodeError 
          "
        >
          <div
            v-if="deliveryInfo.minDeliveryDate === deliveryInfo.maxDeliveryDate"
          >
            <div class="delivery-date light-xxs">
              Expected delivery on
              {{ deliveryInfo.minDeliveryDate }}
            </div>
          </div>
          <div v-else>
            <div class="delivery-date light-xxs">
              Expected delivery between
              {{ deliveryInfo.minDeliveryDate }}
              -
              {{ deliveryInfo.maxDeliveryDate }}
            </div>
          </div>
        </template>
      </div>
      <address-list-modal
        :isOpen="showUserPincodeModal || addressModal"
        :tatInfo="tatInfo"
        :isExplicitelySelectedStore="isExplicitelySelectedStore"
        :id="id"
        :context="context"
        :errMsg="errMsg"
        :pincodeError="pincodeError"
        @closedialog="onCloseDialog"
        @newPincodeReceived="onNewPincodeReceived"
        @showTatError="onTatError($event)"
        @hideTatError="onHideTatError"
        @onTatSuccess="getTatInfo($event)"
        
      ></address-list-modal>
    </template>
  </fdk-pincode>
</template>

<style lang="less" scoped>
.delivery {
  margin-bottom: 8px;
}
.delivery-info {
  margin: 20px 0px 30px 0px;
  .ukt-links {
    .user-select-none();
    font-size:15px;
  }
}
.delivery-date {
  color: @Mako;
}
.error {
    color: @Required;
  }
</style>

<script>
import AddressList from "./address-list-modal.vue";
import {
  LocalStorageService,
  STORAGE_KEYS,
} from "./../../templates/services/localstorage.service";
import isEmpty from "lodash/isEmpty";

export default {
  name: "delivery-info",
  props: {
    storeInfo: {},
    productName: "",
    level: "",
    id: {
      type: Number,
    },
    context: {},
    showUserPincodeModal: "",
    isExplicitelySelectedStore: "",
  },
  watch: {
    storeInfo() {
      if (this.storeInfo) {
        this.fromPincode = `${this.storeInfo.pincode}`;
        this.toPincode = LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE);
        this.getTatInfo();
      }
    },
    deliveryInfo(newValue) {
      this.deliveryInfo = newValue;
    },
  },
  data() {
    return {
      toPincode: LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE) || "",
      fromPincode: "",
      errMsg:null,
      addressModal: false,
      tatInfo: {},
      pincodeError: false,
      deliveryInfo: {},
      error: false,
      isMounted: false,
      pincodeFunction: null,
    };
  },
  components: {
    "address-list-modal": AddressList,
  },
  mounted() {
    this.isMounted = true;
    if (!this.showUserPincodeModal && !isEmpty(this.storeInfo))
      this.getTatInfo();
  },
  methods: {
    onCloseDialog() {
      
      this.pincodeError =false;
      this.addressModal = false;
      this.$emit("dialogClosed");
    },
    // onTatSuccess(pincodeAct) {
    //   let params = {
    //     toPincode: LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE),
    //     fromPincode: `${this.storeInfo.pincode}`,
    //     categoryId: this.id,
    //     store_id: this.storeInfo.store.uid,
    //   };
    //   pincodeAct.getTat(params).then((res) => {
    //     this.deliveryInfo = res;
    //   });
    // },
    getPincode() {
      if (this.toPincode) {
        return this.toPincode;
      }
      return LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE);
    },
    showTatError(err) {
      this.$emit("showTatError", err.message);
    },
    onTatError(err) {
      this.showTatError(err);
    },
    onHideTatError() {
      this.$emit("hideTatError");
    },
    onNewPincodeReceived(obj) {
      let newPincode = obj.pincode_value;
      this.pincodeFunction = obj.pincode_act;
      LocalStorageService.addOrUpdateItem(
        STORAGE_KEYS.USER_PINCODE,
        newPincode
      );
      this.toPincode = newPincode;
      // this.$emit("pincodeChanged", newPincode);
    },
    getTatInfo() {
      if (this.storeInfo && this.$refs["pdpPincode"]) {
        this.tatInfo = {
          toPincode:
            this.toPincode ||
            LocalStorageService.getItem(STORAGE_KEYS.USER_PINCODE),
          fromPincode: `${this.storeInfo.pincode}`,
          categoryId: this.id,
          store_id: this.storeInfo.store.uid,
        };
        this.$refs["pdpPincode"]?.getTat(this.tatInfo).then((res) => {
          this.deliveryInfo = res;
        })
        .catch((err) => {
          this.pincodeError=true;
            this.$emit("showTatError", err.message);
             this.errMsg = err.message;
            this.isPinCodeValid = false;
          });
      }
    },
  },
};
</script>

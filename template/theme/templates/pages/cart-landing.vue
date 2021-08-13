<template>
  <div>
    <div
      v-if="
        context.bag_data &&
          context.bag_data.pageError &&
          context.bag_data.pageError.statusCode == '500'
      "
    >
      <empty-state :title="'Oops! Something went wrong'"></empty-state>
    </div>
    <div class="cart-message error" v-if="context.bag_data.message">
      {{ context.bag_data.message }}
    </div>
    <fdk-cart>
      <template slot-scope="cart">
        <div
          class="cart"
          v-if="context && context.bag_data && context.bag_data.items"
        >
          <template v-if="context.bag_data.items.length > 0">
            <div class="left">
              <div class="cart__title">
                <p>Shopping Bag</p>
                <span>( {{ context.bag_data.items.length }} items )</span>

                <fdk-share
                  v-click-outside="hideShare"
                  class="share_popup"
                  v-if="pageConfig.share_cart"
                  :class="{ share_modal: showShare }"
                >
                  <template slot-scope="share">
                    <div class="cart-share" @click="getCartShareLink(share)">
                      <img
                        src="./../../assets/images/share.svg"
                        class="share-img"
                      />
                      <transition name="fade">
                        <share
                          :title="
                            `Spread the shopping delight! Scan QR & share these products with
                      your loved ones`
                          "
                          :shareLoading="shareLoading"
                          :qr_code="qr_code"
                          @close-share="showShare = false"
                          v-if="showShare"
                          :share_link="share_link"
                        />
                      </transition>
                    </div>
                  </template>
                </fdk-share>
              </div>
              <div class="cart__items">
                <p class="items-title">ITEMS BEING SHIPPED</p>
                <cart-item
                  v-for="(item, index) in context.bag_data.items"
                  :key="index"
                  :item="item"
                  @update-cart="updateCart"
                ></cart-item>
              </div>
            </div>
            <div class="right">
              <div
                class="gst table"
                v-if="isGST && pageConfig && pageConfig.gst"
              >
                <!-- <div class="table__icon">
            <fdk-inline-svg :src="'kycdetails'"></fdk-inline-svg>
          </div> -->
                <div class="table__content">
                  <p class="heading">GST Details</p>
                  <input
                    @input="checkGSTIN(cart)"
                    :placeholder="gstin.label"
                    v-model="gstin.value"
                    required
                    class="gst-input"
                  />
                  <div
                    class="remove-gst"
                    @click="
                      removeGST(cart);
                      gstin.value = '';
                    "
                    v-if="gstin.applied"
                  >
                    <button
                      type="button"
                      title="Clear Selected"
                      aria-label="Clear Selected"
                      class="vs__clear"
                      style=""
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                      >
                        <path
                          d="M6.895455 5l2.842897-2.842898c.348864-.348863.348864-.914488 0-1.263636L9.106534.261648c-.348864-.348864-.914489-.348864-1.263636 0L5 3.104545 2.157102.261648c-.348863-.348864-.914488-.348864-1.263636 0L.261648.893466c-.348864.348864-.348864.914489 0 1.263636L3.104545 5 .261648 7.842898c-.348864.348863-.348864.914488 0 1.263636l.631818.631818c.348864.348864.914773.348864 1.263636 0L5 6.895455l2.842898 2.842897c.348863.348864.914772.348864 1.263636 0l.631818-.631818c.348864-.348864.348864-.914489 0-1.263636L6.895455 5z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <p v-if="gstin.applied" class="gst-applied">
                    Claim
                    {{
                      context.bag_data.breakup_values.raw.gst_charges
                        | currencyformat
                    }}
                    GST input credit
                  </p>
                  <p class="gst-error" v-if="gstin.showerror">
                    {{ gstin.errortext }}
                  </p>
                </div>
              </div>
              <div
                v-if="
                  context.employee_list &&
                    isStaffSelection &&
                    pageConfig.staff_selection
                "
              >
                <!-- <div class="table__icon">
            <fdk-inline-svg :src="'profile_black'"></fdk-inline-svg>
          </div> -->
                <fdk-employee>
                  <template slot-scope="employee">
                    <div class="employee table">
                      <div class="table__content">
                        <p class="heading">Assign Employee</p>
                        <v-select
                          placeholder="Employee Name"
                          class="select"
                          :options="getEmployeeList"
                          label="full_name"
                          :value="getSelectEmployeeValue"
                          v-on:input="updateEmployee($event, employee)"
                        ></v-select>
                      </div></div></template
                ></fdk-employee>
              </div>
              <div @click="updateCoupons(cart)" class="coupons table">
                <!-- <div class="table__icon">
            <fdk-inline-svg :src="'coupon'"></fdk-inline-svg>
          </div> -->
                <div class="table__content coupons">
                  <p class="heading">Offers & Coupons</p>
                  <p
                    class="subheading"
                    :style="{
                      color: context.bag_data.breakup_values.coupon.is_applied
                        ? 'green'
                        : 'black',
                    }"
                  >
                    <span
                      v-if="context.bag_data.breakup_values.coupon.is_applied"
                    >
                      Applied {{ context.bag_data.breakup_values.coupon.code }}
                    </span>
                    <span v-else style="font-size: 12px">
                      {{ context.bag_data.coupon_text }}
                    </span>
                  </p>
                </div>

                <div
                  class="icon"
                  @click.stop="updateCoupons(cart)"
                  v-if="context.bag_data.breakup_values.coupon.is_applied"
                >
                  <button
                    type="button"
                    title="Clear Selected"
                    aria-label="Clear Selected"
                    class="vs__clear"
                    style=""
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                    >
                      <path
                        d="M6.895455 5l2.842897-2.842898c.348864-.348863.348864-.914488 0-1.263636L9.106534.261648c-.348864-.348864-.914489-.348864-1.263636 0L5 3.104545 2.157102.261648c-.348863-.348864-.914488-.348864-1.263636 0L.261648.893466c-.348864.348864-.348864.914489 0 1.263636L3.104545 5 .261648 7.842898c-.348864.348863-.348864.914488 0 1.263636l.631818.631818c.348864.348864.914773.348864 1.263636 0L5 6.895455l2.842898 2.842897c.348863.348864.914772.348864 1.263636 0l.631818-.631818c.348864-.348864.348864-.914489 0-1.263636L6.895455 5z"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div class="icon" v-else>
                  <fdk-inline-svg :src="'arrow-right-black'"></fdk-inline-svg>
                </div>
              </div>
              <div class="gst employee table comment">
                <!-- <div class="table__icon">
            <fdk-inline-svg :src="'request'"></fdk-inline-svg>
          </div> -->
                <div class="table__content">
                  <p class="heading">Comment</p>
                  <input
                    :placeholder="comment.label"
                    v-model="comment.value"
                    required
                    class="gst-input"
                  />
                </div>
              </div>
              <div class="table__content rewards" v-if="isRewardPoints">
                <reward-points
                  :rewards_data="
                    context.bag_data &&
                      context.bag_data.breakup_values &&
                      context.bag_data.breakup_values.loyalty_points
                  "
                  @change-rewards="cart.updateRewardPoints(context.bag_data)"
                ></reward-points>
              </div>
              <div
                class="price-item"
                :class="{ total: item.key === 'total' }"
                v-for="(item, index) in context.bag_data.breakup_values.display"
                :key="index"
              >
                <span>{{ item.display }}</span>
                <span style="letter-spacing: 0.5px">
                  {{ item.value | currencyformat }}
                </span>
              </div>
              <checkout-mode
                :context="context"
                v-if="isPlacingForCustomers && pageConfig.checkout_mode"
              ></checkout-mode>

              <fdk-accounts>
                <template slot-scope="accountsData">
                  <template v-if="accountsData.is_logged_in">
                    <namaste-button
                      class="checkout-btn"
                      :disabled="
                        !context.bag_data.is_valid || (gstin && gstin.showerror)
                      "
                      @click="routeToCheckout(cart)"
                    >
                      Checkout
                    </namaste-button>
                  </template>
                  <template v-else-if="!accountsData.is_logged_in">
                    <namaste-button
                      class="checkout-btn"
                      @click="accountsData.openLogin"
                    >
                      Login
                    </namaste-button>
                    <div
                      v-if="isAnonymous && pageConfig.continue_as_guest"
                      class="guest-checkout dark-xxs"
                      @click="routeToCheckout(cart)"
                      v-bind:class="{
                        'guest-disable':
                          !context.bag_data.is_valid ||
                          (gstin && gstin.showerror),
                      }"
                    >
                      Continue as Guest ?
                    </div>
                  </template>
                </template>
              </fdk-accounts>
            </div>
            <namaste-loader v-if="isLoading" />
          </template>
          <empty-state v-else :title="'Your Shopping Bag is empty.'" />
          <toast :id="'toast-message'" :content="toast_message"></toast>
        </div>
      </template>
    </fdk-cart>
  </div>
</template>
<!-- #region  -->

<settings>
{
"props": [
    {
      "type": "checkbox",
      "id": "gst",
      "label": "GST",
      "default": true,
      "info": "Allows GST Input"
    },
    {
      "type": "checkbox",
      "id": "share_cart",
      "label": "Share Cart",
      "default": true,
      "info": "Allows Sharing of Cart"
    },
    {
      "type": "checkbox",
      "id": "staff_selection",
      "label": "Staff Selection",
      "default": true,
      "info": "Show Staff Selection"
    },
     {
      "type": "checkbox",
      "id": "checkout_mode",
      "label": "Self Checkout Mode",
      "default": true,
      "info": "Show Self Checkout Mode "
    },
    {
      "type": "checkbox",
      "id": "continue_as_guest",
      "label": "Guest Checkout",
      "default": true,
      "info": "Allows Guest checkout "
    }
]
}
</settings>

<!-- #endregion -->
<script>
import button from "./../../global/components/common/button";
import cartitem from "./../../global/components/cart/cart-item.vue";
import loader from "../components/loader";
import emptystate from "../components/empty-state";
import vSelect from "vue-select";
import { copyToClipboard } from "./../../helper/utils";
import toast from "./../../global/components/toast.vue";
import share from "./../../global/components/common/share";
import rewardPointsChip from "./../../global/components/cart/reward-points.vue";
import checkoutMode from "./../../global/components/cart/checkout-mode.vue";
import "vue-select/dist/vue-select.css";
const GST_NUMBER_LENGTH = 15;

export default {
  name: "cart",
  props: ["context", "apiSDK"],
  components: {
    "cart-item": cartitem,
    "namaste-button": button,
    "namaste-loader": loader,
    share: share,
    "reward-points": rewardPointsChip,
    "empty-state": emptystate,
    "checkout-mode": checkoutMode,
    vSelect,
    toast,
  },
  data() {
    return {
      toast_message: "",
      isLoading: false,
      shareLoading: false,
      showShare: false,
      share_link: "",
      qr_code: "",
      gstin: {
        label: "Add GST number",
        showerror: false,
        value: "",
        applied: false,
        errortext: "Please enter valid GST number",
      },
      comment: {
        value: "",
        label: "Enter comment",
      },
    };
  },
  computed: {
    pageConfig() {
      return this.page_config.props;
    },
    isGST() {
      const { feature } = this.context.app_features;
      if (feature) {
        return feature && feature.cart && feature.cart.gst_input;
      }
      return false;
    },
    isRewardPoints() {
      const { feature } = this.context.app_features;
      if (feature) {
        return (
          feature &&
          feature.common &&
          feature.common.reward_points &&
          feature.common.reward_points.debit &&
          feature.common.reward_points.debit.enabled
        );
      }
    },
    isAnonymous() {
      const { feature } = this.context.app_features;
      if (feature) {
        return (
          feature &&
          feature.landing_page &&
          feature.landing_page.continue_as_guest
        );
      }
      return false;
    },
    isStaff() {
      const isStaff =
        this.context.employee_access && this.context.employee_access.staff;
      return !!isStaff;
    },
    isStaffSelection() {
      const { feature } = this.context.app_features;
      if (feature) {
        return feature && feature.cart && feature.cart.staff_selection;
      }
      return false;
    },

    isPlacingForCustomers() {
      const { feature } = this.context.app_features;
      if (feature) {
        return feature && feature.cart && feature.cart.placing_for_customer;
      }
      return false;
    },
    getEmployeeList() {
      return this.context.employee_list.map((e) => {
        e.full_name = `${e.first_name} ${e.last_name} ${
          e.employee_code ? `(${e.employee_code})` : ""
        }`;
        return e;
      });
    },
    getSelectEmployeeValue() {
      if (this.context?.selected_employee?.employeeData?.first_name) {
        return {
          ...this.context.selected_employee.employeeData,
          full_name: `${this.context.selected_employee.employeeData.first_name} ${this.context.selected_employee.employeeData.last_name}`,
        };
      }
    },
  },
  watch: {
    context: function(newvalue) {
      this.comment.value = newvalue.bag_data.comment;
      this.gstin.value = newvalue.bag_data.gstin || "";
      if (this.gstin.value) {
        this.gstin.applied = true;
      }
    },
  },
  methods: {
    updateCart(params) {
      this.isLoading = true;
      if (params.operation === "inc") params.item.quantity++;
      else if (params.operation === "dec") {
        if (params.item.article.quantity < params.item.quantity) {
          params.item.quantity = params.item.article.quantity;
        } else {
          params.item.quantity--;
        }
      }
      params
        .func([params.item])
        .then(({ data }) => {
          this.isLoading = false;
        })
        .catch((err) => {
          console.log(err);
          this.isLoading = false;
        });
    },
    checkGSTIN(cart) {
      if (this.gstin.value.length === GST_NUMBER_LENGTH) {
        this.applyGST(cart);
      } else if (
        this.gstin.applied &&
        this.gstin.value.length !== GST_NUMBER_LENGTH
      ) {
        this.removeGST(cart);
      } else if (this.gstin.value.length >= GST_NUMBER_LENGTH) {
        this.gstin.showerror = true;
        this.gstin.applied = false;
      } else {
        this.gstin.showerror = false;
      }
    },
    applyGST(cart) {
      this.gstin.showerror = false;
      this.isLoading = true;
      let body = {
        gstin: this.gstin.value,
      };
      cart
        .updateCartMeta(body, this.context.bag_data.id)
        .then((res) => {
          if (res.is_valid) {
            this.gstin.applied = true;
            this.isLoading = false;

            return;
          }
          this.gstin.showerror = true;
          return;
        })
        .catch((err) => {
          this.gstin.showerror = true;
          this.isLoading = false;
        });
    },
    removeGST(cart) {
      this.isLoading = true;
      let body = { gstin: "" };
      cart
        .updateCartMeta(body, this.context.bag_data.id)
        .then((res) => {
          this.gstin.applied = false;
          //this.gstin.value = "";
          this.isLoading = false;

          return;
        })
        .catch((err) => {
          this.isLoading = false;
        });
    },
    updateEmployee(item, employee) {
      if (item) {
        employee.saveEmployee(item);
      } else {
        employee.removeEmployee();
      }
    },
    updateCoupons(cart) {
      if (this.context.bag_data.breakup_values.coupon.is_applied) {
        this.isLoading = true;
        cart
          .removeCoupon({
            id: this.context.bag_data.id,
          })
          .then((res) => {
            this.isLoading = false;
          })
          .catch((err) => {
            console.log(err);
            this.isLoading = false;
          });
        return;
      }
      this.$router.push(
        `/cart/available-coupons?id=${this.context.bag_data.id}`
      );
    },
    routeToCheckout(cart) {
      if (this.comment.value.length > 0) {
        this.isLoading = true;
        let body = {
          comment: this.comment.value,
        };
        cart.updateCartMeta(body, this.context.bag_data.id).then((res) => {
          this.isLoading = false;
          this.$router.push(`/cart/delivery?id=${this.context.bag_data.id}`);
        });
      } else {
        this.$router.push(`/cart/delivery?id=${this.context.bag_data.id}`);
      }
    },
    getCartShareLink(share) {
      this.showShare = true;
      this.shareLoading = true;
      share.cartShareLink(this.context.bag_data.id).then((res) => {
        share.generateQRCode(res).then((data) => {
          this.qr_code = `
                <div style="width: 250px;">
                  ${data.svg}
                </div>
                `;
          this.share_link = res;
          this.shareLoading = false;
        });
      });
    },
    hideShare() {
      this.showShare = false;
    },
  },
};
</script>

<style lang="less" scoped>
.cart-message {
  width: 100%;
  padding: 11px 20px;
  line-height: 20px;
  border-radius: 5px;
  margin-top: 20px;
  box-sizing: border-box;
  font-size: 12px;
  color: #41434c;
  &.info {
    background: #e5f1ff;
  }
  &.error {
    background: #fde6c2;
    border: 1px solid #dab57b;
  }
  @media @mobile {
    border-radius: 0;
  }
}
.guest-checkout {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
  color: @ds-black;
  cursor: pointer;
}
.guest-disable {
  pointer-events: none;
  color: #898a93 !important;
}
.cart {
  position: relative;
  width: 100%;
  display: flex;
  margin-bottom: 20px;
  margin-top: 50px;
  box-sizing: border-box;
  @media @mobile {
    padding: 0;
    margin: 0;
    flex-direction: column;
    justify-content: flex-start;
  }
  .share_popup {
    z-index: 2;
    .cart-share {
      position: absolute;
      right: 10px;
      top: 5px;
      padding: 3px;
      z-index: 1;
      cursor: pointer;
      @media @mobile {
        right: 15px;
        top: 15px;
      }
    }
  }

  .share_modal {
    @media @mobile {
      z-index: 10;
    }
  }

  .left {
    width: 55%;
    margin-right: 5%;

    @media @mobile {
      width: calc(100% - 40px);
      padding: 20px;
      margin-right: 0;
    }
  }
  &__title {
    padding: 20px 0;
    font-size: 20px;
    text-transform: uppercase;
    font-weight: bold;

    display: flex;
    align-items: center;
    margin-bottom: 5px;
    border-radius: 4px;
    padding: 10px;
    position: relative;
    @media @mobile {
      flex-direction: column;
      align-items: flex-start;
    }
    span {
      font-size: 14px;
      font-weight: 500;
      text-transform: none;
      margin-left: 10px;
      @media @mobile {
        margin-left: 0;
        margin-top: 5px;
      }
    }
  }
  &__items {
    padding: 10px;

    border-radius: 4px;
    @media @mobile {
      padding: 10px;
    }
    .items-title {
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0;
      @media @mobile {
        margin: 10px 0;
      }
    }
  }
  .heading {
    font-weight: bold;
  }
  .right {
    width: 40%;
    @media @mobile {
      padding: 20px;
      box-sizing: border-box;
      width: 100%;
    }
    .table {
      display: table;
      width: 100%;
      // border: 1px solid #ccc;
      box-sizing: border-box;
      margin-bottom: 10px;
      border: 1px solid #f6f6f6;
      &__icon {
        display: table-cell;
        vertical-align: middle;
        width: 50px;
        border-right: 1px solid #ccc;
      }
      &__content {
        position: relative;
        display: table-cell;
        padding: 10px;

        border-radius: 4px;
        margin-bottom: 10px;
        width: calc(100% - 50px);
        @media @mobile {
          padding: 10px;
        }
      }
    }
    .gst {
      .gst-input {
        width: 100%;
        padding: 10px 40px 5px 0;
        box-sizing: border-box;
        border: none;
        border-bottom: 1px solid #ccc;
        font-size: 12px;
        background: transparent;
      }
      .gst-applied {
        margin-top: 10px;
        color: green;
        font-size: 12px;
      }
      .gst-error {
        margin-top: 10px;
        font-size: 12px;
        color: red;
      }
      .remove-gst {
        cursor: pointer;
        position: absolute;
        top: 37px;
        right: 15px;
      }
    }
    .employee {
      border-top: none;
    }
    .rewards {
      display: table;
      width: 100%;
      @media @mobile {
        width: calc(100% - 20px);
      }
    }
    .coupons {
      border-top: none;
      cursor: pointer;

      border-radius: 4px;
      .heading {
        padding-left: 0;
        margin-bottom: 10px;
      }

      &:hover {
        background-color: #e5e5e5;
      }
      .icon {
        display: table-cell;
        vertical-align: middle;
        width: 45px;
        text-align: center;
        padding-right: 3px;
      }
    }
    .price-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 10px;
    }
    .total {
      margin-top: 5px;
      border-top: 1px solid #ccc;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 18px;
      padding: 20px 10px;
    }
    .checkout-btn {
      width: calc(100% - 10px);
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 0px 10px;
    }
  }
}
/deep/.vs__dropdown-toggle {
  border: none;
  border-bottom: 1px solid #ccc;
  border-radius: 0;
}
/deep/.vs__search {
  color: #777777;
  padding: 0;
}
/deep/.vs__selected-options {
  padding-left: 0;
}
/deep/ .vs__selected {
  padding-left: 0;
  margin-left: 0;
}
/deep/.vs__open-indicator {
  display: none;
}
/deep/.vs__actions {
  @media @mobile {
    padding-right: 16px;
  }
}
</style>

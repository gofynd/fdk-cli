<template>
  <div class="cart-page-cont">
    <div class="cart-message error" v-if="context.bag_data.message">
      {{ context.bag_data.message }}
    </div>

    <fdk-cart
      class="cart"
      v-if="context && context.bag_data && context.bag_data.items"
    >
      <template slot-scope="cart">
        <template v-if="context.bag_data.items.length > 0">
          <div class="cart-heading" style="flex: 0 0 100%">
            <div class="cart__title">
              <p>Bag</p>
              <span>
                {{ context.bag_data.items.length }} Item{{
                  context.bag_data.items.length > 1 ? "s" : ""
                }}
                | {{ getPiecesTxt() }}</span
              >

              <fdk-share
                v-click-outside="hideShare"
                class="share_popup"
                :class="{ share_modal: showShare, topLayer: showShare }"
              >
                <template slot-scope="share">
                  <div class="cart-share" @click="getCartShareLink(share)">
                    <fdk-inline-svg :src="'share'"></fdk-inline-svg>
                    <transition name="fade">
                      <rd-share
                        :title="`Spread the shopping delight! Scan QR & share these products with
                        your loved ones`"
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
          </div>
          <div class="left">
            <div class="cart__items">
              <cart-item
                v-for="(item, index) in context.bag_data.items"
                :key="index"
                :item="item"
                :updateCart="updateCart"
                :removeCart="removeCart"
              ></cart-item>
            </div>
          </div>
          <div class="right">
            <gst-chip
              :context="context"
              :cart="cart"
              v-if="
                context.bag_data.breakup_values &&
                isGST &&
                page_config &&
                page_config.props.gst
              "
              @hide-error="
                () => {
                  gstin.showerror = false;
                }
              "
              @show-error="
                () => {
                  gstin.showerror = true;
                }
              "
            ></gst-chip>

            <employee-chip
              v-if="
                getEmployeeList.length > 0 &&
                isStaffSelection &&
                page_config &&
                page_config.props.staff_selection
              "
              :is_selected="selectedStaffName.length > 0"
              :displayText="selectedStaffName"
              :context="context"
            ></employee-chip>

            <coupons
              :attrs="getCoupanData()"
              v-if="context.bag_data.breakup_values"
              v-on:remove-coupon="updateCoupons(cart)"
            ></coupons>
            <fdk-accounts>
              <template slot-scope="accountsData">
                <div v-if="accountsData.is_logged_in">
                  <reward-points
                    v-if="isRewardPoints"
                    :rewards_data="
                      context &&
                      context.bag_data &&
                      context.bag_data.breakup_values &&
                      context.bag_data.breakup_values.loyalty_points
                    "
                    @change-rewards="cart.updateRewardPoints(context.bag_data)"
                  ></reward-points>
                </div>
              </template>
            </fdk-accounts>
            <comment
              v-model="comment.value"
              :value="context.bag_data.comment"
              :placeholder="comment.label"
            ></comment>
            <breakup
              v-if="context.bag_data.breakup_values"
              :breakup="context.bag_data.breakup_values.display"
            ></breakup>
            <checkout-mode
              :context="context"
              v-if="
                isStaff &&
                isPlacingForCustomers &&
                page_config &&
                page_config.props.enable_customer
              "
            ></checkout-mode>
            <fdk-accounts>
              <template slot-scope="accountsData">
                <div v-if="accountsData.is_logged_in">
                  <white-splash-button
                    :class="{
                      secondary: true,
                      'disabled-ws': !context.bag_data.is_valid || getGstError,
                    }"
                    :disabled="!context.bag_data.is_valid || getGstError"
                    @click="routeToCheckout(cart)"
                  >
                    CHECKOUT
                  </white-splash-button>
                </div>
                <div v-else>
                  <white-splash-button
                    :class="{
                      secondary: true,
                      'disabled-ws': !context.bag_data.is_valid,
                    }"
                    @click="accountsData.openLogin"
                  >
                    LOGIN
                  </white-splash-button>
                  <div
                    v-if="
                      isAnonymous &&
                      page_config &&
                      page_config.props.enable_guest
                    "
                    class="guest-chkout"
                    @click="routeToCheckout(cart)"
                    v-bind:class="{
                      disable: !context.bag_data.is_valid,
                      'disable-btn': getGstError,
                    }"
                  >
                    Continue as Guest ?
                  </div>
                </div>
                <div class="agree-terms">
                  By continuing, I agree to the
                    <fdk-link
                        :target="`_blank`"
                        class="link"
                        :link="`/terms-and-conditions`"
                      >
                        Terms of Use
                      </fdk-link>
                      &
                      <fdk-link
                        :target="`_blank`"
                        class="link"
                        :link="`/privacy-policy`"
                      >
                        Privacy Policy
                    </fdk-link>
                  </div>
              </template>
            </fdk-accounts>
          </div>
          <fdk-loader class="loader-emerge" v-if="isLoading" />
        </template>
        <div class="cart-empty" v-else>
          <fdk-empty-state :title="'Your Shopping Bag is empty.'" />
        </div>
        <toast :id="'toast-message'" :content="toast_message"></toast>
      </template>
    </fdk-cart>
  </div>
</template>
<settings>
{
"props": [
    {
      "type": "checkbox",
      "id": "gst",
      "label": "GST",
      "default": true,
      "info": "Show GST on cart"
    },
    {
      "type": "checkbox",
      "id": "staff_selection",
      "label": "Staff Selection",
      "default": true,
      "info": "Show Staff selection on Cart"
    },
    {
      "type": "checkbox",
      "id": "enable_customer",
      "label": "Customer",
      "default": true,
      "info": "Placing on behalf of customer"
    },
    {
      "type": "checkbox",
      "id": "enable_guest",
      "label": "Enable Guest Checkout",
      "default": true,
      "info": "Enable Continue as Guest"
    }
  ]
}

</settings>
<script>
import button from "./../../global/components/common/button";
import cartitem from "./../../global/components/cart/cart-item.vue";
import vSelect from "vue-select";
import { copyToClipboard } from "./../../helper/utils";
import toast from "./../../global/components/toast.vue";
import share from "./../../global/components/share.vue";
import "vue-select/dist/vue-select.css";
import coupons from "./../../global/components/cart/coupons.vue";
import cartComment from "./../../global/components/cart/comment.vue";
import breakup from "./../../global/components/cart/breakup.vue";
import gstChip from "./../../global/components/cart/gst-chip.vue";
import employeeChip from "./../../global/components/cart/employee-card.vue";
import rewardPointsChip from "./../../global/components/cart/reward-points.vue";
import checkoutMode from "./../../global/components/cart/checkout-mode.vue";

const GST_NUMBER_LENGTH = 15;

export default {
  name: "cart",
  props: ["context"],
  components: {
    "cart-item": cartitem,
    "white-splash-button": button,
    "rd-share": share,
    "gst-chip": gstChip,
    "employee-chip": employeeChip,
    "reward-points": rewardPointsChip,
    "checkout-mode": checkoutMode,
    coupons: coupons,
    comment: cartComment,
    breakup,
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
        label: "Add any comments",
      },
    };
  },
  computed: {
    getGstError() {
      return this.gstin.showerror;
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
      if (this.context.selected_employee.first_name) {
        return {
          ...this.context.selected_employee,
          full_name: `${this.context.selected_employee.first_name} ${this.context.selected_employee.last_name}`,
        };
      }
    },
    selectedStaffName() {
      if (
        this.context.selected_employee &&
        this.context.selected_employee.first_name
      ) {
        return `${this.context.selected_employee.first_name} ${this.context.selected_employee.last_name}`;
      }
      return "";
    },
    isRewardPoints() {
      const { feature } = this.context?.app_features;
      if (feature) {
        return (
          feature &&
          feature.common &&
          feature.common.reward_points &&
          feature.common.reward_points.debit &&
          feature.common.reward_points.debit.enabled
        );
      }
      return false;
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
    isGST() {
      const { feature } = this.context.app_features;
      if (feature) {
        return feature && feature.cart && feature.cart.gst_input;
      }
      return false;
    },
  },
  mounted() {
    if (this.context.bag_data.comment.length > 0) {
      this.comment.value = this.context.bag_data.comment;
    }
  },
  methods: {
    removeCart(params) {
      this.isLoading = true;
      let item = this.context.bag_data.items[params.item.item_index];
      params
        .func([item])
        .then(({ data }) => {
          this.isLoading = false;
          //   this.validateCart();
        })
        .catch((err) => {
          console.log(err);
          this.isLoading = false;
        });
    },
    updateCart(params) {
      this.isLoading = true;
      let item = this.context.bag_data.items[params.item.item_index];
      if (params.operation === "inc") item.quantity++;
      else if (params.operation === "dec") {
        if (params.item.article.quantity < params.item.quantity) {
          item.quantity = params.item.article.quantity;
        } else {
          item.quantity--;
        }
      } else if (params.operation === "size")
        item.article.size = params.item.item_size;
      else if (params.operation === "qty") item.quantity = params.item.quantity;

      if (item.quantity <= 0) {
        item.quantity = 0;
      }
      params
        .func([item])
        .then(({ data }) => {
          this.isLoading = false;
          //   this.validateCart();
        })
        .catch((err) => {
          console.log(err);
          this.isLoading = false;
        });
    },
    checkGSTIN(cart) {
      this.gstin.applied = false;
      if (this.gstin.value.length === GST_NUMBER_LENGTH) {
        this.applyGST(cart);
      } else if (this.gstin.value.length >= GST_NUMBER_LENGTH) {
        this.gstin.showerror = true;
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
            this.gstin.showerror = false;
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
      let body = {
        gstin: "",
      };
      cart
        .updateCartMeta(body, this.context.bag_data.id)
        .then((res) => {
          this.gstin.applied = false;
          this.gstin.value = "";
          this.gstin.showerror = false;
          this.isLoading = false;
          return;
        })
        .catch((err) => {
          this.isLoading = false;
        });
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
    getPiecesTxt() {
      let count = 0;
      let context = this.context;
      if (context.bag_data && context.bag_data.items) {
        for (let i = 0; i < context.bag_data.items.length; i++) {
          count += context.bag_data.items[i].quantity;
        }
      }
      let piecesStr = "";
      if (count > 1) {
        piecesStr = `${count} Pieces`;
      } else {
        piecesStr = `${count} Piece`;
      }
      return piecesStr;
    },
    getCoupanData() {
      let couponBreakup = this.context.bag_data.breakup_values.coupon;
      let couponAttrs = {
        iconClass: "coupon",
        title: "Offers & Coupons",
        link: "/cart/available-coupons?id=" + this.context.bag_data.id,
      };
      if (couponBreakup && couponBreakup.code && couponBreakup.is_applied) {
        couponAttrs.hasCancel = true;
        couponAttrs.subtitle = `Applied: ${couponBreakup.code}`;
      } else {
        couponAttrs.subtitle = "View all offers";
      }
      return couponAttrs;
    },
  },
  watch: {
    context: function (newvalue) {
      this.context = newvalue;
      this.comment.value = newvalue.bag_data.comment;
      this.gstin.value = newvalue.bag_data.gstin;
      if (newvalue.bag_data.gstin) {
        this.gstin.applied = true;
      } else {
        this.gstin.applied = false;
      }
    },
  },
  //end of methods
};
</script>

<style lang="less" scoped>
.disable-btn {
  pointer-events: none;
  color: #898a93 !important;
}
@disabled-background-color: #808080;
.cart-empty {
  width: 100%;
}
.cart-page-cont {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1px 0 0 0;
  .loader-emerge {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    position: fixed;
    background-color: rgba(255, 255, 255, 0.4);
  }
}
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
.cart {
  position: relative;
  width: 100%;
  display: flex;
  margin-bottom: 20px;
  margin-top: 20px;
  box-sizing: border-box;
  background-color: @White;
  padding: 20px;
  flex-wrap: wrap;
  @media @mobile {
    padding: 0;
    margin: 0;
    flex-direction: column;
    justify-content: flex-start;
  }
  .cart-heading {
    flex: 0 0 100%;
    border-bottom: 1px solid @LightGray;
  }
  .share_popup {
    &.topLayer {
      @media @mobile {
        z-index: 10;
      }
    }
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

  .left {
    width: 64%;
    border-right: 1px solid @LightGray;
    // border-radius:8px;
    // margin-right:2%;
    @media @mobile {
      width: 100%;
      padding: 0px;
      margin-right: 0;
      border-right: 0;
    }
  }
  &__title {
    /*padding: 20px 0;*/
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
      color: @DustyGray;
      @media @mobile {
        margin-left: 0;
        margin-top: 5px;
      }
    }
  }
  &__items {
    padding: 0px;
    border-radius: 4px;
    @media @mobile {
      padding: 10px;
    }
  }
  .heading {
    font-weight: bold;
  }
  .right {
    width: 34%;
    background-color: #ffffff;
    border-radius: 8px;
    @media @mobile {
      padding: 0px;
      box-sizing: border-box;
      width: 100%;
    }
    .table {
      display: table;
      width: 100%;
      // border: 1px solid #ccc;
      box-sizing: border-box;
      margin-bottom: 10px;
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

    .employee {
      border-top: none;
    }
    .coupons {
      border-top: none;
      cursor: pointer;
      border: 1px solid #f6f6f6;
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
  .guest-chkout {
    text-align: center;
    padding: 15px 0 0 0;
    &.disable {
      display: none;
    }
  }
}

.agree-terms {
  font-size: 9px;
  line-height: 15px;
  text-align: center;
  padding-bottom: 7px;
  .link {
    color: #e8a76c;
    cursor: pointer;
  }
}

/deep/.disabled-ws {
  background-color: @disabled-background-color !important;
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

<template>
  <div class="cart" v-if="context && context.data && context.data.items">
    <template v-if="context.data.items.length > 0">
      <fdk-share>
        <template slot-scope="share">
          <div class="cart-share" @click="getCartShareLink(share)">
            <fdk-inline-svg src="share" />
          </div>
        </template>
      </fdk-share>
      <div class="left">
        <div class="cart__title">
          <p>Shopping Bag</p>
          <span
            >You have {{ context.data.items.length }} items in your bag</span
          >
        </div>
        <div class="cart__items">
          <p class="items-title">
            ITEMS BEING SHIPPED
          </p>
          <cart-item
            v-for="(item, index) in context.data.items"
            :key="index"
            :item="item"
            @update-cart="updateCart"
          />
        </div>
      </div>
      <div class="right">
        <div class="gst table">
          <!-- <div class="table__icon">
            <fdk-inline-svg :src="'kycdetails'"></fdk-inline-svg>
          </div> -->
          <div class="table__content">
            <p class="heading">GST Details</p>
            <input
              @input="checkGSTIN"
              :placeholder="gstin.label"
              v-model="gstin.value"
              required
              class="gst-input"
            />
            <div class="remove-gst" @click="removeGST" v-if="gstin.applied">
              <button
                type="button"
                title="Clear Selected"
                aria-label="Clear Selected"
                class="vs__clear"
                style=""
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                  <path
                    d="M6.895455 5l2.842897-2.842898c.348864-.348863.348864-.914488 0-1.263636L9.106534.261648c-.348864-.348864-.914489-.348864-1.263636 0L5 3.104545 2.157102.261648c-.348863-.348864-.914488-.348864-1.263636 0L.261648.893466c-.348864.348864-.348864.914489 0 1.263636L3.104545 5 .261648 7.842898c-.348864.348863-.348864.914488 0 1.263636l.631818.631818c.348864.348864.914773.348864 1.263636 0L5 6.895455l2.842898 2.842897c.348863.348864.914772.348864 1.263636 0l.631818-.631818c.348864-.348864.348864-.914489 0-1.263636L6.895455 5z"
                  ></path>
                </svg>
              </button>
            </div>
            <p v-if="gstin.applied" class="gst-applied">
              Claim
              {{ context.data.breakup_values.raw.gst_charges | currencyformat }}
              GST input credit
            </p>
            <p class="gst-error" v-if="gstin.showerror">
              {{ gstin.errortext }}
            </p>
          </div>
        </div>
        <div class="employee table">
          <!-- <div class="table__icon">
            <fdk-inline-svg :src="'profile_black'"></fdk-inline-svg>
          </div> -->
          <div class="table__content">
            <p class="heading">Assign Employee</p>
            <v-select
              placeholder="Employee Name"
              class="select"
              :options="getEmployeeList"
              label="full_name"
              :value="getSelectEmployeeValue"
              @input="updateEmployee"
            ></v-select>
          </div>
        </div>
        <div @click="updateCoupons" class="coupons table">
          <!-- <div class="table__icon">
            <fdk-inline-svg :src="'coupon'"></fdk-inline-svg>
          </div> -->
          <div class="table__content coupons">
            <p class="heading">Offers & Coupons</p>
            <p
              class="subheading"
              :style="{
                color: context.data.breakup_values.coupon.is_applied
                  ? 'green'
                  : 'black',
              }"
            >
              <span v-if="context.data.breakup_values.coupon.is_applied">
                Applied {{ context.data.breakup_values.coupon.code }}
              </span>
              <span v-else>
                {{ context.data.coupon_text }}
              </span>
            </p>
          </div>

          <div
            class="icon"
            @click.stop="updateCoupons"
            v-if="context.data.breakup_values.coupon.is_applied"
          >
            <button
              type="button"
              title="Clear Selected"
              aria-label="Clear Selected"
              class="vs__clear"
              style=""
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
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
        <div
          class="price-item"
          :class="{ total: item.key === 'total' }"
          v-for="(item, index) in context.data.breakup_values.display"
          :key="index"
        >
          <span>{{ item.display }}</span>
          <span style="letter-spacing: 0.5px;">
            {{ item.value | currencyformat }}
          </span>
        </div>
        <namaste-button
          class="checkout-btn"
          :disabled="!context.data.is_valid"
          @click="routeToCheckout"
        >
          Checkout
        </namaste-button>
      </div>
      <namaste-loader v-if="isLoading" />
    </template>
    <div v-else>
      <empty-state title="Your Shopping Bag is empty." />
    </div>
  </div>
</template>

<script>
import button from './../../global/components/common/button';
import cartitem from './../../global/components/cart/cart-item';
import loader from '../components/loader';
import emptystate from '../components/empty-state';
import vSelect from 'vue-select';
import { copyToClipboard } from './../../helper/utils';

import 'vue-select/dist/vue-select.css';
const GST_NUMBER_LENGTH = 15;

export default {
  name: 'cart',
  props: ['context'],
  components: {
    'cart-item': cartitem,
    'namaste-button': button,
    'namaste-loader': loader,
    'empty-state': emptystate,
    vSelect,
  },
  data() {
    return {
      isLoading: false,
      gstin: {
        label: 'Add GST number',
        showerror: false,
        value: '',
        applied: false,
        errortext: 'Please enter valid GST number',
      },
      comment: {
        value: '',
        label: 'Enter comment',
      },
    };
  },
  computed: {
    getEmployeeList() {
      return this.context.employeeList.map((e) => {
        e.full_name = `${e.first_name} ${e.last_name}`;
        return e;
      });
    },
    getSelectEmployeeValue() {
      if (this.context.selectedEmployee.first_name) {
        return {
          ...this.context.selectedEmployee,
          full_name: `${this.context.selectedEmployee.first_name} ${this.context.selectedEmployee.last_name}`,
        };
      }
    },
  },
  methods: {
    updateCart(params) {
      this.isLoading = true;
      if (params.operation === 'inc')
        this.context.data.items[params.item.item_index].quantity++;
      else if (params.operation === 'dec')
        this.context.data.items[params.item.item_index].quantity--;
      else if (params.operation === 'del')
        this.context.data.items[params.item.item_index].quantity = 0;
      params
        .func(this.context.data.items)
        .then(({ data }) => {
          this.isLoading = false;
          //   this.validateCart();
        })
        .catch((err) => {
          console.log(err);
          this.isLoading = false;
        });
    },
    checkGSTIN(event) {
      this.gstin.applied = false;
      if (this.gstin.value.length === GST_NUMBER_LENGTH) {
        this.applyGST();
      } else if (this.gstin.value.length >= GST_NUMBER_LENGTH) {
        this.gstin.showerror = true;
      }
    },
    applyGST() {
      this.gstin.showerror = false;
      this.isLoading = true;

      this.$themeAction
        .dispatch(
          this.context.THEME_ACTIONS.UPDATE_CART_META,
          { gstin: this.gstin.value },
          { uid: String(this.context.data.uid || '') }
        )
        .then((res) => {
          let { data } = res;
          if (data.is_valid) {
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
    removeGST() {
      this.isLoading = true;

      this.$themeAction
        .dispatch(
          this.context.THEME_ACTIONS.UPDATE_CART_META,
          { gstin: '' },
          { uid: String(this.context.data.uid || '') }
        )
        .then((res) => {
          let { data } = res;
          this.gstin.applied = false;
          this.gstin.value = '';
          this.isLoading = false;

          return;
        })
        .catch((err) => {
          this.isLoading = false;
        });
    },
    updateEmployee(item) {
      if (item) {
        this.$themeAction.dispatch(
          this.context.THEME_ACTIONS.SAVE_SELECTED_EMPLOYEE,
          item
        );
      } else {
        this.$themeAction.dispatch(
          this.context.THEME_ACTIONS.REMOVE_SELECTED_EMPLOYEE
        );
      }
    },
    updateCoupons() {
      if (this.context.data.breakup_values.coupon.is_applied) {
        this.isLoading = true;
        this.$themeAction
          .dispatch(this.context.THEME_ACTIONS.REMOVE_COUPON_CODE, {
            uid: String(this.context.data.uid || ''),
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
      this.$router.push(`/cart/available-coupons?uid=${this.context.data.uid}`);
    },
    routeToCheckout() {
      if (this.comment.value.length > 0) {
        this.isLoading = true;
        this.$themeAction
          .dispatch(
            this.context.THEME_ACTIONS.UPDATE_CART_META,
            { comment: this.comment.value },
            { uid: String(this.context.data.uid || '') }
          )
          .then((res) => {
            this.isLoading = false;
            this.$router.push(`/cart/delivery?uid=${this.context.data.uid}`);
          });
      } else {
        this.$router.push(`/cart/delivery?uid=${this.context.data.uid}`);
      }
    },
    getCartShareLink(share) {
      console.log(share);
      share.cartShareLink(this.context.data.uid).then((res) => {
        this.copyToClipboard(res);
      });
    },
    copyToClipboard(data) {
      copyToClipboard(data);
      this.$toasted.global.showToaster('Link Copied to Clipboard', 1000);
    },
  },
};
</script>

<style lang="less" scoped>
.cart {
  padding: 0 11.36364%;
  position: relative;
  width: 100%;
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  box-sizing: border-box;
  @media @mobile {
    padding: 0;
    margin-bottom: 0;
    flex-direction: column;
    justify-content: flex-start;
  }
  .cart-share {
    position: absolute;
    right: 133px;
    top: 0;
    padding: 3px;
    z-index: 1;
    cursor: pointer;
    @media @mobile {
      right: 15px;
      top: 25px;
    }
  }
  .left {
    width: 55%;
    @media @mobile {
      width: 100%;
    }
  }
  &__title {
    padding: 20px;
    font-size: 24px;
    text-transform: uppercase;
    font-weight: bold;
    background-color: #f6f6f6;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    @media @mobile {
      flex-direction: column;
      align-items: flex-start;
    }
    span {
      font-size: 14px;
      margin-left: 20px;
      font-weight: normal;
      text-transform: none;
      @media @mobile {
        margin-left: 0;
        margin-top: 5px;
      }
    }
  }
  &__items {
    padding: 20px;
    background-color: #f6f6f6;
    .items-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
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
        padding-left: 0;
        width: calc(100% - 50px);
        @media @mobile {
          padding: 10px 0;
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
        font-size: 16px;
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
    .coupons {
      border-top: none;
      cursor: pointer;
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
      padding: 5px 0;
    }
    .total {
      margin-top: 5px;
      border-top: 1px solid #ccc;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 18px;
      padding: 20px 0;
    }
    .checkout-btn {
      width: 100%;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 2px;
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

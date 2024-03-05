<template>
  <div class="stores">
    <div class="store-item regular-xxs">
      <label>
        <input
          type="radio"
          name="store_item"
          :value="JSON.stringify(storeitem)"
          @click="selectStoreItem"
          :checked="storeitem.selected"
        />
        <div class="store-info">
          <div class="store-left">
            <svg-wrapper v-if="!isActive" :svg_src="'regular'"></svg-wrapper>
            <svg-wrapper
              v-if="isActive"
              :svg_src="'radio-selected'"
            ></svg-wrapper>
          </div>
          <div class="store-right">
            <div>
              <span>{{ storeitem.store.name }}</span>
              <span> {{ "," + storeitem.seller.name }}</span>
            </div>
            <div v-if="global_config && global_config.props">
              <span
                class="effective-price"
                :style="
                  storeitem.price.effective !== storeitem.price.marked
                    ? 'color:' + global_config.props.text_sale_price_color
                    : ''
                "
              >
                {{ storeitem.price.effective | currencyformat }}</span
              >
              <span
                :style="
                  'color:' + global_config.props.text_strikethrough_price_color
                "
                class="marked-price"
                v-if="storeitem.price.effective !== storeitem.price.marked"
              >
                {{ storeitem.price.marked | currencyformat }}</span
              >
            </div>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>

<script>
import SvgWrapper from './../../common/svg-wrapper.vue';
export default {
  name: "store-item",
  components: {
    "svg-wrapper": SvgWrapper
  },
  props: {
    storeitem: {},
    activeStoreInfo: {},
  },
  data() {
    return {
      isOpen: this.storeitem.isOpen || false,
    };
  },
  computed: {
    isActive() {
      if (this.activeStoreInfo) {
        if (
          this.activeStoreInfo.seller.uid === this.storeitem.seller.uid &&
          this.activeStoreInfo.store.uid === this.storeitem.store.uid
        ) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    selectStoreItem() {
      this.$emit("select-store-item", this.storeitem);
    },
  },
};
</script>

<style lang="less" scoped>
.stores {
  padding: 5px 0px;
  border-top: 1px solid #eeeeee;
  animation: fadeIn 0.25s ease-in;
  .store-item {
    display: flex;
    align-items: center;

    label {
      width: 100%;
      cursor: pointer;
    }
    input[type="radio"] {
      display: none;
    }
    .store-info {
      display: flex;
      align-items: center;
      margin: 5px;
      .store-right {
        margin-left: 15px;
        display: block;
      }
    }
  }
  &:hover {
    background-color: #eeeeee;
  }
}

.store-item input:checked {
  background-color: #e5defa;
}
.store-item input:checked + .store-info > .store-left .radio-icon {
  background: url("/public/assets/radio-selected.svg");
  background-repeat: no-repeat;
  width: 20px;
  height: 20px;
}

.store-item input + .store-info > .store-left .radio-icon {
  background: url("/public/assets/regular.svg");
  background-repeat: no-repeat;
  width: 20px;
  height: 20px;
}
</style>

<template>
  <transition name="modal" mode="out-in">
    <modal
      :isOpen="isOpen"
      v-on:closedialog="closeDailog"
      :title="productName"
      :modalClass="'product_metaModal'"
    >
      <div v-if="isDataLoading">
        <fdk-loader class="loader-ws"></fdk-loader>
      </div>
      <div v-if="!isDataLoading">
        <div class="store-header">
          <div>Available in {{ all_stores_info.items.length }} stores</div>
          <div class="filters">
            <select class="custom-select" @change="selectionChange">
              <option
                v-for="opt in all_stores_info.sort_on"
                :key="opt.value"
                :value="opt.value"
                :selected="opt.is_selected"
                >{{ opt.name }}</option
              >
            </select>
          </div>
        </div>
        <fdk-infinite-scrolling
          @loadmore="loadMoreData(sellerData)"
          :loadingData="loading"
        >
          <div class="data">
            <store
              v-for="item in all_stores_info.items"
              :key="item.store_name"
              :storeitem="item"
              :activeStoreInfo="activeStoreInfo"
              v-on:select-store-item="setActiveStore"
            ></store>
          </div>
        </fdk-infinite-scrolling>
        <div class="modal-footer" @click="storeSelected">
          <div class="common-btn checkout">SELECT SELLER</div>
        </div>
      </div>
    </modal>
  </transition>
</template>

<style lang="less" scoped>
/deep/.modal-container {
  padding: 4px 25px;
  background-color: #fff;
  min-width: 300px;
  border: 1px solid #fff;
  border-radius: 3px;
  min-height: 480px;
  max-width: 720px;
  max-height: 720px;
  overflow: auto;
}

.common-btn {
  width: calc(100% - 30px);
  margin: 10px 0px;
}
.store-header {
  display: flex;
  width: 100%;
  align-items: center;
  margin: 20px 0px;
  .filters {
    margin-left: auto;
    text-align: right;
    .custom-select {
      margin-left: 15px;
      padding-right: 30px;
    }
  }
}
.modal-footer {
  @media @mobile {
    position: fixed;
    bottom: 0px;
    left: 20px;
    right: 20px;
  }
}
.data {
  max-height: 400px;
  min-height: 300px;
  overflow: auto;

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
    background-color: #f8f8f8;
  }
  &::-webkit-scrollbar {
    width: 5px;
    background-color: #ffffff;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #f8f8f8;
  }
  @media @mobile {
    max-height: calc(100vh - 180px);
  }
}
</style>

<script>
import modal from "./../../../global/components/modal.vue";
import store from "./store-item.vue";
export default {
  name: "store-modal",
  extends: modal,
  components: {
    modal: modal,
    store: store,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    sellerData: {},
    activeStoreInfo: {},
    productName: String,
    all_stores_info: {},
  },
  data() {
    return {
      inProgress: false,
    };
  },
  computed: {
    isDataLoading() {
      return this.all_stores_info === null;
    },
  },
  methods: {
    loadMoreData(sellerData) {
      if (this.all_stores_info.page.has_next) {
        this.loading = true;
        sellerData.loadMoreStores().then((res) => {
          this.loading = false;
        });
      }
    },
    closeDailog() {
      this.$emit("closedialog");
    },
    setActiveStore(item) {
      this.activeStoreInfo = item;
    },
    selectionChange(event) {
      this.$emit("store-filter", event.target.value);
    },
    storeSelected() {
      this.$emit("store-item-select", this.activeStoreInfo);
    },
    getselectedStore() {
      let storesElm = document.querySelectorAll("input[name=store_item]");
      for (let i = 0; i < storesElm.length; i++) {
        if (storesElm[i].checked) {
          return JSON.parse(storesElm[i].value);
        }
      }
      return null;
    },
  },
};
</script>

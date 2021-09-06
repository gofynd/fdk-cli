<template>
  <fdk-product-card>
    <template slot-scope="productData">
      <fdk-accounts class="wishlist-btn">
        <template slot-scope="accountsData">
          <div
            v-if="accountsData.is_logged_in && isMounted"
            @click="productData.updateWishList($event, item)"
          >
            <fdk-inline-svg
              v-if="!item.follow"
              :src="'wishlist'"
            ></fdk-inline-svg>
            <fdk-inline-svg
              v-else-if="item.follow"
              :src="'wishlist-active'"
            ></fdk-inline-svg>
          </div>
        </template>
      </fdk-accounts>
    </template>
  </fdk-product-card>
</template>

<style lang="less" scoped></style>

<script>
export default {
  name: "favourite",
  props: {
    item: Object,
    cardType: String,
  },
  mounted() {
    this.isMounted = true;
  },
  data: function() {
    return {
      isMounted: false,
    };
  },
  methods: {},
};
</script>

<template>
  <fdk-product-card>
    <template slot-scope="productData">
      <fdk-accounts class="wishlist-btn">
        <template slot-scope="accountsData">
          <div
            v-if="isMounted"
            @click.prevent="accountsData.is_logged_in ? productData.updateWishList($event, item) : accountsData.openLogin()"
          >
            <svg-wrapper
              v-if="!item.follow"
              :svg_src="'wishlist'"
            ></svg-wrapper>
            <svg-wrapper
              v-else-if="item.follow"
              :svg_src="'wishlist-active'"
            ></svg-wrapper>
          </div>
        </template>
      </fdk-accounts>
    </template>
  </fdk-product-card>
</template>

<style lang="less" scoped></style>

<script>
import SvgWrapper from './../../components/common/svg-wrapper.vue';
export default {
  name: "favourite",
  props: {
    item: Object,
    cardType: String,
  },
  components: {
    "svg-wrapper": SvgWrapper
  },
  mounted() {
    this.isMounted = true;
  },
  data: function() {
    return {
      isMounted: false,
    };
  },
};
</script>

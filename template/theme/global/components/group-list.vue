<template>
  <div class="grp-list-wrap">
    <div class="group-cards" :class="{'logo-only-group': show_only_logo}" :data-card="cardtype" :style="getFlex">
      <template v-if="cardtype === 'PRODUCT'">
        <group-item-product 
          v-for="(item, index) in cardlist"
          :card="item"
          :key="item.slug + cardtype + index"
          :global_config="global_config"
        />
      </template>
      <template v-else-if="cardtype === 'GALLERY'">
        <gallery-item
          v-for="(item, index) in cardlist"
          :block="item"
          :key="'gallery-item' + index"
          
        />
      </template>
      <template v-else-if="show_only_logo">
        <group-item-logo
          v-for="(item, index) in cardlist"
          :card="item"
          :cardtype="cardtype"
          :key="'group-item-logo' + index"
          :global_config="global_config"
        />
      </template>
      <template v-else>
        <group-item
          v-for="(item, index) in cardlist"
          :card="item"
          :key="item.slug + cardtype + index"
          :cardtype="cardtype"
          :global_config="global_config"
        />
      </template>
    </div>
  </div>
</template>

<script>
import groupItem from "./group-item.vue";
import groupItemProduct from "./group-item-product.vue";
import groupItemLogo from "./group-item-logo.vue";
import galleryItem from "./gallery-item.vue";

export default {
  name: "groupList",
  components: {
    "group-item": groupItem,
    "group-item-product": groupItemProduct,
    "gallery-item": galleryItem,
    "group-item-logo": groupItemLogo
  },
  props: {
    cardlist: {
      type: Array,
    },
    cardtype: {
      type: String,
      enum: ["BRANDS", "CATEGORIES", "COLLECTIONS", "WISHLIST", "PRODUCT"],
    },
    itemcount: {
      type: Number
    },
    show_only_logo: {
      type: Boolean,
      default: false
    },
    global_config: {}
  },
  computed : {
    // getFlex () {
    //   if (this.itemcount > this.cardlist.length) {
    //     return 'flex: 1'
    //   } else {
    //     let w = (100/this.itemcount)-2.471169687;//Grid width 1214, padding 30px ==> percentage padding ==> 2.471169687
    //     return `flex: 0 0 ${w}%`
    //   }
    // },
    getFlex () {
      // if (this.itemcount > this.cardlist.length) {
      //   return 'flex: 1'
      // } else {
        return `grid-template-columns: repeat(${this.itemcount}, 1fr)`;
      // }
    }
  }
};
</script>

<style lang="less" scoped>
.grp-list-wrap {
  width: 100%;
}
.group-cards {
   --gap: 30px;
   --gapTop: 30px;
    // display: inline-flex;
    // flex-wrap: wrap;
    // justify-content: center;
    // margin: calc(-1 * var(--gapTop)) 0 0 0;
    // width: calc(100% + var(--gap));
    // > * {
    //   margin: var(--gapTop) 0 0 var(--gap);
    //   box-sizing: border-box;
    // }
    // &.logo-only-group {
    //     --gap: 40px;
    //     --gapTop: 30px;
    // }
    // @media @tablet {
    //   --gap: 40px;
    //   --gapTop: 30px;
    //    > * {
    //     flex: 0 0 27.8% !important
    //   }
    //   > .logo-only-view {
    //     flex: 0 0 17% !important
    //   }
    // }
    // @media @mobile {
    //   --gap: 15px;
    //   --gapTop: 20px;
    //   > * {
    //     flex: 0 0 44.8% !important
    //   }
    //   > .logo-only-view {
    //     --gap: 15px;
    //     --gapTop: 20px;
    //     flex: 0 0 45.8% !important
    //   }
    // }
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15%, 1fr));
  grid-auto-rows: auto;
  grid-template-rows: 1fr;
  grid-gap: var(--gapTop) var(--gap);
  @media @tablet {
    --gap: 40px;
    --gapTop: 30px;
    grid-template-columns: repeat(auto-fill, minmax(28%, 1fr)) !important;
  }
  @media @mobile {
    --gap: 15px;
    --gapTop: 30px;
      grid-template-columns: repeat(auto-fill, minmax(32%, 1fr)) !important;
  }
  // &[data-card='COLLECTIONS'] {
  //   @media @mobile {
  //     --gapTop: 30px;
  //   }
  // }
  &.logo-only-group {
    @media @tablet {
      --gap: 40px;
      --gapTop: 30px;
      grid-template-columns: repeat(auto-fill, minmax(16%, 1fr)) !important;
    }
    @media @mobile {
      --gap: 15px;
      --gapTop: 20px;
      grid-template-columns: repeat(auto-fill, minmax(32%, 1fr)) !important;
    }
  }
  
}
// @media screen and (max-width: 768px) {
//   .group-cards {
//     grid-template-columns: repeat(auto-fill, minmax(40%, 1fr)) !important;
//     grid-gap: 0.5em;
//   }
// }
</style>

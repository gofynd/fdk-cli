<template>
  <div
    class="collections__template section-main-container"
    :style="global_config ? 'color:' + global_config.props.text_body_color : ''"
  >
    <template v-if="context.collections && context.collections.items && context.collections.items.length > 0">
      <div class="card-container">
        <div class="top-items">
          <div class="title-block">
            <div
              class="section-heading"
              :style="'color:' + global_config.props.text_heading_link_color"
              v-if="
                page_config.props.title &&
                page_config.props.title.length > 0
              "
            >
              {{ page_config.props.title }}
            </div>
          </div>
            <fdk-infinite-collections>
            <template slot-scope="collectionListing">
            <fdk-infinite-scrolling
              :loadingData="loading"
              v-on:loadmore="collectionListing.loadmore"
            >
          <group-list
            :cardlist="context.collections.items"
            :cardtype="'COLLECTIONS'"
            :itemcount="page_config.props.items_per_row"
            :global_config="global_config"
          ></group-list>
            </fdk-infinite-scrolling>
          </template>
            </fdk-infinite-collections>
              <fdk-loader
          v-if="!(context.collections.page.has_next === false)"
          id="loader"
        ></fdk-loader>

        </div>
      </div>
    </template>
    <fdk-empty-state
          v-else-if="context.collections && context.collections.items && context.collections.items.length === 0 && isMounted"
          :title="'No Collections Found'"
    ></fdk-empty-state>
  </div>
</template>
<!-- #region  -->

<settings>
{
    "props": [
        {
            "type": "text",
            "id": "title",
            "default": "",
            "label": "Title"
        },
        {
            "type": "range",
            "id": "items_per_row",
            "min": 3,
            "max": 8,
            "step": 1,
            "unit": "",
            "label": "Items per row",
            "default": 5,
            "info": "Maximum items allowed per row"
        }
    ]
}
</settings>
<!-- #endregion -->
<script>
import placeholderImage from "./../../assets/images/placeholder.png";
import { isBrowser, isNode } from "browser-or-node";
import groupList from "./../../global/components/group-list.vue";
import { detectMobileWidth } from "../../helper/utils";
import emergeImage from "./../../global/components/common/emerge-image.vue";
import placeholderItemsVue from "../../global/components/sections/placeholder-items.vue";

export default {
  data() {
    return {
      collections: [],
      isLoading: false,
      isMounted: false,
    };
  },
  components: {
    "group-list": groupList,
    "emerge-image": emergeImage,
    "placeholder-items": placeholderItemsVue,
  },
  watch: {
    settings: function (newVal, oldVal) {},
  },
  computed: {
  },
  methods: {
  },
  mounted() {
    this.isMounted = true
  },
};
</script>

<style lang="less" scoped>

/deep/ .infi-loader {
  .container {
    background-color: transparent;
  }
}
::-webkit-scrollbar {
  display: none;
}
.collections {
  // &__template {
  //   // .section-heading {
  //   //   font-size: 18px;
  //   //   text-align: left;
  //   //   color: #41434c;
  //   //   margin-bottom: 6px;
  //   //   @media @mobile {
  //   //     font-size: 14px;
  //   //     margin-bottom: 6px;
  //   //     margin-left: 9px;
  //   //   }
  //   // }
  // }
  &__content {
    top: 92%;
    position: absolute;
    display: flex;
    width: 100%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* flex-direction: column; */
    /* justify-content: center; */
    /* align-items: center; */
    /* opacity: 0; */
    transition: all 0.5s;
    background: transparent linear-gradient(180deg, transparent, #000) 0 0
      no-repeat padding-box;
    color: #ffffff;
    border-radius: 8px;
  }
}

.card-container {
  margin: 0;
  position: relative;
}
.top-items {
  // padding: 14px;
  border-radius: @border-radius;
  background: transparent;
  // margin: 10px 0 0 0;
}

.title-block {
  display: flex;
  text-transform: uppercase;
  text-align: center;
  box-sizing: border-box;
  position: relative;
  max-width: @page-width;
  .margin-0-auto();
  >div {
    flex: 0 0 100%;
  }
}


.item {
  padding-right: 20px;
  box-sizing: border-box;
}

</style>

<template>
  <div
    class="section-main-container"
    :style="global_config ? 'color:' + global_config.props.text_body_color : ''"
     
  >
    <fdk-loader v-if=" context && context.categories &&  context.categories.loading"></fdk-loader>
    <template v-if="context && context.categories && context.categories.allsecondchilds.length > 0">
      <div class="card-container">
        <div class="top-items">
          <div class="title-block">
            <div
              v-if="page_config && page_config.props.heading"
              :style="'color:' + global_config.props.text_heading_link_color"
              class="section-heading"
            >
              {{ page_config.props.heading }}
            </div>
          </div>
          <group-list
            :cardlist="context.categories.allsecondchilds"
            :cardtype="'CATEGORIES'"
            :itemcount="page_config.props.items_per_row"
            :global_config="global_config"
          ></group-list>
        </div>
      </div>
    </template>
    <fdk-empty-state
      v-else-if="
        context &&
          context.categories &&
          context &&
          !context.categories.loading &&
          context.categories.allsecondchilds.length === 0 &&
          isMounted
      "
      :title="'No Categories found'"
    ></fdk-empty-state>
  </div>
</template>
<!-- #region  -->
<settings>
{
    "props": [
        {
            "type": "text",
            "id": "heading",
            "default": "",
            "label": "Category List Heading"
        },
        {
            "type": "range",
            "id": "items_per_row",
            "min": 3,
            "max": 5,
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
import groupList from "./../../global/components/group-list.vue";
import { isBrowser, isNode } from "browser-or-node";
import { detectMobileWidth } from "../../helper/utils";
import placeholderImage from "./../../assets/images/placeholder.png";
import emergeImage from "./../../global/components/common/emerge-image.vue";

export default {
  props: {},
  data() {
    return {
      categories: [],
      isMounted: false,
      isLoading: false,
    };
  },
  components: {
    "group-list": groupList,
    "emerge-image": emergeImage,
  },
  mounted() {
    this.isMounted = true;
  },
  methods: {
    detectMobileWidth,
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
  },
  beforeDestroy() {},
};
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  display: none;
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
  > div {
    flex: 0 0 100%;
  }
}

.text-spacing {
  margin: 1px 0 15px 0;
}

// display: flex;
// justify-content: space-between;
// color: #41434c;
// text-transform: uppercase;
.title {
  font-weight: 700;
  font-size: 18px;
  @media @mobile {
    font-size: 14px;
  }
}

@media @mobile {
  /deep/ .item {
    width: 100% !important;
    margin-bottom: 20px;

    &:not(:nth-child(2n + 0)) {
      margin-right: 19px !important;
    }
  }
}
</style>

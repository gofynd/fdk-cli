<template>
  <div
    class="section-main-container"
    :style="global_config ? 'color:' + global_config.props.text_body_color : ''"
  >
    <div
      v-if="
        context.brands.loading &&
          !(context.brands  && context.brands.items && context.brands.items.length > 0)
      "
    >
      <fdk-loader></fdk-loader>
    </div>
    <template
      v-else-if="
        context.brands  && context.brands.items && context.brands.items.length > 0
      "
    >
      <div class="card-container">
        <div class="top-items">
          <div class="title-block">
            <div
              :style="'color:' + global_config.props.text_heading_link_color"
              class="section-heading"
              v-if="
                page_config && page_config.props && page_config.props.title && page_config.props.title.length > 0
              "
            >
              {{ page_config.props.title }}
            </div>
          </div>
          <fdk-brands-listing>
            <template slot-scope="brandListing">
              <fdk-infinite-scrolling
                v-on:loadmore="brandListing.loadmore"
                :loadingData="context.brands.loading"
              >
                <group-list
                  :cardlist="context.brands.items"
                  :cardtype="'BRANDS'"
                  :itemcount="page_config.props.items_per_row"
                  :show_only_logo="page_config.props.view_options === 'logo'"
                  :global_config="global_config"
                ></group-list>
              </fdk-infinite-scrolling>
            </template>
          </fdk-brands-listing>
          <fdk-loader
            id="loader"
            v-if="context.brands.page.has_next"
          ></fdk-loader>
        </div>
      </div>
    </template>
    <fdk-empty-state
      v-else-if="
        context.brands  &&
          context.brands.items &&
          context.brands.items.length === 0 &&
          isMounted
      "
      :title="'No Brands Found'"
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
            "id": "view_options",
            "type": "select",
            "options": [
                {
                    "value": "logo",
                    "text": "Logo View"
                },
                {
                    "value": "fullview",
                    "text": "Logo and Banner View"
                }
            ],
            "default": "fullview",
            "label": "View Options",
            "info": "Brand card view options"
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
import emergeImage from "./../../global/components/common/emerge-image.vue";
import placeholderItemsVue from "../../global/components/sections/placeholder-items.vue";

export default {
  data() {
    return {
      brands: [],
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
    getparam() {
      return this.$route.params.department;
    },
    getDepartments() {
      if (
        this.context.departments &&
        Array.isArray(this.context.departments)
      ) {
        return this.context.departments;
      }
      return null;
    },
  },
  mounted() {
    this.isMounted = true;
  },
} 
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

.card-container {
  margin: 0;
  position: relative;
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

  .brands {
    justify-content: left;
  }
}
.logo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  height: 100%;
  > section {
    max-width: 115px;
    display: flex;
  }
  h3 {
    max-width: 115px;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    color: @Black;
    line-height: 20px;
    font-size: 16px;
    margin: 18px 0 0 0;
    text-transform: capitalize;
    @media @tablet {
      font-size: 14px;
    }
    @media @mobile {
      font-size: 13px;
    }
  }
}
</style>

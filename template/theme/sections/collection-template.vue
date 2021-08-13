<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <fdk-infinite-scrolling @loadmore="loadMoreData()" :loadingData="loading">
      <h2
        class="section-heading"
        v-if="
          settings.props.heading &&
          settings.props.heading.value &&
          settings.props.heading.value.length > 0
        "
      >
        {{ settings.props.heading.value }}
      </h2>
      <template v-if="collections.length > 0">
        <div
          class="group-cards"
          :class="{
            'five-items': settings.props.item_count.value === 5,
            'three-items': settings.props.item_count.value === 3,
            'two-items': settings.props.item_count.value === 2,
          }"
        >
          <fdk-link
            :link="`/collection/${collection.slug}`"
            v-for="(collection, index) in collections"
            :key="index"
            class="item"
          >
            <div class="item__image">
              <nm-image
                class="cst-img"
                v-if="
                  collection &&
                  collection.banners &&
                  collection.banners.portrait &&
                  collection.banners.portrait.url
                "
                :src="collection.banners.portrait.url"
                @error="replaceByDefault"
                alt
              />
              <img v-else src="./../assets/images/placeholder.png" alt />
              <div class="overlay">&nbsp;</div>
            </div>

            <p class="item__name">{{ collection.name }}</p>
          </fdk-link>
        </div>
      </template>

      <div v-else-if="collections && collections.length === 0 && isMounted">
        <placeholder-items
          :count="10"
          type="collection-1"
          text="Collection"
          :layout="`grid`"
        />
      </div>
      <div class="loader-center" v-if="isLoading && isMounted">
        <img src="../assets/images/loader.gif" alt />
      </div>
    </fdk-infinite-scrolling>
  </div>
</template>
<settings>
{
  "name": "collectionTemplate",
  "label": "Collection List Page",
  
  "props": [
    {
      "type": "text",
      "id": "heading",
      "default": "Featured Collections",
      "label": "Collection Heading"
    },
    {
      "type": "range",
      "id": "item_count",
      "min": 2,
      "max": 5,
      "step": 1,
      "unit": "",
      "label": "Collections per row",
      "default": 4,
      "info": "Maximum items allowed per row"
    },
      {
      "type":"checkbox",
      "id":"full_width",
      "default": false,
      "label": "Full width",
      "info":"Check to allow items to take entire width of the viewport"
    }
  ]
}

</settings>
<script>
import emptystate from "./../templates/components/empty-state";
import loader from "./../templates/components/loader";
import nmImage from "./../global/components/common/nm-image.vue";
import placeholderImage from "./../assets/images/placeholder.png";
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";

export default {
  props: ["settings", "apiSDK", "serverProps"],
  components: {
    "empty-state": emptystate,
    "nm-image": nmImage,
    "namaste-loader": loader,
    "placeholder-items": placeholderItemsVue,
  },
  data() {
    return {
      collections: this.serverProps?.items || [],
      isLoading: false,
      isMounted: false,
      page: this.serverProps?.page || { current: 0, has_next: true },
    };
  },
  mounted() {
    this.isMounted = true;
    if (this.collections.length === 0) {
      this.fetchCollections();
    }
  },
  initializeServerProps({ settings, route, apiSDK }) {
    const params = Object.assign({}, route.params);
    params.pageNo = 1;
    params.pageSize = 12;
    params.tag = route.query.tag;
    return apiSDK.catalog.getCollections(params).then((res) => {
      return res;
    });
  },
  methods: {
    loadMoreData() {
      if (this.page && this.page.has_next) {
        this.fetchCollections();
      }
    },
    fetchCollections() {
      if (this.page && this.page.has_next && !this.isLoading) {
        this.isLoading = true;
        let params = {};
        if (this.$route && this.$route.params) {
          params = Object.assign({}, this.$route.params);
        }
        params.pageNo = this.page.current + 1;
        params.tag = this.$route?.query?.tag;
        this.$apiSDK.catalog
          .getCollections(params)
          .then((res) => {
            this.collections = [...this.collections, ...res.items];
            this.isLoading = false;
            this.isMounted = true;
            this.page = res.page;
          })
          .catch((err) => {
            this.isLoading = false;
            console.error(err);
          });
      }
    },
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
  },
};
</script>

<style lang="less" scoped>
.loader-center {
  display: flex;
  justify-content: center;
  margin: 20px 0px;
}
.item {
  position: relative;
  display: flex;
  align-items: center;
  &__image {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    min-height: 230px;
    @media @mobile {
      min-height: 185px;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 99.5%;
      background-color: black;
      opacity: 0.3;
      border-radius: 3px;
      &:hover {
        opacity: 0.7;
      }
    }
    .cst-img {
      width: 100%;
    }
    /deep/ .nm__img {
      width: 100%;
    }
  }
  &__name {
    top: 50%;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 20px;
    text-align: center;
    @media @mobile {
      font-size: 16px;
    }
  }
}
.group-cards {
  box-sizing: border-box;
  // margin-bottom: 20px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
  grid-auto-rows: auto;
  grid-gap: 1em;
  margin-bottom: 35px;
  @media only screen and (max-width: 801px) {
    grid-template-columns: repeat(auto-fill, minmax(25%, 1fr)) !important;
  }
  @media only screen and (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(32%, 1fr)) !important;
  }
}
.five-items {
  grid-template-columns: repeat(5, 1fr);
}
.three-items {
  grid-template-columns: repeat(3, 1fr);
}
.two-items {
  grid-template-columns: repeat(2, 1fr);
}
</style>

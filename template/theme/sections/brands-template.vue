<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <!-- <namaste-loader v-if="isLoading" /> -->
    <template>
      <fdk-brands-listing ref="infinite_brand">
        <template slot-scope="brandListing">
          <div>
            <fdk-infinite-scrolling
              @loadmore="loadMoreData(brandListing)"
              :loadingData="loading"
            >
              <template>
                <h2 class="section-heading">
                  {{
                    (settings.props.title && settings.props.title.value) ||
                    "Brands"
                  }}
                </h2>
                <div class="section__items" v-if="brands.length > 0">
                  <fdk-link
                    :link="`/products/?brand=${brand.slug}`"
                    v-for="(brand, index) in brands"
                    :key="index"
                    class="item"
                    :class="{
                      'item__two-item': settings.props.item_count.value === 2,
                      'item__three-item': settings.props.item_count.value === 3,
                      'item__four-item': settings.props.item_count.value === 4,
                      'item__five-item': settings.props.item_count.value === 5,
                    }"
                  >
                    <div class="item__image">
                      <nm-image
                        class="item__brand-image"
                        v-if="
                          brand &&
                          brand.banners &&
                          brand.banners.portrait &&
                          brand.banners.portrait.url
                        "
                        :src="brand.banners.portrait.url"
                        :alt="brand.name"
                      />
                      <div
                        class="overlay"
                        v-if="brand && brand.logo && brand.logo.url"
                      >
                        &nbsp;
                      </div>
                      <nm-image
                        class="item__logo"
                        :src="brand.logo.url"
                        :alt="brand.name"
                      />
                    </div>
                    <p class="item__name">{{ brand.name }}</p>
                  </fdk-link>
                </div>

                <div v-else-if="brands.length === 0 && !isLoading && isMounted">
                  <placeholder-items
                    :count="10"
                    type="collection-1"
                    text="Brand"
                    :layout="`grid`"
                  />
                </div>
                <div class="loader-center" v-if="page.has_next && isMounted">
                  <img src="../assets/images/loader.gif" alt />
                </div>
              </template>
            </fdk-infinite-scrolling>
          </div>
        </template>
      </fdk-brands-listing>
    </template>
  </div>
</template>
<settings>
{
  "name": "brandTemplate",
  "label": "Brands List Page",
  "props": [
    {
        "type": "text",
        "id": "title",
        "default": "Brands",
        "label": "Title"
    },
    {
      "type": "range",
      "id": "item_count",
      "min": 2,
      "max": 5,
      "step": 1,
      "unit": "",
      "label": "Items per row",
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
import loader from "./../templates/components/loader";
import emptystate from "./../templates/components/empty-state";
import placeholderImage from "./../assets/images/placeholder.png";
import nmImage from "./../global/components/common/nm-image.vue";
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";

export default {
  props: ["settings", "apiSDK", "serverProps"],
  components: {
    "namaste-loader": loader,
    "empty-state": emptystate,
    "nm-image": nmImage,
    "placeholder-items": placeholderItemsVue,
  },
  data() {
    return {
      brands: this.serverProps?.items || [],
      isLoading: false,
      isMounted: false,
      page: this.serverProps?.page || { current: 0, has_next: true },
    };
  },
  initializeServerProps({ apiSDK, route }) {
    return apiSDK.catalog
      .getBrands({
        department: "",
        pageNo: 1,
      })
      .then((res) => res);
  },
  mounted() {
    this.isMounted = true;
    if (this.brands.length === 0) {
      this.fetchBrands();
    }
  },
  methods: {
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
    loadMoreData() {
      this.fetchBrands();
    },
    fetchBrands() {
      if (this.page && this.page.has_next && !this.isLoading) {
        this.isLoading = true;
        return this.$apiSDK.catalog
          .getBrands({
            department: "",
            pageNo: this.page.current + 1,
          })
          .then((data) => {
            this.brands = [...this.brands, ...data.items];
            this.page = data.page;
            this.isLoading = false;
            this.isMounted = true;
          });
      }
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
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  &__image {
    position: relative;
    min-height: 250px;
    display: flex;
    align-items: center;
    height: 100%;
    @media @mobile {
      min-height: 230px;
    }
  }
  &__brand-image {
    /deep/ .nm__img {
      width: 100%;
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC");
    }
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 99.5%;
    background-color: black;
    opacity: 0.3;
    &:hover {
      opacity: 0.7;
    }
  }
  &__logo {
    /deep/ .nm__img {
      top: 70%;
      position: absolute;
      width: 50px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  &__name {
    font-size: 20px;
    margin-top: 10px;
    text-align: center;
    @media @mobile {
      font-size: 16px;
    }
  }
}
@media @mobile {
  /deep/ .section__items .item {
    width: 47% !important;
    margin-bottom: 20px;

    &:not(:nth-child(2n + 0)) {
      margin-right: 19px !important;
    }
  }
}
</style>

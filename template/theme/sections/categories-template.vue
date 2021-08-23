<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <h2 class="section-heading">
      {{ (settings.props.title && settings.props.title.value) || "Categories" }}
    </h2>
    <div
      class="group-cards category-items"
      :class="{
        'five-items': settings.props.item_count.value === 5,
        'three-items': settings.props.item_count.value === 3,
        'two-items': settings.props.item_count.value === 2,
      }"
      v-if="categories.length > 0"
    >
      <fdk-link
        :link="`/products/?category=${category.slug}`"
        v-for="(category, index) in getCategories"
        :key="index"
        class="item"
      >
        <div class="item__image">
          <nm-image
            class="cst-img"
            v-if="
              category &&
              category.banners &&
              category.banners.portrait &&
              category.banners.portrait.url
            "
            :src="category.banners.portrait.url"
            :alt="category.name"
            :sources="[{ width: 275 }]"
          />
          <div class="overlay">&nbsp;</div>
        </div>

        <p class="item__name">{{ category.name }}</p>
      </fdk-link>
    </div>
    <div v-else-if="categories.length === 0 && !isLoading">
      <placeholder-items
        :count="10"
        type="collection-2"
        text="Category"
        :layout="`grid`"
      />
    </div>
  </div>
</template>
<settings>
{
  "name": "categoriesTemplate",
  "label": "Categories Page",
  
  "props": [

   {
        "type": "text",
        "id": "title",
        "default": "Categories",
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
import emptystate from "./../templates/components/empty-state";
import loader from "./../templates/components/loader";
import placeholderImage from "./../assets/images/placeholder.png";
import nmImage from "./../global/components/common/nm-image.vue";
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";
import uniqBy from "lodash/uniqBy";

export default {
  props: ["settings", "apiSDK", "serverProps"],
  components: {
    "empty-state": emptystate,
    "namaste-loader": loader,
    "nm-image": nmImage,
    "placeholder-items": placeholderItemsVue,
  },
  data() {
    return {
      categories: this.serverProps || [],
      isLoading: false,
    };
  },
  computed: {
    getCategories() {
      return uniqBy(this.categories, (e) => {
        return e.uid;
      });
    },
  },
  initializeServerProps({ apiSDK, settings, route }) {
    const params = Object.assign({}, route.params);
    return apiSDK.catalog.getCategories(params).then((data) => {
      const raw_data = data.data;
      let categories = [];
      Object.keys(raw_data).forEach((slug) => {
        let categoryData = raw_data[slug].items;
        let firstChilds = [];
        categoryData.forEach((item) => {
          firstChilds = [...firstChilds, ...item.childs];
        });
        let secondChilds = [];
        firstChilds.forEach((item) => {
          secondChilds = [...secondChilds, ...item.childs];
        });
        categories = [...categories, ...secondChilds];
      });
      return categories;
    });
  },
  mounted() {
    if (this.categories.length === 0) {
      this.fetchCategories();
    }
  },
  methods: {
    fetchCategories() {
      this.isLoading = true;
      const params = Object.assign({}, this.$route.params);
      this.$apiSDK.catalog.getCategories(params).then((data) => {
        let raw_data = data.data;
        Object.keys(raw_data).forEach((slug) => {
          let categoryData = raw_data[slug].items;
          let firstChilds = [];
          categoryData.forEach((item) => {
            firstChilds = [...firstChilds, ...item.childs];
          });
          let secondChilds = [];
          firstChilds.forEach((item) => {
            secondChilds = [...secondChilds, ...item.childs];
          });
          this.categories = [...this.categories, ...secondChilds];
          this.isLoading = false;
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.category-items {
  .item {
    position: relative;
    display: flex;
    align-items: center;
    &__image {
      position: relative;
      width: 100%;
      height: auto;
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
      width: 100%;
      text-align: center;
      @media @mobile {
        font-size: 16px;
      }
    }
  }
}
.group-cards {
  box-sizing: border-box;
  // margin-bottom: 20px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

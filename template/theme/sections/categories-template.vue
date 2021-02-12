<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <namaste-loader v-if="isLoading" />
    <template v-else>
      <template v-if="this.categories.length > 0">
        <h2 class="section-heading">Categories</h2>
        <div class="section__items category-items">
          <fdk-link
            :link="`/products/?category=${category.slug}`"
            v-for="(category, index) in categories"
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
              <img
                v-if="category && category.image"
                :src="category.image.url"
                alt=""
              />
              <div class="overlay">&nbsp;</div>
            </div>

            <p class="item__name">
              {{ category.name }}
            </p>
          </fdk-link>
        </div>
      </template>
      <empty-state v-else title="No categories found" />
      >
    </template>
  </div>
</template>
<settings>
{
  "name": "categoriesTemplate",
  "label": "Category List Page",
  
  "props": [
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
import emptystate from './../templates/components/empty-state';
import loader from './../templates/components/loader';

export default {
  props: ['settings', 'provider'],
  components: {
    'empty-state': emptystate,
    'namaste-loader': loader,
  },
  data() {
    return {
      categories: [],
      isLoading: false,
    };
  },
  watch: {
    settings: function(newVal, oldVal) {},
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    fetchCategories() {
      this.isLoading = true;
      const params = Object.assign({}, this.$route.params);
      this.provider.Categories.fetchCategories(params).then(({ data }) => {
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
        });
        this.isLoading = false;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.category-items {
  min-height: 1000px;
  .item {
    img {
      width: 100%;
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
    &__name {
      top: 50%;
      font-family: roboto condensed, sans-serif;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 20px;
      width: 100%;
      text-align: center;
    }
  }
}
</style>

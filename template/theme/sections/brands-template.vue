<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <namaste-loader v-if="isLoading" />
    <template v-else>
      <template v-if="brands.length > 0">
        <h2 class="section-heading">Brands</h2>
        <div class="section__items">
          <fdk-link
            :link="`/products/?brand=${brand.uid}`"
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
              <img
                class="item__brand-image"
                v-if="brand && brand.image"
                :src="brand.image.url"
                alt
              />
              <div class="overlay" v-if="brand && brand.logo">&nbsp;</div>
              <img class="item__logo" :src="brand.logo.url" alt />
            </div>
            <p class="item__name">{{ brand.name }}</p>
          </fdk-link>
        </div>
      </template>
      <empty-state v-else title="No brands found" />
    </template>
  </div>
</template>
<settings>
{
  "name": "brandTemplate",
  "label": "Brands List Page",
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
import loader from './../templates/components/loader';
import emptystate from './../templates/components/empty-state';
export default {
  props: ['settings', 'provider'],
  components: {
    'namaste-loader': loader,
    'empty-state': emptystate,
  },
  data() {
    return {
      brands: [],
      isLoading: false,
    };
  },
  watch: {
    settings: function(newVal, oldVal) {},
  },
  mounted() {
    this.isLoading = true;
    this.provider.Brand.fetchBrands({
      department: '',
      image_size: 'large',
    }).then(({ data }) => {
      this.brands = data.data;
      this.isLoading = false;
    });
  },
};
</script>

<style lang="less" scoped>
.item {
  &__image {
    position: relative;
  }
  &__brand-image {
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
  &__logo {
    top: 70%;
    position: absolute;
    width: 50px;
    left: 50%;
    transform: translateX(-50%);
  }
  &__name {
    font-size: 20px;
    margin-top: 10px;
    font-weight: 700;
  }
}
</style>

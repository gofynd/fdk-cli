<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <namaste-loader v-if="isLoading" />
    <template v-else>
      <template v-if="collections.length > 0">
        <h2
          class="section-heading"
          v-if="settings.props.heading.value.length > 0"
        >
          {{ settings.props.heading.value }}
        </h2>
        <div class="section__items">
          <fdk-link
            :link="`/collection/${collection.slug}`"
            v-for="(collection, index) in collections"
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
                v-if="collection && collection.banners"
                :src="collection.banners.portrait.url"
                alt=""
              />
              <div class="overlay">&nbsp;</div>
            </div>

            <p class="item__name">
              {{ collection.name }}
            </p>
          </fdk-link>
        </div>
      </template>
      <empty-state v-else title="No collections found" />
    </template>
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
      collections: [],
      isLoading: false,
    };
  },
  watch: {
    settings: function(newVal, oldVal) {},
  },
  mounted() {
    this.fetchCollections();
  },
  methods: {
    fetchCollections() {
      this.isLoading = true;
      const params = Object.assign({}, this.$route.params);
      params.page = 1;
      params.page_size = 12;
      params.tag = this.$route.query.tag;
      this.provider.Collections.fetchCollections(params).then(({ data }) => {
        this.collections = data.data || [];
        this.isLoading = false;
      });
    },
  },
};
</script>

<style lang="less" scoped>
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
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 20px;
    // font-weight: 600;
  }
}
</style>

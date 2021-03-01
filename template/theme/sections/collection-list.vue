<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <h2
      class="section-heading"
      v-if="settings.props.heading.value.length > 0"
    >{{ settings.props.heading.value }}</h2>
    <div class="section__items" v-if="collections.length">
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
            v-if="
              collection.banners
            "
            :src="collection.banners.portrait.url"
            alt
          />
          <div class="overlay">&nbsp;</div>
        </div>

        <p class="item__name">{{ collection.name }}</p>
      </fdk-link>
    </div>
  </div>
</template>
<settings>
{
    "name":"collectionList",
    "label":"Collection List",
    "blocks":[
        {
            "type":"collection",
            "name":"Collection",
            "props": [
              {
                 "type":"collection",
                "id":"collection",
                "label":"Select a collection"
              }
               
            ]
        }
    ],
    "props":[
        {
            "type": "text",
            "id": "heading",
            "default": "Collection List",
            "label": "Collection Heading",
            "info":"Collection Heading"
        },
        {
            "type": "range",
            "id": "item_count",
            "min": 2,
            "max": 5,
            "step": 1,
            "unit": "",
            "label": "Collections per row",
            "default": 2,
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
export default {
  props: ["settings", "provider"],
  mounted() {
    this.settings = this.settings || {};
    this.settings.blocks = this.settings.blocks || [];
    let collections = this.settings.blocks.map(b => {
      b.props = b.props || {};
      b.props.collection = b.props.collection || {};
      return b.props.collection.value;
    });
    Promise.all(collections.map(this.getCollectionMeta))
      .then(results => {
        this.collections = results;
      })
      .catch(e => console.log);
  },
  data() {
    return {
      collections: []
    };
  },
  methods: {
    getCollectionMeta(slug) {
      return this.provider.ProductListing.fetchCollectionListingMetaInfo({
        slug
      }).then(res => {
        res.data = res.data || {};
        res.data.data = res.data.data || [];
        return res.data.data[0] || {};
      });
    }
  }
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
    width: 100%;
    text-align: center;
  }
}
</style>

<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <h2
      class="section-heading"
      v-if="
        settings &&
        settings.props &&
        settings.props.heading &&
        settings.props.heading.value &&
        settings.props.heading.value.length > 0
      "
    >
      {{ settings.props.heading.value }}
    </h2>
    <div class="section__items" v-if="collections.length > 0">
      <div
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
        <fdk-link :link="`/collection/${collection.slug}`" v-if="collection">
          <div class="item__image">
            <nm-image
              v-if="collection.banners"
              :src="collection.banners.portrait.url"
              :alt="collection.name"
            />
            <div class="overlay">&nbsp;</div>
          </div>
        </fdk-link>
        <div v-else>
          <div class="overlay">&nbsp;</div>

          <fdk-placeholder type="collection-1" />
        </div>
        <p class="item__name" v-if="collection">{{ collection.name }}</p>
        <p class="item__name" v-else>Collection{{ index }}</p>
      </div>
    </div>
    <div v-else-if="collections.length === 0">
      <placeholder-items
        :count="4"
        type="collection-1"
        text="Collection"
        :layout="`grid`"
      />
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
    ],
    "preset":{
      "blocks":[
        {
          "name":"Collection"
        },
        {
          "name":"Collection"
        },
        {
          "name":"Collection"
        },
        {
          "name":"Collection"
        }
      ]
    }
}

</settings>
<script>
import nmImage from "./../global/components/common/nm-image.vue";
import placeholderItemsVue from "../global/components/sections/placeholder-items.vue";

export default {
  props: ["settings", "apiSDK", "serverProps"],
  components: {
    "placeholder-items": placeholderItemsVue,
    "nm-image": nmImage,
  },
  mounted() {
    if (this.collections.length == 0) {
      this.settings = this.settings || {};
      this.settings.blocks = this.settings.blocks || [];
      let collections = this.settings.blocks.map((b) => {
        b.props = b.props || {};
        b.props.collection = b.props.collection || {};
        return b.props.collection.value || "";
      });
      Promise.all(collections.map(this.getCollectionMeta))
        .then((results) => {
          this.collections = results;
        })
        .catch((e) => console.log);
    }
  },
  data() {
    return {
      collections: this.serverProps || [],
    };
  },
  initializeServerProps({ apiSDK, settings }) {
    const collections =
      settings?.blocks?.map((b) => {
        const slug = b?.props?.collection?.value || "";
        return apiSDK.catalog
          .getCollectionDetailBySlug({
            slug: slug,
          })
          .then((res) => {
            return res || {};
          });
      }) || [];
    return Promise.all(collections);
  },
  methods: {
    getCollectionMeta(slug) {
      if (!slug) return;
      return this.$apiSDK.catalog
        .getCollectionDetailBySlug({
          slug: slug,
        })
        .then((res) => {
          return res || {};
        });
    },
  },
};
</script>

<style lang="less" scoped>
.item {
  display: flex;
  align-items: center;
  /deep/ .nm__img {
    width: 100%;
  }
  a {
    width: 100%;
  }
  &__image {
    height: 100%;
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

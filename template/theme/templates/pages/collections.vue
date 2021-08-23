<template>
  <div class="coll-cont">
    <sections page="collections" />
  </div>
</template>
<style scoped></style>
<script>
import featuredBanner from '../../global/components/sections/featured-banner';
import chunk from 'lodash/chunk';

export default {
  data() {
    return {
      featuredMeta: {
        featuredItems: [],
        title: 'Collections',
      },
    };
  },
  methods: {
  
  },
  components: {
    'featured-banner': featuredBanner,
  },
  watch: {
    context: function(newValue) {
      let items = newValue.collections.data;
      if (!items || !items.length) {
        return;
      }
      let featuredItems = [];
      featuredItems = items.map((entry) => {
        return {
          title: entry.name,
          url: entry.url,
          image: entry.banners.portrait.url,
        };
      });
      this.featuredMeta.featuredItems = chunk(featuredItems, 2);
    },
  },
};
</script>

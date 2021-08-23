<template>
  <div class="coll-cont">
    <sections page="brands" />
    <!-- <div v-for="(chunks, index) in featuredMeta.featuredItems" :key="'feat-item-chunk'+index">
      <featured-banner :featuredItems="chunks" :title="''" class="slot-margin"></featured-banner>
    </div> -->
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
      let items = newValue.brands.items;
      if (!items || !items.length) {
        return;
      }
      let featuredItems = [];
      featuredItems = items.map((entry) => {
        return {
          title: entry.name,
          url: '/products/?brand=' + entry.slug,
          image: entry.banners.portrait.url,
        };
      });
      this.featuredMeta.featuredItems = chunk(featuredItems, 2);
    },
  },
};
</script>

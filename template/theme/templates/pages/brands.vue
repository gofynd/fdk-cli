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
import * as _ from 'lodash';

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
    genOptiUrl: function genOptiUrl(url, cloudinaryWidth) {
      cloudinaryWidth = cloudinaryWidth || 'w_600';
      var splt = url.split('/');
      var idx = splt.indexOf('upload');
      idx = idx + 1;
      splt.splice(idx, 0, cloudinaryWidth, 'q_auto');
      return splt.join('/');
    },
  },
  components: {
    'featured-banner': featuredBanner,
  },
  watch: {
    context: function(newValue) {
      console.log(newValue);
      let items = newValue.brands.data;
      if (!items || !items.length) {
        return;
      }
      let featuredItems = [];
      featuredItems = items.map((entry) => {
        return {
          title: entry.name,
          url: '/products/?brand=' + entry.slug,
          image: this.genOptiUrl(entry.image.secure_url),
        };
      });
      this.featuredMeta.featuredItems = _.chunk(featuredItems, 2);
    },
  },
};
</script>

<template>
  <div class="coll-cont">
    <sections page="collections" />
    <!-- <div
      v-for="(chunks, index) in featuredMeta.featuredItems"
      :key="'feat-item-chunk' + index"
    >
      <featured-banner
        :featuredItems="chunks"
        :title="''"
        class="slot-margin"
      ></featured-banner> -->
    <!-- </div> -->
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
      let items = newValue.collections.data;
      if (!items || !items.length) {
        return;
      }
      let featuredItems = [];
      featuredItems = items.map((entry) => {
        return {
          title: entry.name,
          url: entry.url,
          image: this.genOptiUrl(entry.banners.portrait.secure_url),
        };
      });
      this.featuredMeta.featuredItems = _.chunk(featuredItems, 2);
    },
  },
};
</script>

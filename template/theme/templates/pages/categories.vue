<template>
  <div class="coll-cont">
    <sections page="categories" />
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
        title: '',
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
    objectToQuerystring(obj) {
      return Object.keys(obj).reduce(function(str, key, i) {
        var delimiter, val;
        delimiter = i === 0 ? '?' : '&';
        key = encodeURIComponent(key);
        val = encodeURIComponent(obj[key]);
        return [str, delimiter, key, '=', val].join('');
      }, '');
    },
  },
  components: {
    'featured-banner': featuredBanner,
  },
  watch: {
    context: function(newValue) {
      console.log(newValue);
      let items = newValue.categories.items;
      if (!items || !items.length) {
        return;
      }
      let featuredItems = [];
      featuredItems = items.map((entry) => {
        return {
          title: entry.name,
          url: '/products/' + this.objectToQuerystring(entry.action.query),
          image: entry.image.secure_url,
        };
      });
      this.featuredMeta.featuredItems = _.chunk(featuredItems, 2);
    },
  },
};
</script>

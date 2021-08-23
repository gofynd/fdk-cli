<template>
  <div class="coll-cont">
    <sections page="categories" />
  </div>
</template>
<style scoped></style>
<script>
import featuredBanner from "../../global/components/sections/featured-banner";
import chunk from "lodash/chunk";

export default {
  data() {
    return {
      featuredMeta: {
        featuredItems: [],
        title: "",
      },
    };
  },
  methods: {
    objectToQuerystring(obj) {
      return Object.keys(obj).reduce(function (str, key, i) {
        var delimiter, val;
        delimiter = i === 0 ? "?" : "&";
        key = encodeURIComponent(key);
        val = encodeURIComponent(obj[key]);
        return [str, delimiter, key, "=", val].join("");
      }, "");
    },
  },
  components: {
    "featured-banner": featuredBanner,
  },
  watch: {
    context: function (newValue) {
      let items = newValue.categories.items;
      if (!items || !items.length) {
        return;
      }
      let featuredItems = [];
      featuredItems = items.map((entry) => {
        if (entry && entry.action && entry.action.query) {
          return {
            title: entry.name,
            url: "/products/" + this.objectToQuerystring(entry.action.query),
            image: entry.image.url,
          };
        }
      });
      this.featuredMeta.featuredItems = chunk(featuredItems, 2);
    },
  },
};
</script>

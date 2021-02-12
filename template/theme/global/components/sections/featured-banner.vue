<template>
  <div
    :class="{ 'one-banner': featuredItems.length === 1, 'two-banners': featuredItems.length === 2, 'three-banners': featuredItems.length === 3 } "
  >
    <h2 class="category-heading" style="text-align: center;" v-if="title">{{ title }}</h2>
    <div class="category" v-for="(item, index) in featuredItems" :key="'feat-item-' + index">
      <fdk-link :link="item.url">
        <img alt="Shop Now" class="category-image" :src="item.image" title="Shop Now" />
      </fdk-link>
      <h3 class="module-title">
        <fdk-link :link="item.url"> {{ item.title }}</fdk-link>
      </h3>
    </div>
  </div>
</template>
<style scoped>
h2, h3 {
  font-family: "roboto condensed",sans-serif;
  font-weight: 700;
}
.three-banners {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  display: flex;
}

@media (min-width: 768px) {
  .three-banners {
    max-width: 1330px;
    max-width: 83.125rem;
  }
}

.three-banners .category {
  -ms-flex: auto;
  flex: auto;
  box-sizing: border-box;
  padding: 15px;
  padding: 0.9375rem;
}

@media (min-width: 768px) {
  .three-banners .category {
    -ms-flex: 1;
    flex: 1;
    padding: 0;
    padding-right: 15px;
    padding-right: 0.9375rem;
  }

  .three-banners .category:nth-child(2) {
    padding-left: 15px;
    padding-left: 0.9375rem;
  }
}

.three-banners .category-wrapper {
  margin: 50px 0;
  margin: 3.125rem 0;
}

.three-banners .category-heading {
  box-sizing: border-box;
  text-transform: uppercase;
  width: 100%;
  margin: 0;
  font-size: 1.875rem;
  padding: 10px 15px;
  padding: 0.625rem 0.9375rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
}

@media (min-width: 768px) {
  .three-banners .category-heading {
    margin-bottom: 10px;
    margin-bottom: 0.625rem;
  }
}

@media (min-width: 992px) {
  .three-banners .category-heading {
    margin-bottom: 15px;
    margin-bottom: 0.9375rem;
  }
}

.three-banners .category-image {
  width: 100%;
  height: auto;
}

.three-banners .category .module-title {
  text-transform: uppercase;
}

.three-banners .category a {
  outline: none !important;
}

.two-banners {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .two-banners {
    max-width: 1330px;
    max-width: 83.125rem;
  }
}

.two-banners .category {
  -ms-flex: auto;
  flex: auto;
  box-sizing: border-box;
  padding: 15px;
  padding: 0.9375rem;
  margin-bottom: 25px;
  margin-bottom: 1.5625rem;
}

@media (min-width: 768px) {
  .two-banners .category {
    -ms-flex: 1;
    flex: 1;
    padding: 0;
    padding-right: 15px;
    padding-right: 0.9375rem;
  }

  .two-banners .category:nth-child(2) {
    padding-left: 15px;
    padding-left: 0.9375rem;
  }
}

.two-banners .category-wrapper {
  margin: 50px 0;
  margin: 3.125rem 0;
}

.two-banners .category-heading {
  box-sizing: border-box;
  text-transform: uppercase;
  width: 100%;
  font-size: 1.875rem;
  padding: 15px;
  padding: 0.9375rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
}

@media (min-width: 768px) {
  .two-banners .category-heading {
    text-align: center;
    margin: 0 0 20px;
    margin: 0 0 1.25rem;
  }
}

.two-banners .category-image {
  width: 100%;
  height: auto;
}

.two-banners .category .module-title {
  text-transform: uppercase;
  font-size: 1.125rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
  margin: 10px 0;
  margin: 0.625rem 0;
}

.two-banners .category a {
  outline: none;
}


.one-banner {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .one-banner {
    max-width: 1330px;
    max-width: 83.125rem;
  }
}

.one-banner .category {
  -ms-flex: auto;
  flex: auto;
  box-sizing: border-box;
  padding: 15px;
  padding: 0.9375rem;
  margin-bottom: 25px;
  margin-bottom: 1.5625rem;
}

@media (min-width: 768px) {
  .one-banner .category {
    -ms-flex: 1;
    flex: 1;
    padding: 0;
    padding-right: 15px;
    padding-right: 0.9375rem;
  }

  .one-banner .category:nth-child(2) {
    padding-left: 15px;
    padding-left: 0.9375rem;
  }
}

.one-banner .category-wrapper {
  margin: 50px 0;
  margin: 3.125rem 0;
}

.one-banner .category-heading {
  box-sizing: border-box;
  text-transform: uppercase;
  width: 100%;
  font-size: 1.875rem;
  padding: 15px;
  padding: 0.9375rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
}

@media (min-width: 768px) {
  .one-banner .category-heading {
    text-align: center;
    margin: 0 0 20px;
    margin: 0 0 1.25rem;
  }
}

.one-banner .category-image {
  width: 50%;
  height: auto;
}

.one-banner .category .module-title {
  text-transform: uppercase;
  font-size: 1.125rem;
  letter-spacing: 0.5px;
  letter-spacing: 0.03125rem;
  margin: 10px 0;
  margin: 0.625rem 0;
}

.one-banner .category a {
  outline: none;
}
</style>
<script>
/**
 * Component attributes
 * Can have 2 OR 3 items in featured view
 * featuredItems : [
          {
            title: "SHOP MEN",
            url: "/men",
            image:
              "https://hdn-1.fynd.com/media/pictures/tagged_items/540x0/1_BHTS6028@FADED_RED/1.jpg"
          },
          {
            title: "Shop Women",
            url: "/women",
            image:
              "https://hdn-1.fynd.com/media/pictures/tagged_items/540x0/2_AW15N179-TU-TG1@ORANGE/1.jpg"
          }
    ];
  title : "Test tile"
 */
export default {
  data() {
    return {};
  },
  props: {
    featuredItems: {
      type: Object
    },
    title: {
      type: String
    }
  }
};
</script>
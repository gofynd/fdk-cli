<template>
  <div class="card-item group-item-logo" :title="getTitle">
    <fdk-link :link="generateLink">
        <div class="logo-card">
          <section>
            <emerge-image :src="getCardLogo"
              class="imgClass" 
              :sources="[
                  {width: 200}
                ]"
              />
          </section>
          <h3 :style="`color: ${global_config.props.text_heading_link_color}`">{{ card.name }}</h3>
        </div>
    </fdk-link>
  </div>
</template>
<style lang="less" scoped>

.card-item {
  border: 0 !important;
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  min-height: 200px;

  a {
    text-decoration: none;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .logo-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    > section {
      max-width: 115px;
      display: flex;
    }
    h3 {
      height: 50px;
      max-width: 115px;
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
      text-align: center;
      color: @Black;
      line-height: 20px;
      font-size: 16px;
      margin: 18px 0 0 0;
      text-transform: capitalize;
      @media @mobile {
        font-size: 13px;
        height: 30px;
      }
    }
  }
}
</style>

<script>
import emergeImage from "../../global/components/common/emerge-image.vue";

export default {
  name: "groupItem",
  components: {
    "emerge-image": emergeImage,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
    cardtype: {
      type: String,
      enum: ["BRANDS", "CATEGORIES", "COLLECTIONS", "WISHLIST", "PRODUCT"],
    },
    global_config: {}
  },
  computed: {
    getTitle() {
      let title = this.card.name;
      if (this.card.product_name) {
        title += " " + this.card.product_name;
      }
      return title;
    },
    getCardLogo() {
      return this.card.logo?.url || null;
    },
    getImageURL() {
      let imageURL = this.card.medias
        ? this.card.medias.url
        : Array.isArray(this.card.medias)
        ? this.card.medias[0].url
        : "";
      if (this.cardtype === "COLLECTIONS" || this.cardtype === "BRANDS") {
        imageURL = this.card.banners.portrait.url;
      }
      return imageURL;
    },
    generateLink() {
      if (this.cardtype === "COLLECTIONS") {
        return "/collection/" + this.card.slug;
      }
      if (this.cardtype === "PRODUCT") {
        return "/product/" + this.card.slug;
      }
      if (this.cardtype === "BRANDS") {
        return "/products/?brand=" + this.card.slug;
      }
      return "/products/?" + this.card.action.url.split("?")[1];
    }
  },
};
</script>

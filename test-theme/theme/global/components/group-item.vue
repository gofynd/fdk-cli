<template>
  <div class="card-item group-item-box" :title="getTitle">
    <fdk-link :action="card.action">
      <div class="card-img" :class="{}" :data-cardtype="cardtype">
        <emerge-image :src="getImageURL"
          class="group-item-img"
          :sources="[
                    { breakpoint: { min: 768 }, width: 400 },                    
                    { breakpoint: { max: 767 }, width: 360 },
                  ]"
          />
      </div>
    </fdk-link>
    <div class="logo-wrapper" :data-cardtype="cardtype" :class="{ 'emerge-center' : cardtype ==='COLLECTIONS' || cardtype ==='CATEGORIES' }" 
        >
      <div class="card-logo " v-if="cardtype ==='BRANDS'">
        <emerge-image :src="getCardLogo" :sources="[{width: 30}]"/>
      </div>
      <div :class="['card-desc', cardtype ]">
          <h4 :style="`color: ${global_config.props.text_heading_link_color}`">{{ card.name }}</h4>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>

.card-item {
  border: 0 !important;
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  height: auto;
  overflow: hidden;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  @media @mobile {
    margin-bottom: 0;
  }

  a {
    text-decoration: none;
    min-height: 255px;
    height: 100%;
    display: flex;
    flex-direction: column;
    max-height: @card-type-a-max-height;
    @media @tablet {
      max-height: @card-type-a-max-height-tablet;
    }
    @media @mobile {
      max-height: @card-type-a-max-height-mobile
    }
  }
  .card-img {
    // height: 420px;
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: auto;
    overflow: hidden;
    background: @color-white;
    justify-content: center;
    align-items: center;
    flex: 1;
    max-height: @card-type-a-max-height;
    &[data-cardtype="COLLECTIONS"] {
      max-height: 94.5%;
    }
    &[data-cardtype="CATEGORIES"] {
      @media @mobile {
        max-height: @card-type-a-max-height-mobile;
      }
    }
    @media @tablet {
      max-height: @card-type-a-max-height-tablet;
    }
    @media @mobile {
      max-height: @card-type-a-max-height-mobile;
    }
  }
  
  .logo-wrapper {
    height: 28%;
    display: flex;
    width: 100%;
    color: @Black;
    background: #f5f5f5;
    box-sizing: border-box;
    padding:0 10px;
    align-items: center;
    @media @tablet {
      height: 38%;
      padding: 10px 0;
    }

    &[data-cardtype="COLLECTIONS"] {
      height: 84px;
      align-items: flex-start;
      @media @mobile {
        height: 19%;
        padding: 0 10px;
      }
    }
    .card-logo {
      // bottom: 30px;
      width: 30px;
      height: 30px;
      margin-top: 30px;
      @media @tablet {
        margin-top: 0px;
      }
      img {
        width: 30px;
        @media @mobile {
          width: 30px;
          margin-left: 8px;
        }
      }
    }
    .card-desc {
      font-size: 20px;
      font-weight: 400;
      padding: 0 10px;
      display: flex;
      align-items: center;
      margin-top: 30px;
      line-height: 30px;
      &.BRANDS {
        @media @tablet {
          font-size: 14px;
          padding: 10px 10px;
          line-height: 21px;
          justify-content: center;
          margin-top: 0px;
        }
      }
      &.CATEGORIES {
        align-items: flex-start;
        height: 54px;
      }
      @media @tablet {
        font-size: 16px;
      }
      @media @mobile {
        margin-top: 16px;
      }
        h4 {
          text-transform: capitalize;
          width: auto;
          display: block;
          text-align: left;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
    }
    &.emerge-center {
      background: transparent;
      justify-content: center;
      
      .card-desc {
        width: 100%;
        display: flex;
        justify-content: center;
        font-size: 20px;
        @media @tablet {
          font-size: 16px;
        }
        h4 { 
        }
      }
    }
  }

}
</style>

<script>
import placeholderImage from "./../../assets/images/placeholder.png";
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
     
     if (this.cardtype === "COLLECTIONS") {
        imageURL = this.card.banners.portrait.url;
      }
      if (this.cardtype === "BRANDS" && this.card.banners) {
        imageURL = this.card.banners.portrait.url;
      }
      if (this.cardtype === "CATEGORIES" && this.card.banners) {
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
      return "/products/?" + this.card.slug;
    }
  },
  methods: {
    getProductPrice(key) {
      if (this.card.price) {
        return this.card.price[key].min !== this.card.price[key].max
          ?  this.$options.filters.currencyformat(this.card.price[key].min) + " - " +  this.$options.filters.currencyformat(this.card.price[key].max)
          :  this.$options.filters.currencyformat(this.card.price[key].min);
      }
      return "";
    },
    generateQuery() {
      let strQuery = "";
      for (let key in this.card.action.query) {
        for (let i = 0; i < this.card.action.query[key].length; i++) {
          strQuery += key + "=" + this.card.action.query[key][i] + "&";
        }
      }
      return strQuery;
    },
    validateCardType() {
      return (
        this.cardtype !== "BRANDS" &&
        this.cardtype !== "COLLECTIONS" &&
        this.cardtype !== "CATEGORIES"
      );
    },
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
  },
};
</script>

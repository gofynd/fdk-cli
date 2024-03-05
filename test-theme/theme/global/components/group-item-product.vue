<template>
  <div class="card-item group-item-product-box" :title="getTitle">
    <fdk-link :link="generateLink">
      <div class="card-img" :class="{}" :data-cardtype="cardtype">
        <emerge-image
          :src="getImageURL"
          class="group-item-img"
          :sources="[{ width: 360 }]"
        />
      </div>
      <div class="details-wrapper">
        <div class="details">
          <div
            class="title"
            :style="`color: ${global_config.props.text_heading_link_color}`"
            :title="card.name"
          >
            {{ card.name }}
          </div>
          <div class="price">
            <span
              v-if="card.price && card.price.effective"
              :style="
                hasDiscount(card)
                  ? 'color:' + global_config.props.text_sale_price_color
                  : 'color:' + global_config.props.text_price_color
              "
            >
              {{ getPrice(card, "effective") }}
            </span>
            <span
              v-if="hasDiscount(card)"
              class="price-marked strikethrough"
              :style="
                'color:' + global_config.props.text_strikethrough_price_color
              "
            >
              {{ card.price.marked.currency_symbol }}
              {{ card.price.marked.max }}
            </span>
            <span
              class="product-total-discount"
              v-if="hasDiscount(card)"
              :style="'color:' + global_config.props.text_discount_color"
            >
              <span class="">{{ card.discount }}</span>
            </span>
             <div
          class="item-selection"
          v-if="validateCardType()"
        >
          <favourite :item="card" :cardType="cardtype"></favourite>
        </div>
          </div>
        </div>
      </div>
    </fdk-link>
  </div>
</template>
<style lang="less" scoped>
.card-item {
  border: 0 !important;
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  min-height: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  a {
    text-decoration: none;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  @media @tablet {
    min-height: 100px;
    // height: 200px;
  }
  .card-img {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    justify-content: center;
  }
   .item-selection {
      position: absolute;
      top: 10px;
      left: 10px;
    }
  .details-wrapper {
    height: 90px;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    align-items: flex-start;
    justify-content: center;
    padding: 10px 0;
    @media @tablet {
      // height: 30%;
      padding: 5px;
    }
    .details {
      display: flex;
      justify-content: center;
      flex-direction: column;
      overflow: hidden;
      @media @tablet {
        padding: 5px;
      }
      .title {
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        @media @tablet {
          white-space: normal;
          overflow: unset;
          text-overflow: unset;
          // font-size: 11px;
        }
      }
      .price {
        font-size: 14px;
        // color: #999;
        display: flex;
        justify-content: center;
        margin-top: 5px;
        letter-spacing: 2px;
        flex-wrap: wrap;
        // height: 60px;
        @media @tablet {
          font-size: 11px;
        }
        > span {
          display: inline-block;
          padding-right: 10px;
        }
        .product-total-discount {
          color: #ee478d;
        }
        .strikethrough {
          text-decoration: line-through;
        }
        .price-marked {
          font-weight: 600;
          color: #c33;
        }
      }
    }
  }
}
</style>

<script>
import Favourite from "./../../global/components/favourite.vue";
import Rating from "./../../global/components/fy-rating.vue";
import placeholderImage from "./../../assets/images/placeholder.png";
import emergeImage from "../../global/components/common/emerge-image.vue";
import { getPriceText, hasDiscount } from "../../helper/utils";

export default {
  name: "groupItem",
  components: {
    favourite: Favourite,
    rating: Rating,
    "emerge-image": emergeImage,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
    listing_price_config:{},
    global_config: {},
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
      let imageURL = this.card.image
        ? this.card.image.url
        : Array.isArray(this.card.medias)
        ? this.card.medias[0].url
        : "";
         if (this.cardtype === "COLLECTIONS" || this.cardtype === "BRANDS") {
        imageURL = this.card.banners.portrait.url;
      }
      return imageURL;
    },
    generateLink() {
      return "/product/" + this.card.slug;
    },
  },
  methods: {
    getPrice(product, key) {
      return getPriceText(product, key, this.$options, this.listing_price_config);
    },
    hasDiscount,
    generateQuery() {
      let strQuery = "";
      for (let key in this.card.action.query) {
        for (let i = 0; i < this.card.action.query[key].length; i++) {
          strQuery += key + "=" + this.card.action.query[key][i] + "&";
        }
      }
      return strQuery;
    },
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
    validateCardType() {
      return (
        this.cardtype !== "BRANDS" &&
        this.cardtype !== "COLLECTIONS" &&
        this.cardtype !== "CATEGORIES"
      );
    },
  },
};
</script>

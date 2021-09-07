<template>
  <div
    :style="global_config ? 'color:' + global_config.props.text_body_color : ''"
  >
    <fdk-add-review :product_type="product_type" :product_uid="product_uid">
      <template slot-scope="addReview">
        <div
          class="add-review coll-cont"
          v-if="context && context.product_data"
        >
          <div class="add-review__header">
            <div
              class="add-review__header__text"
              :title="context.product_data.name"
            >
              {{ context.product_data.name }}
            </div>
            <fdk-link
              :link="'/product/' + context.product_data.slug"
              target="_blank"
              :title="context.product_data.name"
              tabindex="0"
              itemprop="url"
            >
              <div class="add-review__header__product">
                <div class="product-detail">
                  <!-- <div class="product-name">
                    {{ context.product_data.name }}
                  </div> -->
                  <div
                    v-if="context.product_data.rating"
                    class="product-rating"
                  >
                    <rating-star :stars="context.product_data.rating" />
                    ({{ context.product_data.rating_count }})
                  </div>
                </div>
                <div class="product-image">
                  <img
                    class="tile-image"
                    v-bind:src="getImageURL"
                    :alt="context.product_data.name"
                    :title="context.product_data.name"
                    @error="replaceByDefault"
                  />
                </div>
              </div>
            </fdk-link>
          </div>
          <div class="add-review__body" v-if="!addReview.is_eligible">
            <div class="add-review__body__rating">
              <div class="add-review__body__rating__text">
                Rate this product
              </div>
              <div class="add-review__body__rating__star">
                <star-rating
                  :star-size="20"
                  v-model="rating.value"
                  :show-rating="false"
                ></star-rating>
                <p class="show-error" v-if="!rating.value && rating.showerror">
                  {{ rating.errortext }}
                </p>
              </div>
            </div>
            <div class="add-review__body__review">
              <div class="add-review__body__review__text">
                Review this product
              </div>
              <div class="add-review__body__review__form">
                <textarea
                  placeholder="Description*"
                  v-model="review_desc.value"
                ></textarea>
                <p
                  class="show-error"
                  v-if="!review_desc.value && review_desc.showerror"
                >
                  {{ review_desc.errortext }}
                </p>
                <input
                  type="text"
                  placeholder="Title (Optional)"
                  v-model="review_title.value"
                />
              </div>
            </div>
            <div class="add-review__body__footer">
              <namaste-button
                class="submit-button"
                @click="submitReview(addReview)"
                :type="'secondary'"
              >
                Submit
              </namaste-button>
            </div>
          </div>
          <div class="not-eligible" v-else>
            <fdk-empty-state :title="'Sorry! You cannot review this product'" />
          </div>
          <toast :id="'toast-message'" :content="toast_message"></toast>
        </div>
      </template>
    </fdk-add-review>
  </div>
</template>

<script>
import button from "./../../global/components/common/button";
import placeholderImage from "../../assets/images/placeholder-w312.png";
import ratingstar from "./../../global/components/reviews/rating-star";
import StarRating from "vue-star-rating";
import toast from "./../../global/components/toast.vue";

export default {
  name: "add-product-review",
  props: ["context"],
  components: {
    "namaste-button": button,
    "rating-star": ratingstar,
    toast,
    StarRating,
  },
  data() {
    return {
      review_desc: this.getIntialValue(""),
      review_title: this.getIntialValue(""),
      rating: this.getIntialValue(0),
      toast_message: "",
      imageFullyLoaded: false,
      imageLoading: false,
      product_type: this.$route.query.type,
      product_uid: this.$route.query.uid,
    };
  },
  computed: {
    getImageURL() {
      let imageURL =
        this.context &&
        this.context.product_data &&
        this.context.product_data.medias
          ? this.context.product_data.medias[0].url
          : "";
      if (this.imageFullyLoaded) {
        return imageURL;
      }
      if (imageURL && !this.imageLoading) {
        let img = new Image();
        img.src = imageURL;
        img.onload = this.imageLoaded.bind(this);
        this.imageLoading = true;
      }
      return placeholderImage;
    },
  },
  
  methods: {
    imageLoaded(event) {
      this.imageFullyLoaded = true;
    },
    getIntialValue(value) {
      return {
        value,
        showerror: false,
        errortext: "",
      };
    },
    replaceByDefault(e) {
      e.target.src = placeholderImage;
    },
    submitReview(add) {
      const obj = this.getFormData();
      if (!this.validateForm()) {
        return;
      }
      add
        .addReviewData(obj)
        .then((res) => {
          if (res.success) {
            this.showToast("Review Submitted Successfully");
            setTimeout(() => {
              this.$router.push("/product/" + this.context.product_data.slug);
            }, 200);
          }
        })
        .catch((err) => {
        });
    },
    getFormData() {
      const obj = {
        entity_name: this.context.product_data.name,
        entity_id: this.$route.query.uid.toString(),
        entity_type: this.$route.query.type,
        // template_id: this.context.ratingsummary.data[0].id,
        rating: this.rating.value,
        is_active: false,
        video_meta: [],
        image_meta: [],
        title: this.review_title.value,
        description: this.review_desc.value,
      };
      return obj;
    },
    validateForm() {
      let formValid = true;
      formValid = this.checkEmpty("review_desc") && formValid;
      if (!this.rating.value) {
        this.rating.showerror = true;
        this.rating.errortext = "Rating is required";
      }
      formValid = this.rating.value && formValid;
      return formValid;
    },
    checkEmpty(key) {
      const emptyErorrs = {
        review_desc: "Description is required",
      };
      if (this[key].value.trim() === "") {
        this[key].showerror = true;
        this[key].errortext = emptyErorrs[key] || "Enter " + key;
        return false;
      }
      this[key].showerror = false;
      return true;
    },
    showToast: function(message) {
      if (message) {
        this.toast_message = message;
      }
      var x = document.getElementById("toast-message");
      x.className = "toast show";
      setTimeout(function() {
        x.className = x.className.replace("toast show", "toast hide");
      }, 3000);
    },
  },
};
</script>

<style lang="less" scoped>
.add-review {
  margin-top: 20px;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    height: 60px;
    border: 1px solid @Iron;
    border-radius: 4px;
    &__text {
      font-size: 22px;
      color: @Mako;
      font-weight: bold;
      width: 50%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &__product {
      // color: @Mako;
      display: flex;
      align-items: center;
      cursor: pointer;
      .product-detail {
        .product-name {
          margin-bottom: 6px;
        }
        .product-rating {
          text-align: center;
        }
      }
      .product-image {
        width: 40px;
        height: 60px;
        margin-left: 12px;
        img {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
  &__body {
    margin-top: 12px;
    border: 1px solid @Iron;
    border-radius: 4px;
    padding: 12px;
    &__rating {
      display: flex;
      justify-content: space-between;
      align-items: center;
      //   border: 1px solid @Iron;
      padding: 16px;
      &__text {
        font-size: 18px;
        color: @Mako;
        font-weight: bold;
      }
    }
    &__review {
      margin-top: 12px;
      padding: 16px;
      &__text {
        font-size: 18px;
        color: @Mako;
        font-weight: bold;
      }
      &__form {
        margin-top: 24px;
        textarea {
          resize: none;
          height: 90px;
          width: calc(100% - 24px);
          padding: 12px;
          border: 1px solid @Iron;
          border-radius: 4px;
        }
        input {
          height: 30px;
          width: calc(100% - 12px);
          padding: 6px;
          border: 1px solid @Iron;
          border-radius: 4px;
          margin-top: 12px;
        }
      }
    }
    &__footer {
      margin: 24px 16px 0 0;
      text-align: right;
      .submit-button {
        //   color: @Mako;
        width: 200px;
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 2px;
      }
    }
  }
  .show-error {
    color: @rd-red;
    font-size: 12px;
    margin-top: 4px;
  }
}
</style>

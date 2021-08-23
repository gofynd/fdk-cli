<template>
  <div class="container">
    <template v-if="brands_data && brands_data.length > 0">
      <div class="head-div">
        <div class="section-heading">{{ settings.props.title.value }}</div>
        <!-- <fdk-link
          :link="'/brands/'"
          class="ukt-links bold-sm"
          v-if="brands_data.length > 0 && settings.props.view_more.value"
          >View All</fdk-link
        > -->
      </div>
      <div class="group-cards">
        <fdk-link
          :link="`/products/?brand=${brand.slug}`"
          v-for="(brand, index) in brands_data"
          :key="index"
          class="item"
        >
          <div class="item__image">
            <nm-image
              class="item__brand-image"
              v-if="
                brand &&
                brand.banners &&
                brand.banners.portrait &&
                brand.banners.portrait.url
              "
              :src="brand.banners.portrait.url"
              :alt="brand.name"
            />
            <div class="overlay" v-if="brand && brand.logo && brand.logo.url">
              &nbsp;
            </div>
            <nm-image
              class="item__logo"
              :src="brand.logo.url"
              :alt="brand.name"
            />
          </div>
          <p class="item__name">{{ brand.name }}</p>
        </fdk-link>
      </div>
    </template>
  </div>
</template>
<settings>
{
    "name":"brands-listing",
    "label":"Brands Listing",
    "props":[
        {
            "type": "text",
            "id": "title",
            "default": "Brands",
            "label": "Title"
        },
        {
          "type":"header",
           "id": "header",
          "value":"Choose Brands to Show"
        },
        {
          "type":"radio",
          "id": "brand_type",
          "default":"all",
          "options": [
            {
              "value": "all",
              "text": "All"
            },
             {
              "value": "department",
              "text": "Department"
            },
            {
              "value": "handpicked",
              "text": "Handpicked"
            }
          ]
        },
        {
          "type":"department",
          "id":"department",
          "label": "Department",
          "info":"Select a department of brands",
          "note":"Department only applies if 'department' type is selected"
        },
        {
          "type": "range",
          "id": "item_count",
          "min": 2,
          "max": 15,
          "step": 1,
          "unit": "",
          "label": "Brand Items",
          "default": 4,
          "info": "Maximum Brand Items to show"
        },
       {
        "type": "checkbox",
        "id": "view_more",
        "default": false,
        "label": "View More Brands"
      }
    ],
     "blocks": [
      {
      "type": "brand-item",
      "name": "Brand Item",
      "props": [
        {
          "type": "brand",
          "id": "brand",
          "label":"Select Brand"
        }
      ]
    }
  ]
}

</settings>
<script>
import nmImage from "./../global/components/common/nm-image.vue";

export default {
  props: ["settings", "apiSDK", "serverProps"],
  components: {
    "nm-image": nmImage,
  },
  computed: {},
  data() {
    return {
      brands_data: this.serverProps?.brands || [],
      brandsLoaded: this.serverProps?.brandsLoaded || 0,
    };
  },
  initializeServerProps({ settings, apiSDK }) {
    const { brand_type, department } = settings?.props || {};
    const options = {
      ...(department && { department: department.value }),
      pageSize: settings.props.item_count.value,
    };
    if (brand_type.value === "department") {
      options.department = department.value;
    }
    if (settings.props.brand_type.value !== "handpicked") {
      return apiSDK.catalog
        .getBrands(options)
        .then((data) => {
          return {
            brands: data.items || [],
          };
        })
        .catch((ex) => {
          console.log(ex);
        });
    } else {
      return Promise.all(
        settings.blocks.map((block) => {
          return apiSDK.catalog
            .getBrandDetailBySlug({
              slug: block.props.brand.value.id,
            })
            .then((data) => {
              return data.items || [];
            })
            .catch((ex) => {
              console.log(ex);
            });
        })
      ).then((brands) => {
        if (brands && brands[0].uid) {
          return {
            brands: brands || [],
            brandsLoaded: brands.length,
          };
        } else {
          return {
            brands: [],
            brandsLoaded: 0,
          };
        }
      });
    }
  },
  mounted() {
    if (this.brands_data.length == 0) {
      this.loadBrands();
    }
  },
  methods: {
    loadBrands() {
      const { brand_type, department } = this.settings?.props || {};
      const options = {
        ...(department && { department: department.value }),
        pageSize: this.settings.props.item_count.value,
      };
      if (brand_type.value === "department") {
        options.department = department.value;
        this.brandsLoaded = 0;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const checkIsPreview = urlParams.get("isPreview");
      if (this.brands_data.length == 0 || checkIsPreview) {
        this.fetchBrands(options);
      }
    },
    fetchBrands(options) {
      if (this.settings.props.brand_type.value !== "handpicked") {
        this.isLoading = true;
        this.$apiSDK.catalog
          .getBrands(options)
          .then((data) => {
            this.brands_data = [...this.brands_data, ...data.items];
          })
          .catch((ex) => {
            console.error(ex);
          });
      } else {
        if (this.settings.blocks.length === this.brandsLoaded) return;
        this.brands = [];
        Promise.all(
          this.settings.blocks.map((block) => {
            if (!block?.props?.brand?.value) return;
            return this.$apiSDK.catalog
              .getBrandDetailBySlug({
                slug: block.props.brand.value.id,
                pageSize: this.settings.props.item_count.value,
              })
              .then((data) => {
                return data;
              });
          })
        )
          .then((brands) => {
            this.brands_data = brands.filter((b) => b?.name);
            this.brandsLoaded = brands.length;
          })
          .catch((ex) => {
            console.error(ex);
          });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.head-div {
  // display:flex;
  .section-heading {
    margin: 10px 0px 30px 0px;
  }
}
.item {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &__image {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    min-height: 230px;
    @media @mobile {
      min-height: 185px;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 99.5%;
      background-color: black;
      opacity: 0.3;
      border-radius: 3px;
      &:hover {
        opacity: 0.7;
      }
    }
    /deep/ .nm__img {
      width: 100%;
    }
  }
  &__brand-image {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    /deep/ .nm__img {
      width: 100%;
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAFWAQMAAADaFHqxAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACBJREFUaN7twTEBAAAAwqD1T20LL6AAAAAAAAAAAADgbSa+AAGGhRJaAAAAAElFTkSuQmCC");
    }
  }

  &__logo {
    position: absolute;
    bottom: 30px;
    width: 50px;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 50px;
  }
  &__name {
    font-size: 20px;
    margin-top: 10px;
    text-align: center;
    font-weight: bold;
    @media @mobile {
      font-size: 16px;
    }
  }
}
.group-cards {
  box-sizing: border-box;
  // margin-bottom: 20px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
  grid-auto-rows: auto;
  grid-gap: 1em;
  margin-bottom: 35px;
  @media only screen and (max-width: 801px) {
    grid-template-columns: repeat(auto-fill, minmax(25%, 1fr)) !important;
  }
  @media only screen and (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(32%, 1fr)) !important;
  }
}
</style>

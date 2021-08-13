<template>
  <div class="section-container slot-margin">
    <div class="gallery-container">
      <fdk-link
        :link="block.props.link.value"
        class="gallery-item"
        :class="{
          'gallery-item__one-item':
            settings.blocks.length + placeholderBlock === 1,
          'gallery-item__two-item':
            settings.blocks.length + placeholderBlock === 2,
          'gallery-item__three-item':
            settings.blocks.length + placeholderBlock === 3,
          'gallery-item__four-item':
            settings.blocks.length + placeholderBlock === 4,
          overlay:
            block.props.link.value.length > 0 ||
            block.props.caption.value.length > 0,
        }"
        v-for="(block, index) in settings.blocks"
        :key="index"
        :style="{ backgroundImage: `url(${block.props.image.value})` }"
      >
        <h3
          class="gallery-img-caption"
          v-if="block.props.caption && block.props.caption.value.length > 0"
        >
          {{ block.props.caption.value }}
        </h3>
      </fdk-link>
      <div
        class="placeholder-item"
        :class="{
          'gallery-item__one-item':
            settings.blocks.length + placeholderBlock === 1,
          'gallery-item__two-item':
            settings.blocks.length + placeholderBlock === 2,
          'gallery-item__three-item':
            settings.blocks.length + placeholderBlock === 3,
          'gallery-item__four-item':
            settings.blocks.length + placeholderBlock === 4,
        }"
        v-for="(block, index) in placeholderBlock"
        :key="'placeholder-' + index"
        :style="{ backgroundImage: `url('https://place-hold.it/600x500')` }"
      ></div>
    </div>
  </div>
</template>
<settings>
{
  "name": "gallery",
  "label": "Gallery",
  "props": [
       
        {
            "type": "range",
            "id": "item_count",
            "min": 1,
            "max": 4,
            "step": 1,
            "unit": "",
            "label": "No of items",
            "default": 4,
            "info": "Maximum items allowed per row"
        }
    ],
    "blocks": [
        {
        "type": "gallery_image",
        "name": "Image",
        "props": [
            {
                "type": "image_picker",
                "id": "image",
                "label": "Gallery Image",
                "default": "https://place-hold.it/600x500"
            },
            {
                "type": "text",
                "id": "caption",
                "label": "Image Caption",
                "default": ""
            },
            {
              "type": "url",
              "id": "link",
              "label": "Link",
              "default":"",
              "info":"Link to redirect"
            }
        ]
    }
  ],
   "preset":{
    "blocks":[
      {
        "name":"Image"
      },
       {
        "name":"Image"
      },
       {
        "name":"Image"
      },
       {
        "name":"Image"
      }
    ]
  }
}
</settings>
<style scoped lang="less">
.section-container {
  position: relative;
  overflow: hidden;
  list-style: none;
  padding: 0;
  z-index: 1;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
}

.gallery-container {
  display: flex;
  @media @tablet {
    flex-wrap: wrap;
  }
  .placeholder-item {
    border: 1px solid #00000026;
    &:last-child {
      border-left: none;
    }
    @media @tablet {
      &:last-child {
        border-left: 1px solid #00000026;
      }
      width: 50% !important;
    }
    @media @mobile {
      width: 100% !important;
    }
  }
  .overlay {
    position: relative;
    &::before {
      content: "";
      background: black;
      opacity: 0.3;
      position: absolute;
      width: 100%;
      height: 100%;
    }
    &:hover {
      cursor: pointer;
      &::before {
        opacity: 0.5;
      }
    }
  }
  .gallery-item {
    @media @tablet {
      width: 50% !important;
    }
    @media @mobile {
      width: 100% !important;
    }
  }

  .gallery-item,
  .placeholder-item {
    height: 500px;
    overflow: hidden;

    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: cover;
    &__one-item {
      width: 100%;
    }
    &__two-item {
      width: 50%;
    }
    &__three-item {
      width: 33.3333333334%;
    }
    &__four-item {
      width: 25%;
    }
    .gallery-img-caption {
      top: 50%;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 25px;
      font-weight: 700;
    }
  }
}
</style>
<script>
export default {
  props: ["settings"],
  data: function() {
    return {
      placeholderBlock:
        this.settings.props.item_count.value - this.settings.blocks.length,
    };
  },
};
</script>

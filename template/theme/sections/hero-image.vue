<template>
  <div
    :class="{
      'section-main-container': !settings.props.full_width.value,
      'full-width-section': settings.props.full_width.value,
    }"
  >
    <fdk-link :link="settings.props.button_link.value">
      <emerge-img
        v-if="settings.props.image.value"
        :src="settings.props.image.value"
        :sources="[]"
        class="hero__image"
      />
      <fdk-placeholder v-else type="banner-1" />
      <div
        class="overlay"
        :class="{
          overlay__left: settings.props.overlay_layout.value === 'left',
          overlay__center: settings.props.overlay_layout.value === 'center',
          overlay__right: settings.props.overlay_layout.value === 'right',
        }"
      >
        <div class="overlay__content">
          <img
            v-if="settings.props.overlay_image.value"
            class="overlay__image"
            :src="settings.props.overlay_image.value"
          />
          <h2
            class="overlay__text"
            v-if="settings.props.overlay_text.value"
            :style="{ color: settings.props.text_color.value }"
          >
            {{ settings.props.overlay_text.value }}
          </h2>
          <sm-button
            :backgroundcolortype="'primary'"
            :colortype="'primary'"
            :bordertype="'primary'"
            :padding="'primary'"
            :global_config="global_config"
            v-if="settings.props.button_text.value"
          >
            {{ settings.props.button_text.value }}
          </sm-button>
        </div>
      </div>
    </fdk-link>
  </div>
</template>
<!-- #region  -->

<settings>
{
    "name": "hero_image",
    "label": "Hero Image",
    "props": [
        {
            "id": "image",
            "type": "image_picker",
            "label": "Hero Image",
            "default": ""
        },
        {
            "id": "overlay_layout",
            "type": "select",
            "options": [
                {
                    "value": "left",
                    "text": "Align Left"
                },
                {
                    "value": "center",
                    "text": "Align Center"
                },
                {
                    "value": "right",
                    "text": "Align Right"
                }
            ],
            "default": "left",
            "label": "Overlay Layout",
            "info": "Alignment of overlay content"
        },
        {
            "type": "image_picker",
            "id": "overlay_image",
            "default": "",
            "label": "Overlay image",
            "info": "Overlay Image"
        },
        {
            "type": "text",
            "id": "overlay_text",
            "default": "",
            "label": "Overlay Text"
        },
        {
            "type": "color",
            "id": "text_color",
            "default": "#000",
            "label": "Text Color"
        },
        {
            "type": "url",
            "id": "button_link",
            "default": "",
            "label": "Redirect Link"
        },
        {
            "type": "text",
            "id": "button_text",
            "default": "Shop Now",
            "label": "Button Text"
        },
        {
            "type": "checkbox",
            "id": "full_width",
            "default": true,
            "label": "Full width",
            "info": "Check to allow items to take entire width of the viewport"
        }
    ]
}
</settings>
<!-- #endregion -->
<style scoped lang="less">
.hero__image {
  /deep/ .fy__img {
    width: 100%;
  }
}
.overlay {
  position: absolute;
  top: 55%;
  left: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
  display: flex;
  &__content {
    display: flex;
    flex-direction: column;
    padding: 0 @header-padding-desktop;
    width: 30%;
    align-items: center;
    text-align: center;
    @media @mobile {
      width: 50%;
      padding: 0;
    }
  }
  &__left {
    align-items: flex-start;
    justify-content: flex-start;
    @media @mobile {
      align-items: center;
      justify-content: center;
    }
    .overlay__content {
      align-items: flex-start;
      text-align: left;
      @media @mobile {
        align-items: center;
        text-align: center;
      }
    }
  }
  &__center {
    align-items: center;
    justify-content: center;
  }
  &__right {
    align-items: flex-end;
    justify-content: flex-end;
    @media @mobile {
      align-items: center;
      justify-content: center;
    }
    .overlay__content {
      align-items: flex-end;
      text-align: right;
      @media @mobile {
        align-items: center;
        text-align: center;
      }
    }
  }
  &__image {
    max-width: 100%;
    margin-bottom: 10px;
  }
  &__text {
    font-size: 40px;
    line-height: 49px;
    font-weight: 700;
    margin-bottom: 48px;
    @media @tablet {
      margin-bottom: 35px;
    }
    @media @mobile {
      font-size: 14px;
      margin-bottom: 30px;
    }
  }
}
</style>

<script>
import btn from "./../components/common/button.vue";
import emergeImage from "../global/components/common/emerge-image.vue";

export default {
  components: {
    "sm-button": btn,
    "emerge-img": emergeImage,
  },
  props: ["settings", "global_config"],
  watch: {
    settings: function(newVal, oldVal) {},
  },
  mounted() {},
  data: function() {
    return {
      // url: ""
    };
  },
};
</script>

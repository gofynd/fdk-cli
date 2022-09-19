<template>
  <div class="gallery-item-wrap">
    <fdk-link :link="block.props.link.value">
      <div class="common-card">
        <section>
          <!-- <div :style="`background: url(${block.props.image.value}) center center / cover no-repeat;width: 100%;height:100%`" v-if="block.props.image.value">
          </div>  -->
          <img
            style="width: 100%;height:100%"
            v-if="block.props.image.value"
            :src="block.props.image.value"
            alt=""
          />
          <fdk-placeholder v-else :type="'image'" />
        </section>
        <p v-if="block.props.caption && block.props.caption.value.length > 0">
          <!--Overlay container, donot remove -->
          {{ block.props.caption.value }}
        </p>
        <h4 v-if="block.props.caption && block.props.caption.value.length > 0">
          {{ block.props.caption.value }}
        </h4>
      </div>
    </fdk-link>
  </div>
</template>
<script>
import emergeImage from "../../global/components/common/emerge-image.vue";
export default {
  name: "gallery-item",
  components: {
    "emerge-image": emergeImage,
  },
  props: {
    block: {
      type: Object,
    },
  },
};
</script>
<style lang="less" scoped>
.gallery-item-wrap {
  overflow: hidden;
  .common-card {
    display: flex;
    flex-direction: column;
    position: relative;
    cursor: pointer;
    height: 100%;
    /deep/ .placeholder-svg {
      height: 99%;
      display: flex;
      svg {
        width: 100%;
      }
    }
    > section {
      width: 100%;
      height: 100%;
      // background: white;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      @media @tablet {
        min-height: 150px;
      }
      @media @mobile {
        min-height: 100px;
      }
    }

    p,
    h4 {
      display: flex;
      text-overflow: ellipsis;
      overflow: hidden;
      align-items: center;
      justify-content: center;
      color: @Black;
      line-height: 20px;
      font-size: 14px;
      font-weight: 400;
      text-transform: capitalize;
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      height: 0;
      transition: height 0.5s;
      @media @tablet {
        transition: unset;
        height: 45px;
      }
      @media @mobile {
        font-size: 12px;
      }
    }
    h4 {
      z-index: 2;
    }
    p {
      background: @White;
      opacity: 0.7;
      color: @White;
      // height: 45px;
    }
    &:hover {
      p,
      h4 {
        height: 45px;
      }
    }
  }
}
</style>

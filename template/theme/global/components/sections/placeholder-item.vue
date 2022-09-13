<template>
  <div class="card-item">
    <fdk-link :link="'#'">
      <div class="card-img">
        <div class="overlay-2"></div>
        <!-- <whitesplash-image class="group-item-img" :src="getImageURL" :sources="[{width: 209}]"/> -->
        <fdk-placeholder :type="type" />
        <div class="logo-wrapper">
          <div class="collection_desc">
            <div class="card-desc cl-content text-center">
              <span class="ukt-title clrWhite" :title="text">{{ text }}</span>
            </div>
          </div>
        </div>
      </div>
    </fdk-link>
  </div>
</template>
<style lang="less" scoped>
.text-center {
  text-align: center;
}

.clrWhite {
  color: @White !important;
}
.card-item {
  border: 0 !important;
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  height: 100%;
  cursor: pointer;
  min-height: 300px;
  @media @mobile {
    min-height: 200px;
  }

  a {
    text-decoration: none;
  }
  /deep/.card-img {
    position: relative;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-shadow: 9px 6px 10px rgba(0, 0, 0, 0.2);

    @media @mobile {
      box-shadow: none;
    }
    .group-item-img {
      min-height: 321px;
      @media @tablet {
        min-height: 250px;
      }
    }
    img {
      border-radius: 8px;
      animation: fadeIn 0.5s ease;
      width: 100%;
    }

    .PDP img {
      box-shadow: none;
    }

    .bg-gradient {
      background-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.14),
        rgba(0, 0, 0, 0.6)
      );
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 3px);
      background-size: cover;
      border-radius: @border-radius;
      opacity: 0.4;
    }
    .item-selection {
      position: absolute;
      top: 10px;
      left: 10px;
    }
    .item-sets {
      position: absolute;
      right: 0px;
      top: 0px;
    }
  }

  .logo-wrapper {
    bottom: 0;
    position: absolute;
    display: flex;
    width: 100%;
    height: 80px;
    transition: all 0.5s;
    background: transparent linear-gradient(180deg, transparent, #000) 0 0
      no-repeat padding-box;
    color: #fff;
    border-radius: 8px;
    padding: 20px 0 0 0px;
    box-sizing: border-box;
  }
  .card-logo {
    /* position: absolute; */
    bottom: 30px;
    width: 50px;
    /* left: 50%; */
    /* transform: translate(-50%,-50%); */
    height: 50px;
    margin-left: 10px;
    /deep/ .fy__img {
      width: 50px;
      border-radius: 8px;
      @media @mobile {
        margin-left: 8px;
      }
    }
  }
  .collection_desc {
    font-size: 16px;
    font-weight: 700;
    // margin-left: 10px;
    width: 70%;
    display: flex;
    align-items: center;
    height: 50px;
    .ukt-title {
      text-transform: uppercase;
      width: auto;
      display: block;
      white-space: pre-wrap;
      text-align: left;
      font-size: 14px;
      line-height: 16px;
    }
    .cl-img {
      width: 50px;
      left: 50%;
      transform: translate(-50%, 0%);
      height: 50px;
      position: relative;
    }
    .cl-content {
      white-space: normal !important;
      margin: 0px 10px;
      width: auto;

      .card-count {
        padding: 0px;
        margin-top: 10px;
      }
    }
  }
  .collection_desc.center {
    width: 100%;
    margin: 0;
    display: flex;
    align-items: center;
    .cl-content {
      white-space: normal !important;
      padding: 0px 10px 0 10px;
      width: 100%;
      box-sizing: border-box;
      margin: 0 auto;
    }
    .ukt-title {
      width: 100%;
      text-align: center;
    }
  }

  .overlay-2 {
    background: #000000;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }
  &:hover {
    .logo-wrapper {
      bottom: 30%;
      opacity: 1 !important;
      z-index: 2;
    }
    .overlay-2 {
      opacity: 0.8 !important;
    }
  }
}
</style>

<script>
export default {
  name: "placeholder-item",

  props: {
    type: {
      type: String,
    },
    text: {
      type: String,
    },
  },
};
</script>

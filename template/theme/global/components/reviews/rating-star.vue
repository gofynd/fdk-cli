<template>
  <div
    class="rating-box"
    :class="{
      large: size === 'large',
      medium: size === 'medium',
      small: size === 'small',
    }"
  >
    <span> {{ stars }} </span>
    <img :src="STAR_IMG" />
  </div>
</template>

<script>
export default {
  name: "rating-star",
  props: {
    stars: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: "large",
    },
  },
  data() {
    return {
      STAR_IMG:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTYuNSA5LjQzOWwtMy42NzQgMi4yMy45NC00LjI2LTMuMjEtMi44ODMgNC4yNTQtLjQwNEw2LjUuMTEybDEuNjkgNC4wMSA0LjI1NC40MDQtMy4yMSAyLjg4Mi45NCA0LjI2eiIvPjwvc3ZnPg==",
    };
  },
};
</script>

<style lang="less" scoped>
.rating-box {
  line-height: normal;
  display: inline-block;
  color: #fff;
  border-radius: 45px;
  font-weight: 700;
  font-size: 16px;
  vertical-align: middle;
  background-color: #58c45e;
  text-align: center;
  img {
    margin: 2px 0 0 3px;
    height: 12px;
  }
}
.large {
  padding: 8px 10px 8px 10px;
  width: 50px;
  height: unset;
}
.small {
  padding: 0;
  font-size: 12px;
  display: inline-flex;
  border-radius: 10px;
  padding: 2px 7px;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 24px;
  img {
    margin: 0;
    margin-left: 1px;
    height: 10px;
  }
}
.medium {
  padding: 0;
  font-size: 12px;
  display: inline-flex;
  border-radius: 10px;
  padding: 2px 7px;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 34px;
  img {
    margin: 0;
    margin-left: 1px;
    height: 10px;
  }
}
</style>

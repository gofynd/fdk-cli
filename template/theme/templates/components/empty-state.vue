<template>
  <div class="container">
    <div class="empty-state">
      <img src="./../../assets/images/no-result.svg" />
      <div class="no-items">
        <p class="title">{{ title }}</p>
        <p class="subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <fdk-link link="/">
        <namaste-button class="back-btn">
          <span style="margin-right:10px"> &#8592; </span>
          <span>Go to home</span>
        </namaste-button>
      </fdk-link>
    </div>
  </div>
</template>

<script>
import button from '../../global/components/common/button';
export default {
  components: {
    'namaste-button': button,
  },
  props: ['title', 'subtitle'],
  data: function data() {
    return {
      text: 'Empty',
    };
  },

  methods: {
    exampleMethod: function exampleMethod() {
      alert('Empty');
    },
  },
  computed: {},
  mounted: function mounted() {
    console.log('Component Mounted');
  },
  destroyed: function destroyed() {
    console.log('Component Destroyed');
  },
};
</script>

<style lang="less" scoped>
.container {
  width: 1200px;
  margin: 0 auto;
  height: 500px;
  position: relative;
  margin-top: -50px;
  @media @mobile {
    width: 100%;
  }
  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    display: flex;
    flex-direction: column;
    .title {
      font-size: 20px;
      margin: 10px;
      color: #41434c;
      font-weight: 700;
      font-family: roboto condensed;
    }
    .back-btn {
      margin-top: 10px;
      width: 100%;
    }
  }
}
</style>

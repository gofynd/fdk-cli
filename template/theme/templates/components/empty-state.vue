<template>
  <div class="empty-container">
    <div class="empty-state">
      <img src="./../../assets/images/empty-state.png" />
      <div class="no-items">
        <p class="title">{{ getTitle }}</p>
        <p class="subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <fdk-link :link="getButtonLink">
        <button class="back-btn" :type="'secondary'">
          <span>{{ getButtonText }}</span>
        </button>
      </fdk-link>
    </div>
  </div>
</template>

<script>
import button from "./../../templates/components/button";
export default {
  components: {
    button: button,
  },
  props: ["title", "subtitle", "button", "context"],
  computed: {
    getTitle() {
      if (this.context) {
        const { title } = this.context;
        if (title) {
          return title;
        }
      }
      return this.title || "";
    },

    getButtonLink() {
      if (this.context) {
        const { button } = this.context;
        if (button && button.link) {
          return button.link;
        }
      }
      return "/";
    },
    getButtonText() {
      if (this.context) {
        const { button } = this.context;
        if (button && button.text) {
          return button.text;
        }
      }
      return "Go to Home";
    },
  },
  data: function data() {
    return {
      text: "Empty",
    };
  },
};
</script>

<style lang="less" scoped>
a {
  display: flex;
  justify-content: center;
}
.empty-container {
  margin: 0 auto;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  @media @mobile {
    width: 100%;
  }
  .empty-state {
    text-align: center;
    img {
      width: 60%;
    }
    .title {
      font-size: 20px;
      margin: 15px 10px;
      color: #000;
      font-weight: 700;
    }
    .back-btn {
      margin-top: 10px;
      height: 40px;
      width: 250px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
}
</style>

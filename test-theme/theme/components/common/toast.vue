<template>
  <div :class="['toast', { 'show': show, 'hide': !show }]" :id="id">{{ content }}</div>
</template>

<script>
module.exports = {
  name: "fdk-popup",
  props: {
    content: {
      type: String
    },
    id: {
      type: String
    }
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    showToast: function showToast() {
      this.show = true;
      const self = this;
      setTimeout(function() {
        self.show = false;
      }, 3000);
    }
  },
};
</script>

<style lang="less" scoped>
.toast {
  visibility: hidden;
  min-width: 250px;
  background: @primary-color;
  color: #fff;
  font-weight: bold;
  text-align: center;
  border-radius: 4px;
  padding: 15px;
  position: fixed;
  z-index: 5;
  left: 50%;
  transform: translateX(-50%);
  top: 25%;
  font-size: 17px;
  opacity: 0.9;
  text-transform: capitalize;
  word-wrap: break-word;
}

.show {
  visibility: visible;
  -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

.hide {
  visibility: hidden;
  -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}
@keyframes fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@media screen and (max-width: 360px) {
  .toast {
    top: 26%;
  }
}
</style>

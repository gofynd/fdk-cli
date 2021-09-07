<template>
  <div class="toast" :id="id">{{ content }}</div>
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
  methods: {
    showToast: function showToast() {
      var x = document.getElementById(this.id);
      x.className = "toast show";
      setTimeout(function() {
        x.className = x.className.replace("toast show", "toast hide");
      }, 3000);
    }
  },
  data: function data() {
    return {};
  },
  mounted() {}
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
  top: 20%;
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

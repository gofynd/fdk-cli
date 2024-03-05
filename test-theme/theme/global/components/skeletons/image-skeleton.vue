<template>
    <div class="card">
      <canvas :width="width" :height="height" />
      <canvas class="mobile-canvas" :width="width" :height="mobileHeight" />
    </div>
  </template>
  
  <script>
  export default {
    props: {
      aspectRatio: {
        type: Number,
        default: 1,
      },
      mobileAspectRatio: {
        type: Number,
        default: 1,
      },
      width: {
        type: Number,
        default: 100,
      },
    },
    computed: {
      height() {
        return Math.floor(this.width / this.aspectRatio);
      },
      mobileHeight() {
        return Math.floor(
          this.width / (this.mobileAspectRatio || this.aspectRatio)
        );
      },
    },
  };
  </script>
  
  <style lang="less" scoped>
  .card {
    z-index: unset;
    position: relative;
    width: 100%;
    height: fit-content;
    background-color: #ececec;
    overflow: hidden;
  
    canvas {
      display: block;
      width: 100%;
      transform: translateX(-100%);
      background: -webkit-gradient(
        linear,
        left top,
        right top,
        from(transparent),
        color-stop(rgba(255, 255, 255, 0.5)),
        to(transparent)
      );
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.5),
        transparent
      );
      animation: loading 0.8s infinite;
  
      @media @mobile {
        display: none;
      }
    }
  
    .mobile-canvas {
      display: none;
  
      @media @mobile {
        display: block;
      }
    }
  }
  
  @keyframes loading {
    100% {
      transform: translateX(100%);
    }
  }
  </style>
  

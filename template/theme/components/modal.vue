<template>
  <transition name="modal" v-if="isOpen">
    <div
      class="modal"
      ref="modal"
      tabindex="0"
      @keydown.esc="closeDialog"
      v-bind:class="modalClass"
    >
      <div class="modal-container" v-click-outside="closeDialog">
        <div class="modal-header">
          <div class="modal-title">{{ title }}</div>
          <div class="cross" @click="closeDialog" v-if="isCancelable">
            <IosCloseIcon w="2rem" h="2rem" />
          </div>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="less" scoped>
.modal {
  position: fixed;
  top: 0;
  height: 100%;
  left: 0;
  right: 0;
  z-index: 16;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: rgba(82, 78, 78, 0.52);
  transition: opacity 0.25s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  @media @mobile {
    background-color: @color-white;
    height: 100%;
  }

  .modal-container {
    padding: 4px 25px;
    background-color: @color-white;
    min-width: 300px;
    border: 1px solid @color-white;
    border-radius: 4px;
    min-height: 100px;
    max-width: 720px;
    position: relative;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background-color: #ffffff;
    }
    /* Track */
    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
      background-color: #ffffff;
    }
    /* Handle */
    &::-webkit-scrollbar-thumb {
      border-radius: 2.5px;
      background-color: #6b6b6b;
    }

    .modal-header {
      padding: 10px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      @media @mobile {
        padding: 30px 0 10px 0;
      }
    }
    .modal-body {
      margin-top: 20px;
      font-size: 1.4rem;
    }
    .cross {
      cursor: pointer;
      img {
        width: 17px;
      }
    }
    .modal-title {
      margin: auto;
      text-align: center;
      color: @color-black;
      font-size: 20px;
      font-weight: bold;
    }
  }
}

@media @mobile {
  .modal {
    .modal-container {
      height: 98vh;
      width: 100%;
    }
  }
}
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}
</style>

<script>
import IosCloseIcon from "vue-ionicons/dist/ios-close.vue";
export default {
  name: "modal",
  components: {
    IosCloseIcon,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    modalClass: {
      type: String,
      default: null,
      required: false,
    },
    isCancelable: {
      type: Boolean,
      default: true,
    },
    childHandleFocus: {
      type: Boolean,
      default: false,
    },
  },
  updated() {
    if (this.isOpen && !this.childHandleFocus) {
      if (this.$refs.modal) {
        this.$refs.modal.focus();
      }
    }
  },
  methods: {
    closeDialog() {
      if (this.isCancelable) {
        this.$emit("closedialog");
      }
    },
  },
  mounted() {
    this.$root.$el.append(this.$el);
  },

  destroyed() {
    if (this.$el && this.$el.parentNode && this.$el.nodeName !== "#comment") {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
};
</script>

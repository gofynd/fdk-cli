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
          <div class="modal-title bold-sm">{{ title }}</div>
          <div class="cross" @click="closeDialog" v-if="isCancelable">
            <fdk-inline-svg :src="'cross-black'"></fdk-inline-svg>
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
  bottom: 0;
  left: 0;
  right: 0;
  z-index: @dialog;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: rgba(82, 78, 78, 0.52);
  transition: opacity 0.25s ease;

  .flex-center();
  @media @mobile {
    background-color: @White;
    height: 100%;
  }

  .modal-container {
    padding: 4px 25px;
    background-color: @White;
    min-width: 300px;
    border: 1px solid @White;
    border-radius: @border-radius;
    min-height: 100px;
    max-width: 720px;
    max-height: 720px;
    overflow: auto;
    .modal-header {
      padding: 10px 0;
      .flex-center();
    }
    .cross {
      span {
        cursor: pointer;
      }
    }
    .modal-title {
      margin: auto;
      text-align: center;
      color: @Mako;
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

export default {
  name: "modal",
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
  components: {},
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

<template>
  <div class="update-compare-container">
    <div class="overlay" @click="hideModal"></div>
    <transition name="slide">
      <div class="update-compare-modal">
        <div class="modal-title">
          <div class="cross-btn" v-on:click="hideModal">
            <img src="./../../assets/images/close-icon.png" />
          </div>
          <div class="warning">
            <img src="./../../assets/images/compare-warning.png" />
          </div>
          <div class="bold-md primary-text">{{ compare_msg.title }}</div>
          <!-- <div class="regular-md secondary-text">You can compare upto 3 products at a time</div> -->
        </div>
        <div class="modal-content">
          <fdk-compare-action>
            <template slot-scope="compareAction">
              <div class="button-container">
                <div>
                  <jm-button
                    :backgroundcolortype="'tertiary'"
                    :bordertype="'tertiary'"
                    :colortype="'tertiary'"
                    :btntype="'tertiary'"
                    :global_config="global_config"
                    @click="
                      reset(compareAction.addCompare, compareAction.removeCompare)
                    "
                    >Reset
                  </jm-button>
                </div>
                <div>
                  <jm-button 
                    :backgroundcolortype="'tertiary'"
                    :bordertype="'tertiary'"
                    :colortype="'tertiary'"
                    :btntype="'tertiary'"
                    :global_config="global_config"
                    @click="goToCompare"
                    >Go to Compare
                  </jm-button>
                </div>
              </div>
            </template>
          </fdk-compare-action>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import jmbtn from "./../../components/common/button.vue";
export default {
  name: "compare-action-modal",
  props: {
    compare_slugs: {
      default: [],
    },
    compare_msg: {},
    product_uid: {},
    global_config: {}
  },
  components: {
    "jm-button": jmbtn,
  },
  methods: {
    hideModal() {
      this.$emit("hide-compare-action-modal");
    },
    reset(addHandler, removeHandler) {
      //remove all compare products first
      for (let i = 0; i < this.compare_slugs.length; i++) {
        removeHandler(this.compare_slugs[i], false);
      }

      //add current product uid
      addHandler(this.product_uid)
        .then((res) => {
          //todo
          this.goToCompare();
        })
        .catch((err) => {
          //show error
        });
    },
    goToCompare() {
      this.$router.push({ path: "/compare" });
    },
  },
};
</script>

<style lang="less" scoped>
.update-compare-container {
  margin-top: 5px;

  .update-compare-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    box-shadow: 0px -1px 2px 1px #eee;
    max-width: 400px;
    width: 90%;
    height: 350px;
    border-radius: 3px;
    z-index: 10;
    overflow: hidden;
    background-color: #fff;
    transition: all 0.25s ease;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 10px;
    overflow-y: hidden;
    z-index: 12;
    .modal-title {
      .primary-text {
        // margin: 20px 0px;
        text-align: center;
        line-height: 27px;
        padding: 0 70px;
        @media @mobile {
          padding: 0 20px;
        }
      }
      .cross-btn {
        cursor: pointer;
        display: flex;
        align-self: flex-end;
        position: absolute;
        right: 20px;
        top: 20px;
        img {
          width: 16px;
        }
      }
      .warning {
        text-align: center;
        img {
          margin: auto;
          width: 90%;
        }
      }
    }

    .button-container {
      width: 78%;
      display: flex;
      height: 100px;
      justify-content: space-between;
      align-items: center;
      bottom: 0;
      box-sizing: border-box;
      margin: 0 auto;
      button {
        width: 100%;
      }
      &> :first-child { 
        flex:0 0 40%;
      }
      &> :nth-child(2) { 
        flex:0 0 55%;
      }
      // .button {
      //   width: 150px;
      //   border-radius: 4px;
      //   opacity: 1;
      //   display: flex;
      //   font-size: 14px;
      //   justify-content: center;
      //   align-items: center;
      // }
      // .cancel {
      //   color: #383838;
      //   border: 1px solid #cecece;
      //   margin-right: 10px;
      // }
    }
  }
}

.overlay {
  background-color: #000;
  opacity: 0.75;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 11;
}

//animations

.slide-leave-active,
.slide-enter-active {
  transition: 0.5s;
}
.slide-enter {
  transform: translate(0, 100%);
}
.slide-leave-to {
  transform: translate(0, 100%);
}
</style>

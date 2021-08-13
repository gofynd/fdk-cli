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
          <div class="bold-md primary-text">{{compare_msg.title}}</div>
          <!-- <div class="regular-md secondary-text">You can compare upto 3 products at a time</div> -->
        </div>
        <div class="modal-content">
          <fdk-compare-action>
            <template slot-scope="compareAction">
              <div class="button-container">
                <jm-button
                  :backgroundcolortype="'secondary'"
                  :bordertype="'secondary'"
                  class="button"
                  @click="reset(compareAction.addCompare,compareAction.removeCompare)"
                >Reset</jm-button>
                <jm-button class="button" @click="goToCompare">Go to Compare</jm-button>
              </div>
            </template>
          </fdk-compare-action>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import jmbtn from "./../components/common/button.vue";
export default {
  name: "compare-action-modal",
  props: {
    compare_uids: {
      default: []
    },
    compare_msg: {},
    product_uid: {}
  },
  components: {
    "jm-button": jmbtn
  },
  watch: {},
  data() {
    return {};
  },
  computed: {},
  mounted() {},
  methods: {
    hideModal() {
      this.$emit("hide-compare-action-modal");
    },
    reset(addHandler, removeHandler) {
      //remove all compare products first
      for (let i = 0; i < this.compare_uids.length; i++) {
        removeHandler(this.compare_uids[i], false);
      }

      //add current product uid
      addHandler(this.product_uid)
        .then(res => {
          //todo
          this.goToCompare();
        })
        .catch(err => {
          //show error
        });
    },
    goToCompare() {
      this.$router.push({ path: "/compare" });
    }
  }
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
        margin: 20px 0px;
        text-align: center;
      }
       .cross-btn {
          cursor: pointer;
          display: flex;
          align-self: flex-end;
          position: absolute;
          right: 5px;
          top: 5px;
          img {
            width: 12px;
          }
        }
        .warning{
          img{
            text-align: center;
            margin: auto;
            width: 100%;
          }
        }
    }

    .button-container {
      width: 100%;
      display: flex;
      height: 100px;
      justify-content: space-evenly;
      align-items: center;
      position: absolute;
      bottom: 0px;
      .button {
        width: 150px;;
        border-radius: 4px;
        opacity: 1;
        display: flex;
        font-size: 14px;
        justify-content: center;
        align-items: center;
      }
      .cancel {
        color: #383838;
        border: 1px solid #cecece;
        margin-right: 10px;
      }
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

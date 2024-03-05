<template>
  <fdk-product-request>
    <template slot-scope="productRequest">
      <div class="main-container">
        <div class="form-item">
          <span class="form-title regular-xs">Photos</span>
          <div v-if="medias && medias.length > 0">
            <div class="img-container">
              <div
                class="image-cont"
                v-for="(img, index) in medias"
                :key="index"
              >
                <img class="image" :src="img" />
                <div class="delete-btn" @click.stop="deleteImage(index)">
                  <svg-wrapper :svg_src="'cross-grey'"></svg-wrapper>
                </div>
              </div>
            </div>
            <label class="bold-xs add-more-link ukt-links">
              Add More Photos
              <input
                type="file"
                @change="openImageUploader($event, productRequest)"
              />
            </label>
          </div>
          <div v-else>
            <label class="container">
              <svg-wrapper :svg_src="'camera'"></svg-wrapper>
              <div class="bold-sm">Add Photos</div>
              <input
                type="file"
                @change="openImageUploader($event, productRequest)"
              />
            </label>
          </div>
        </div>
        <div
          v-for="(item, index) in formFields"
          :key="'form__' + index"
          class="form-item"
        >
          <span class="form-title regular-xs">{{ item.label }}</span>
          <div class="form-input">
            <input
              class="input"
              :ref="item.name"
              :type="item.type"
              v-model="item.value"
              :name="item.name"
              :autocomplete="'off'"
            />
          </div>
        </div>
        <div class="form-item">
          <span class="form-title regular-xs">Size</span>
          <div class="flex-align" v-for="(item, index) in size" :key="index">
            <div class="form-input size-input">
              <input
                class="input"
                type="text"
                v-model="item.size"
                name="size"
              />
            </div>
            <div class="qty-control">
              <button
                v-if="item.quantity != 1"
                @click.stop="incrDecrQuantity(-1, index)"
                class="operator"
              >
                <svg-wrapper :svg_src="'dec'"></svg-wrapper>
              </button>
              <button
                v-if="item.quantity === 1"
                @click.stop="deleteSizeField('size', index)"
                class="operator"
              >
                <svg-wrapper :svg_src="'delete'"></svg-wrapper>
              </button>
              <div class="qty-amount">
                <input
                  type="text"
                  name="qty"
                  class="light-xs"
                  v-model="item.quantity"
                  autocomplete="off"
                />
              </div>
              <button @click.stop="incrDecrQuantity(1, index)" class="operator">
                <svg-wrapper :svg_src="'inc'"></svg-wrapper>
              </button>
            </div>
          </div>
          <div
            class="bold-xs add-size-link ukt-links"
            @click.stop="addSizeField('size')"
          >
            Add Size
          </div>
        </div>
        <div v-if="showError" class="error-msg regular-sm">
          {{ errorMessage }}
        </div>
        <div class="submit-btn">
          <button
            class="primary-btn btn bold-sm"
            :type="secondary"
            @click.stop="onProductRequest(productRequest)"
          >
            submit
          </button>
        </div>
      </div>
    </template>
  </fdk-product-request>
</template>
<script>
import SvgWrapper from './../../../components/common/svg-wrapper.vue';
export default {
  name: 'product-request',
  components: {
    "svg-wrapper": SvgWrapper
  },
  data() {
    return {
      formFields: [
        {
          label: 'product code',
          name: 'item_id',
          type: 'text',
          value: '',
        },
        {
          label: 'brand',
          name: 'brand_name',
          type: 'text',
          value:
            (this.product && this.product.brand && this.product.brand.name) ||
            '',
        },
        {
          label: 'description',
          name: 'description',
          type: 'text',
          value: '',
        },
      ],
      size: this.getInitSizeArray(),
      medias: [],
      showError: false,
      errorMessage: '',
    }
  },
  props: {
    product: {
      type: Object,
    },
    isPdpPage: {
      default: false,
      type: Boolean,
    },
  },
  mounted() {
    if (this.isPdpPage) {
      this.medias = this.product.medias.map((res) => {
        return res.url
      })
    }
  },
  methods: {
    isFormValid() {
      if (this.formFields[0].value === '' && this.formFields[2].value === '') {
        this.showError = true
        this.errorMessage = 'please enter product code or description'
        return false
      } else if (!this.isSizeDetailsValid()) {
        this.showError = true
        this.errorMessage = 'please enter size details'
        return false
      }
       this.showError = false
      this.errorMessage = ''
      return true
    },
    isSizeDetailsValid() {
      if (this.getSizeDetails()?.findIndex((item) => item?.size == '') !== -1) {
        return false
      } else if(!this.getSizeDetails().length){
        return false;
      } else {
        return true
      }
    },
    onProductRequest(productRequest) {
      let data = this.createPayload()
      if (this.isFormValid()) {
        productRequest
          .submitProductRequest(data)
          .then((res) => {
            this.showError = false
            this.$emit('formSubmitted')
          })
          .catch((err) => {
            this.showError = true
            this.errorMessage = err
            throw { message: err }
          })
      } else {
        return
      }
    },
    createPayload() {
      return {
        brand: this.formFields[1].value,
        description: this.formFields[2].value,
        medias: this.medias,
        product_identifier: this.formFields[0].value,
        item_id: (this.product && this.product.uid) || '',
        size_details: this.getSizeDetails(),
      }
    },
    getSizeDetails() {
      let size_details = []
      for (let index in this.size) {
        size_details.push({
          quantity: this.size[index].quantity,
          size: this.size[index].size,
        })
      }
      return size_details
    },
    openImageUploader(e, productRequest) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      return productRequest.uploadImageToGrindor(files).then((res) => {
        let mediaUrl = res.cdn.url
        this.medias.push(mediaUrl)
      })
    },
    getInitSizeArray() {
      return [
        {
          size: '',
          quantity: 1,
        },
      ]
    },
    addSizeField(fieldType) {
      let addOptions = {}
      addOptions['size'] = {
        size: '',
        quantity: 1,
      }
      this[fieldType] = this[fieldType].concat(addOptions[fieldType])
    },
    deleteSizeField(fieldType, index) {
      this[fieldType].splice(index, 1)
    },
    deleteImage(index) {
      this.medias.splice(index, 1)
    },
    incrDecrQuantity(val, index) {
      this.size[index].quantity = this.size[index].quantity + val
    },
  },
}
</script>

<style lang="less" scoped>
.main-container {
  .form-item {
    padding: 8px 0px;
    position: relative;
    .form-title {
      color: @DustyGray2;
      text-transform: capitalize;
      padding-bottom: 5px;
    }
    .form-input {
      /*border: 1px solid @FormBorder;*/
      border-radius: 4px;
      height: 42px;
      display: flex;
      align-items: center;
      background-color: #f2f2f2;
      margin: 5px 0px 0px 0px;
      input {
        outline: none;
        border: none;
        width: 100%;
        margin-left: 10px;
        background-color: #f2f2f2;
      }
    }
    .size-input {
      width: 60%;
    }
    .img-container {
      display: flex;
      padding: 10px 10px 10px 0;
      border-radius: 2px;
      flex-wrap: wrap;
      .image-cont {
        margin: 12px 12px 0px 0px;
        /*border: 1px solid @DoveGray;*/
        position: relative;
        .image {
          width: 70px;
          border-radius: 4px;
        }
        .delete-btn {
          top: 0;
          right: 0;
          position: absolute;
          cursor: pointer;
          z-index: 1;
        }
      }
    }
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      cursor: pointer;
    }
  }
}
.error-msg {
  color: @Required;
  padding: 10px 0;
  text-align: center;
}
.submit-btn {
  padding: 10px 0px;
  position: sticky;
  width: 100%;
  bottom: 0;
  .btn {
    padding: 15px 0px;
    border-radius: @border-radius;
    cursor: pointer;
    width: 100%;
    border: none;
    text-transform: uppercase;
    background: @PrimaryColor;
    color: #ffffff;
  }
}

input[type='file'] {
  display: none;
}
.add-more-link {
  top: 13px;
  right: 0px;
  position: absolute;
  cursor: pointer;
  font-size: 12px !important;
}
.add-size-link {
  padding: 0px;
  cursor: pointer;
  display: flex;
  justify-content: left;
  font-size: 12px !important;
}
.flex-align {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
}
.qty-control {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid @LightGray;
  border-radius: @border-radius;
  .operator {
    cursor: pointer;
    background: @White;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    padding: 2px;
    .operation {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  button {
    &:hover {
      background: @LightGray;
    }
    &:disabled {
      background-color: @Alabaster2;
      cursor: default;
    }
  }
  .qty-amount {
    // padding: 3px;
    width: 38px;
    height: 25px;
    border-radius: @border-radius;
    border-left: 1px solid @LightGray;
    border-right: 1px solid @LightGray;
    margin: 0px;
    background-color: @Alabaster2;
    input {
      border: none;
      width: 100%;
      vertical-align: middle;
      text-align: center;
      background-color: @Alabaster2;
      padding: 2px 0px;
      &:focus {
        outline: none;
      }
    }
  }
}
</style>
